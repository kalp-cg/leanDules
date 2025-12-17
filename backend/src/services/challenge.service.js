const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
// const { getIO, sendToUser } = require('../sockets/index'); // Moved to lazy load to avoid circular dependency

/**
 * Challenge Service - Handles both async and instant (real-time) challenges
 * PRD Requirement: Asynchronous and instant duel challenges
 */

class ChallengeService {
  /**
   * Create a challenge (async or instant)
   */
  async createChallenge(data, challengerId) {
    const {
      opponentIds = [],
      questionSetId,
      type = 'async', // 'async' or 'instant'
      settings = {},
    } = data;

    // Validate opponents exist
    const opponents = await prisma.user.findMany({
      where: { id: { in: opponentIds } },
    });

    if (opponents.length !== opponentIds.length) {
      throw new Error('Some opponents not found');
    }

    // Validate question set if provided
    let questionSet = null;
    if (questionSetId) {
      questionSet = await prisma.questionSet.findUnique({
        where: { id: questionSetId },
      });

      if (!questionSet) {
        throw new Error('Question set not found');
      }
    }

    // Default settings
    const defaultSettings = {
      numQuestions: settings.numQuestions || 10,
      timeLimit: settings.timeLimit || 30, // seconds per question
      topicIds: settings.topicIds || [],
      difficulty: settings.difficulty || 'medium',
      allowSpectators: settings.allowSpectators || false,
    };

    const challenge = await prisma.challenge.create({
      data: {
        challengerId,
        questionSetId,
        type,
        settings: defaultSettings,
        status: 'pending',
        participants: {
          create: [
            {
              userId: challengerId,
              status: 'accepted'
            },
            ...opponentIds.map(id => ({
              userId: id,
              status: 'invited'
            }))
          ]
        }
      },
      include: {
        challenger: {
          select: {
            id: true,
            fullName: true,
            avatarUrl: true,
            rating: true,
          },
        },
      },
    });

    // Create notifications for opponents
    await Promise.all(
      opponentIds.map(async (opponentId) => {
        const notification = await prisma.notification.create({
          data: {
            userId: opponentId,
            message: `${challenge.challenger.fullName || 'Someone'} challenged you to a ${type} duel!`,
            type: 'challenge_received',
            data: { challengeId: challenge.id },
          },
        });

        // Send real-time notification
        try {
          const { getIO, sendToUser } = require('../sockets/index');
          const io = getIO();
          sendToUser(io, opponentId, 'notification', notification);
          
          // Also emit specific challenge event
          sendToUser(io, opponentId, 'challenge:received', {
            challengeId: challenge.id,
            challenger: challenge.challenger,
            type: type,
            settings: defaultSettings
          });
        } catch (e) {
          console.error('Socket notification failed:', e.message);
        }
      })
    );

    return challenge;
  }

  /**
   * Get challenge by ID
   */
  async getChallengeById(id, userId) {
    const challenge = await prisma.challenge.findUnique({
      where: { id: parseInt(id) },
      include: {
        participants: true,
        challenger: {
          select: {
            id: true,
            fullName: true,
            avatarUrl: true,
            rating: true,
          },
        },
        questionSet: {
          select: {
            id: true,
            name: true,
            items: {
              select: {
                questionId: true
              }
            }
          },
        },
      },
    });

    if (!challenge) {
      throw new Error('Challenge not found');
    }

    // Check if user is participant
    const isParticipant =
      challenge.challengerId === parseInt(userId) ||
      challenge.participants.some(p => p.userId === parseInt(userId));

    if (!isParticipant && !challenge.settings.allowSpectators) {
      throw new Error('Access denied');
    }

    // Get opponent details
    const opponents = await prisma.user.findMany({
      where: { id: { in: challenge.opponentIds } },
      select: {
        id: true,
        fullName: true,
        avatarUrl: true,
        rating: true,
      },
    });

    return {
      ...challenge,
      opponents,
      isParticipant,
    };
  }

  /**
   * Accept a challenge (for async challenges)
   */
  async acceptChallenge(id, userId) {
    const challenge = await prisma.challenge.findUnique({
      where: { id: parseInt(id) },
      include: {
        participants: true
      }
    });

    if (!challenge) {
      throw new Error('Challenge not found');
    }

    // Check if user is an opponent
    const isParticipant = challenge.participants.some(p => p.userId === parseInt(userId));
    if (!isParticipant) {
      throw new Error('You are not invited to this challenge');
    }

    // Update status
    const updated = await prisma.challenge.update({
      where: { id: parseInt(id) },
      data: {
        status: 'active',
      },
    });

    // Notify challenger
    await prisma.notification.create({
      data: {
        userId: challenge.challengerId,
        message: 'Your challenge was accepted!',
        type: 'challenge_accepted',
        data: { challengeId: challenge.id },
      },
    });

    return updated;
  }

  /**
   * Decline a challenge
   */
  async declineChallenge(id, userId) {
    const challenge = await prisma.challenge.findUnique({
      where: { id: parseInt(id) },
    });

    if (!challenge) {
      throw new Error('Challenge not found');
    }

    if (!challenge.opponentIds.includes(userId)) {
      throw new Error('You are not invited to this challenge');
    }

    await prisma.challenge.update({
      where: { id: parseInt(id) },
      data: { status: 'declined' },
    });

    await prisma.notification.create({
      data: {
        userId: challenge.challengerId,
        message: 'Your challenge was declined.',
        type: 'challenge_declined',
        metadata: { challengeId: challenge.id },
      },
    });

    return { message: 'Challenge declined' };
  }

  /**
   * Submit challenge result (for async challenges)
   */
  async submitResult(id, userId, resultData) {
    const challenge = await prisma.challenge.findUnique({
      where: { id: parseInt(id) },
    });

    if (!challenge) {
      throw new Error('Challenge not found');
    }

    // Check if user is participant
    const isParticipant =
      challenge.challengerId === userId ||
      challenge.opponentIds.includes(userId);

    if (!isParticipant) {
      throw new Error('Access denied');
    }

    // Check if user already submitted
    const existingResult = challenge.results.find((r) => r.userId === userId);
    if (existingResult) {
      throw new Error('You have already submitted your result');
    }

    const { score, answers, timeTaken } = resultData;

    // Add result
    const newResults = [
      ...challenge.results,
      {
        userId,
        score,
        answers,
        timeTaken,
        submittedAt: new Date(),
      },
    ];

    // Check if all participants have submitted
    const allParticipants = [challenge.challengerId, ...challenge.opponentIds];
    const allSubmitted = allParticipants.every((pId) =>
      newResults.some((r) => r.userId === pId)
    );

    // Determine winner if all submitted
    let winnerId = null;
    let status = 'active';

    if (allSubmitted) {
      const sortedResults = [...newResults].sort((a, b) => {
        if (b.score !== a.score) return b.score - a.score;
        return a.timeTaken - b.timeTaken; // Lower time wins if tie
      });

      winnerId = sortedResults[0].userId;
      status = 'completed';

      // Update ratings
      await this._updateRatings(challenge, newResults);

      // Create notifications for all participants
      await Promise.all(
        allParticipants.map((pId) =>
          prisma.notification.create({
            data: {
              userId: pId,
              message:
                pId === winnerId
                  ? 'Congratulations! You won the challenge!'
                  : 'Challenge completed. Check the results!',
              type: 'challenge_completed',
              metadata: { challengeId: challenge.id, winnerId },
            },
          })
        )
      );
    }

    const updated = await prisma.challenge.update({
      where: { id: parseInt(id) },
      data: {
        results: newResults,
        status,
        winnerId,
        ...(status === 'completed' && { completedAt: new Date() }),
      },
    });

    return updated;
  }

  /**
   * Get user's challenges (sent, received, active, completed)
   */
  async getUserChallenges(userId, options = {}) {
    const { status, type, page = 1, limit = 20 } = options;

    const where = {
      OR: [
        { challengerId: userId },
        { opponentIds: { has: userId } },
      ],
      ...(status && { status }),
      ...(type && { type }),
    };

    const [challenges, total] = await Promise.all([
      prisma.challenge.findMany({
        where,
        include: {
          challenger: {
            select: {
              id: true,
              fullName: true,
              avatarUrl: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.challenge.count({ where }),
    ]);

    // Get opponent details for each challenge
    const enrichedChallenges = await Promise.all(
      challenges.map(async (challenge) => {
        const opponents = await prisma.user.findMany({
          where: { id: { in: challenge.opponentIds } },
          select: {
            id: true,
            fullName: true,
            avatarUrl: true,
          },
        });

        return {
          ...challenge,
          opponents,
          isSent: challenge.challengerId === userId,
          isReceived: challenge.opponentIds.includes(userId),
        };
      })
    );

    return {
      challenges: enrichedChallenges,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Get challenge statistics for user
   */
  async getUserChallengeStats(userId) {
    const [sent, received, won, lost, active] = await Promise.all([
      prisma.challenge.count({
        where: { challengerId: userId },
      }),
      prisma.challenge.count({
        where: { opponentIds: { has: userId } },
      }),
      prisma.challenge.count({
        where: {
          winnerId: userId,
          status: 'completed',
        },
      }),
      prisma.challenge.count({
        where: {
          status: 'completed',
          winnerId: { not: userId },
          OR: [
            { challengerId: userId },
            { opponentIds: { has: userId } },
          ],
        },
      }),
      prisma.challenge.count({
        where: {
          status: 'active',
          OR: [
            { challengerId: userId },
            { opponentIds: { has: userId } },
          ],
        },
      }),
    ]);

    const total = sent + received;
    const completed = won + lost;
    const winRate = completed > 0 ? ((won / completed) * 100).toFixed(1) : 0;

    return {
      sent,
      received,
      won,
      lost,
      active,
      total,
      completed,
      winRate: parseFloat(winRate),
    };
  }

  /**
   * Update ratings based on challenge results (ELO-like system)
   */
  async _updateRatings(challenge, results) {
    const K = 32; // K-factor for rating changes

    for (const result of results) {
      const user = await prisma.user.findUnique({
        where: { id: result.userId },
        select: { rating: true },
      });

      // Calculate expected score vs each opponent
      let expectedScore = 0;
      let actualScore = 0;

      const opponentResults = results.filter((r) => r.userId !== result.userId);

      for (const oppResult of opponentResults) {
        const opponent = await prisma.user.findUnique({
          where: { id: oppResult.userId },
          select: { rating: true },
        });

        const expected = 1 / (1 + Math.pow(10, (opponent.rating - user.rating) / 400));
        expectedScore += expected;

        if (result.score > oppResult.score) {
          actualScore += 1;
        } else if (result.score === oppResult.score) {
          actualScore += 0.5;
        }
      }

      // Update rating
      const ratingChange = Math.round(K * (actualScore - expectedScore));
      await prisma.user.update({
        where: { id: result.userId },
        data: {
          rating: { increment: ratingChange },
          xp: { increment: result.score * 10 }, // XP gain
        },
      });

      // Update leaderboard
      await prisma.leaderboard.upsert({
        where: { userId: result.userId },
        update: {
          totalChallenges: { increment: 1 },
          wins: { increment: result.userId === challenge.winnerId ? 1 : 0 },
          rating: { increment: ratingChange },
        },
        create: {
          userId: result.userId,
          totalChallenges: 1,
          wins: result.userId === challenge.winnerId ? 1 : 0,
          rating: user.rating + ratingChange,
        },
      });
    }
  }
}

module.exports = new ChallengeService();

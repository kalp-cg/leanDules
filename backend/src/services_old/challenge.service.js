/**
 * Challenge Service
 * Business logic for challenge and duel management
 */

const { prisma } = require('../config/db');
const { createError } = require('../middlewares/error.middleware');
const { calculatePagination } = require('../utils/response');
const { getDuelQuestions, validateAnswers, calculateXP } = require('../utils/quiz');

/**
 * Create a new challenge
 * @param {Object} challengeData - Challenge creation data
 * @param {string} userId - ID of user creating the challenge
 * @returns {Promise<Object>} Created challenge
 */
async function createChallenge(challengeData, userId) {
  const {
    type,
    opponentId,
    quizId,
    settings,
  } = challengeData;

  try {
    // Validate opponent if provided
    if (opponentId) {
      if (opponentId === userId) {
        throw createError.badRequest('Cannot challenge yourself');
      }

      const opponent = await prisma.user.findUnique({
        where: { id: opponentId },
        select: { id: true, isActive: true },
      });

      if (!opponent || !opponent.isActive) {
        throw createError.notFound('Opponent not found or inactive');
      }
    }

    // Validate quiz if provided
    if (quizId) {
      const quiz = await prisma.quiz.findUnique({
        where: { id: quizId },
        select: { id: true, visibility: true, authorId: true },
      });

      if (!quiz) {
        throw createError.notFound('Quiz not found');
      }

      if (quiz.visibility === 'PRIVATE' && quiz.authorId !== userId && quiz.authorId !== opponentId) {
        throw createError.forbidden('Cannot use private quiz for challenge');
      }
    }

    // Create challenge
    const challenge = await prisma.challenge.create({
      data: {
        challengerId: userId,
        opponentId,
        quizId,
        type,
        settings: settings || {},
        status: opponentId ? 'PENDING' : 'ACTIVE',
      },
      include: {
        challenger: {
          select: {
            id: true,
            username: true,
            avatarUrl: true,
          },
        },
        opponent: {
          select: {
            id: true,
            username: true,
            avatarUrl: true,
          },
        },
        quiz: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    return challenge;
  } catch (error) {
    if (error.isOperational) {
      throw error;
    }
    console.error('Create challenge error:', error);
    throw createError.internal('Failed to create challenge');
  }
}

/**
 * Get challenge by ID
 * @param {string} challengeId - Challenge ID
 * @param {string} [userId] - ID of requesting user
 * @returns {Promise<Object>} Challenge data
 */
async function getChallengeById(challengeId, userId) {
  try {
    const challenge = await prisma.challenge.findUnique({
      where: { id: challengeId },
      include: {
        challenger: {
          select: {
            id: true,
            username: true,
            avatarUrl: true,
          },
        },
        opponent: {
          select: {
            id: true,
            username: true,
            avatarUrl: true,
          },
        },
        quiz: {
          select: {
            id: true,
            name: true,
          },
        },
        attempts: {
          include: {
            user: {
              select: {
                id: true,
                username: true,
              },
            },
          },
          orderBy: {
            createdAt: 'desc',
          },
        },
      },
    });

    if (!challenge) {
      throw createError.notFound('Challenge not found');
    }

    // Check access permissions
    if (userId && challenge.challengerId !== userId && challenge.opponentId !== userId) {
      throw createError.forbidden('Access denied');
    }

    return challenge;
  } catch (error) {
    if (error.isOperational) {
      throw error;
    }
    console.error('Get challenge by ID error:', error);
    throw createError.internal('Failed to get challenge');
  }
}

/**
 * Accept a challenge
 * @param {string} challengeId - Challenge ID
 * @param {string} userId - ID of user accepting the challenge
 * @returns {Promise<Object>} Updated challenge
 */
async function acceptChallenge(challengeId, userId) {
  try {
    const challenge = await prisma.challenge.findUnique({
      where: { id: challengeId },
      include: {
        challenger: {
          select: {
            id: true,
            username: true,
          },
        },
      },
    });

    if (!challenge) {
      throw createError.notFound('Challenge not found');
    }

    if (challenge.status !== 'PENDING') {
      throw createError.badRequest('Challenge cannot be accepted');
    }

    if (challenge.opponentId !== userId) {
      throw createError.forbidden('You are not the opponent of this challenge');
    }

    // Update challenge status to active
    const updatedChallenge = await prisma.challenge.update({
      where: { id: challengeId },
      data: {
        status: 'ACTIVE',
      },
      include: {
        challenger: {
          select: {
            id: true,
            username: true,
            avatarUrl: true,
          },
        },
        opponent: {
          select: {
            id: true,
            username: true,
            avatarUrl: true,
          },
        },
        quiz: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    return updatedChallenge;
  } catch (error) {
    if (error.isOperational) {
      throw error;
    }
    console.error('Accept challenge error:', error);
    throw createError.internal('Failed to accept challenge');
  }
}

/**
 * Submit challenge attempt
 * @param {string} challengeId - Challenge ID
 * @param {Object} attemptData - Attempt data
 * @param {string} userId - ID of user submitting the attempt
 * @returns {Promise<Object>} Attempt results
 */
async function submitChallengeAttempt(challengeId, attemptData, userId) {
  const { answers, timeTaken } = attemptData;

  try {
    const challenge = await prisma.challenge.findUnique({
      where: { id: challengeId },
      include: {
        quiz: {
          include: {
            questions: {
              include: {
                question: true,
              },
              orderBy: {
                order: 'asc',
              },
            },
          },
        },
      },
    });

    if (!challenge) {
      throw createError.notFound('Challenge not found');
    }

    if (challenge.status !== 'ACTIVE') {
      throw createError.badRequest('Challenge is not active');
    }

    if (challenge.challengerId !== userId && challenge.opponentId !== userId) {
      throw createError.forbidden('You are not a participant in this challenge');
    }

    // Check if user already attempted
    const existingAttempt = await prisma.attempt.findFirst({
      where: {
        challengeId,
        userId,
      },
    });

    if (existingAttempt) {
      throw createError.conflict('You have already attempted this challenge');
    }

    // Get questions or generate them
    let questions;
    if (challenge.quiz) {
      questions = challenge.quiz.questions.map(qq => qq.question);
    } else {
      // Generate questions based on challenge settings
      questions = await getDuelQuestions(challenge.settings);
    }

    // Validate answers
    if (answers.length !== questions.length) {
      throw createError.badRequest('Invalid number of answers provided');
    }

    // Calculate results
    const results = validateAnswers(questions, answers);
    
    // Calculate XP
    const totalTimeLimit = questions.reduce((sum, q) => sum + q.timeLimit, 0);
    const xpGained = calculateXP(results, timeTaken, totalTimeLimit);

    // Create attempt and update user
    const attempt = await prisma.$transaction(async (tx) => {
      // Create attempt
      const newAttempt = await tx.attempt.create({
        data: {
          userId,
          challengeId,
          questionId: questions[0].id, // Reference first question
          answers,
          score: results.totalScore,
          timeTaken,
        },
      });

      // Update user XP
      const user = await tx.user.findUnique({
        where: { id: userId },
        select: { xp: true, level: true },
      });

      const newXP = user.xp + xpGained;
      const newLevel = Math.floor(newXP / 1000) + 1;

      await tx.user.update({
        where: { id: userId },
        data: {
          xp: newXP,
          level: newLevel,
        },
      });

      return newAttempt;
    });

    // Check if challenge is complete
    const allAttempts = await prisma.attempt.findMany({
      where: { challengeId },
      include: {
        user: {
          select: {
            id: true,
            username: true,
          },
        },
      },
    });

    // If both participants have attempted, complete the challenge
    if (allAttempts.length === 2 || (challenge.type === 'ASYNC' && allAttempts.length === 1)) {
      await completeChallenge(challengeId, allAttempts);
    }

    return {
      attemptId: attempt.id,
      results,
      xpGained,
      timeTaken,
    };
  } catch (error) {
    if (error.isOperational) {
      throw error;
    }
    console.error('Submit challenge attempt error:', error);
    throw createError.internal('Failed to submit challenge attempt');
  }
}

/**
 * Complete a challenge and determine winner
 * @param {string} challengeId - Challenge ID
 * @param {Array} attempts - All attempts for the challenge
 * @returns {Promise<Object>} Challenge results
 */
async function completeChallenge(challengeId, attempts) {
  try {
    // Determine winner based on score and time
    const sortedAttempts = attempts.sort((a, b) => {
      if (a.score !== b.score) {
        return b.score - a.score; // Higher score wins
      }
      return a.timeTaken - b.timeTaken; // Faster time wins in case of tie
    });

    const winner = sortedAttempts[0];
    const results = {
      winnerId: winner.userId,
      attempts: sortedAttempts.map(attempt => ({
        userId: attempt.userId,
        username: attempt.user.username,
        score: attempt.score,
        timeTaken: attempt.timeTaken,
      })),
    };

    // Update challenge status and results
    await prisma.challenge.update({
      where: { id: challengeId },
      data: {
        status: 'COMPLETED',
        results,
      },
    });

    // Award bonus XP to winner
    if (attempts.length > 1) {
      await prisma.user.update({
        where: { id: winner.userId },
        data: {
          xp: {
            increment: 50, // Bonus XP for winning
          },
          reputation: {
            increment: 10, // Reputation points for winning
          },
        },
      });
    }

    return results;
  } catch (error) {
    console.error('Complete challenge error:', error);
    throw createError.internal('Failed to complete challenge');
  }
}

/**
 * Get user challenges
 * @param {string} userId - User ID
 * @param {Object} filters - Query filters
 * @param {Object} options - Query options
 * @returns {Promise<Object>} Challenges list with pagination
 */
async function getUserChallenges(userId, filters = {}, options = {}) {
  const { status, type } = filters;
  const { page = 1, limit = 20 } = options;
  const skip = (page - 1) * limit;

  try {
    const whereClause = {
      OR: [
        { challengerId: userId },
        { opponentId: userId },
      ],
      ...(status && { status }),
      ...(type && { type }),
    };

    const [challenges, totalCount] = await Promise.all([
      prisma.challenge.findMany({
        where: whereClause,
        include: {
          challenger: {
            select: {
              id: true,
              username: true,
              avatarUrl: true,
            },
          },
          opponent: {
            select: {
              id: true,
              username: true,
              avatarUrl: true,
            },
          },
          quiz: {
            select: {
              id: true,
              name: true,
            },
          },
          _count: {
            select: {
              attempts: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
        skip,
        take: limit,
      }),
      prisma.challenge.count({
        where: whereClause,
      }),
    ]);

    const pagination = calculatePagination(page, limit, totalCount);

    return {
      challenges,
      pagination,
    };
  } catch (error) {
    console.error('Get user challenges error:', error);
    throw createError.internal('Failed to get user challenges');
  }
}

/**
 * Cancel a challenge
 * @param {string} challengeId - Challenge ID
 * @param {string} userId - ID of user canceling the challenge
 * @returns {Promise<boolean>} Cancellation status
 */
async function cancelChallenge(challengeId, userId) {
  try {
    const challenge = await prisma.challenge.findUnique({
      where: { id: challengeId },
    });

    if (!challenge) {
      throw createError.notFound('Challenge not found');
    }

    if (challenge.challengerId !== userId && challenge.opponentId !== userId) {
      throw createError.forbidden('Access denied');
    }

    if (challenge.status === 'COMPLETED' || challenge.status === 'CANCELLED') {
      throw createError.badRequest('Challenge cannot be cancelled');
    }

    // Only challenger can cancel pending challenges
    if (challenge.status === 'PENDING' && challenge.challengerId !== userId) {
      throw createError.forbidden('Only challenger can cancel pending challenges');
    }

    // Update challenge status
    await prisma.challenge.update({
      where: { id: challengeId },
      data: {
        status: 'CANCELLED',
      },
    });

    return true;
  } catch (error) {
    if (error.isOperational) {
      throw error;
    }
    console.error('Cancel challenge error:', error);
    throw createError.internal('Failed to cancel challenge');
  }
}

module.exports = {
  createChallenge,
  getChallengeById,
  acceptChallenge,
  submitChallengeAttempt,
  completeChallenge,
  getUserChallenges,
  cancelChallenge,
};
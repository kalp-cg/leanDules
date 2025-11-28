/**
 * Duel Service
 * Handles duel creation, management, and scoring
 */

const { prisma } = require('../config/db');
const { createError } = require('../middlewares/error.middleware');
const questionService = require('./question.service');
const { deleteCachePattern } = require('../config/redis');

/**
 * Create a new duel
 */
async function createDuel(player1Id, player2Id, settings = {}) {
  try {
    const { categoryId, difficultyId, questionCount = 10 } = settings;

    // Create duel
    const duel = await prisma.duel.create({
      data: {
        player1Id: parseInt(player1Id),
        player2Id: parseInt(player2Id),
        status: 'pending',
      },
      include: {
        player1: {
          select: {
            id: true,
            fullName: true,
            avatarUrl: true,
            rating: true,
          },
        },
        player2: {
          select: {
            id: true,
            fullName: true,
            avatarUrl: true,
            rating: true,
          },
        },
      },
    });

    // Get random questions
    const questions = await questionService.getRandomQuestions(
      { categoryId, difficultyId },
      questionCount
    );

    // Check if enough questions are available
    if (!questions || questions.length === 0) {
      // Delete the duel if no questions found
      await prisma.duel.delete({ where: { id: duel.id } });
      throw createError.badRequest(
        'No questions available for the selected category and difficulty. Please create questions first.'
      );
    }

    // Add questions to duel
    await Promise.all(
      questions.map((q) =>
        prisma.duelQuestion.create({
          data: {
            duelId: duel.id,
            questionId: q.id,
          },
        })
      )
    );

    return duel;
  } catch (error) {
    console.error('Create duel error:', error);
    throw createError.internal('Failed to create duel');
  }
}

/**
 * Get duel by ID
 */
async function getDuelById(duelId) {
  try {
    const duel = await prisma.duel.findUnique({
      where: { id: parseInt(duelId) },
      include: {
        player1: {
          select: {
            id: true,
            fullName: true,
            avatarUrl: true,
            rating: true,
          },
        },
        player2: {
          select: {
            id: true,
            fullName: true,
            avatarUrl: true,
            rating: true,
          },
        },
        duelQuestions: {
          include: {
            question: {
              include: {
                category: true,
                difficulty: true,
              },
            },
          },
        },
        duelAnswers: {
          include: {
            player: {
              select: {
                id: true,
                fullName: true,
              },
            },
          },
        },
      },
    });

    if (!duel) {
      throw createError.notFound('Duel not found');
    }

    return duel;
  } catch (error) {
    if (error.isOperational) throw error;
    throw createError.internal('Failed to fetch duel');
  }
}

/**
 * Get user's duels
 */
async function getUserDuels(userId, options = {}) {
  const { page = 1, limit = 20, status } = options;
  const skip = (page - 1) * limit;

  try {
    const where = {
      OR: [
        { player1Id: parseInt(userId) },
        { player2Id: parseInt(userId) },
      ],
    };

    if (status) where.status = status;

    const [duels, totalCount] = await Promise.all([
      prisma.duel.findMany({
        where,
        include: {
          player1: {
            select: {
              id: true,
              fullName: true,
              avatarUrl: true,
              rating: true,
            },
          },
          player2: {
            select: {
              id: true,
              fullName: true,
              avatarUrl: true,
              rating: true,
            },
          },
        },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.duel.count({ where }),
    ]);

    return {
      duels,
      pagination: {
        total: totalCount,
        page,
        limit,
        totalPages: Math.ceil(totalCount / limit),
      },
    };
  } catch (error) {
    throw createError.internal('Failed to fetch duels');
  }
}

/**
 * Submit answer to duel question
 */
async function submitAnswer(duelId, playerId, questionId, selectedOption) {
  try {
    // Get question to check correct answer
    const question = await prisma.question.findUnique({
      where: { id: parseInt(questionId) },
    });

    if (!question) {
      throw createError.notFound('Question not found');
    }

    const isCorrect = question.correctOption === selectedOption;

    // Save answer
    const answer = await prisma.duelAnswer.create({
      data: {
        duelId: parseInt(duelId),
        playerId: parseInt(playerId),
        questionId: parseInt(questionId),
        selectedOpt: selectedOption,
        isCorrect,
      },
    });

    // Check if duel is complete
    await checkDuelCompletion(duelId);

    return {
      answer,
      isCorrect,
    };
  } catch (error) {
    if (error.isOperational) throw error;
    throw createError.internal('Failed to submit answer');
  }
}

/**
 * Check if duel is complete and update status
 */
async function checkDuelCompletion(duelId) {
  try {
    const duel = await prisma.duel.findUnique({
      where: { id: parseInt(duelId) },
      include: {
        duelQuestions: true,
        duelAnswers: true,
      },
    });

    const totalQuestions = duel.duelQuestions.length;
    const player1Answers = duel.duelAnswers.filter(
      (a) => a.playerId === duel.player1Id
    ).length;
    const player2Answers = duel.duelAnswers.filter(
      (a) => a.playerId === duel.player2Id
    ).length;

    // Both players answered all questions
    if (player1Answers === totalQuestions && player2Answers === totalQuestions) {
      const player1Score = duel.duelAnswers.filter(
        (a) => a.playerId === duel.player1Id && a.isCorrect
      ).length;
      const player2Score = duel.duelAnswers.filter(
        (a) => a.playerId === duel.player2Id && a.isCorrect
      ).length;

      const winnerId =
        player1Score > player2Score
          ? duel.player1Id
          : player2Score > player1Score
          ? duel.player2Id
          : null; // Tie

      await prisma.duel.update({
        where: { id: parseInt(duelId) },
        data: {
          status: 'completed',
          winnerId,
          completedAt: new Date(),
        },
      });

      // Update leaderboard
      if (winnerId) {
        await updateLeaderboard(winnerId, player1Score > player2Score ? player1Score : player2Score);
      }
    }
  } catch (error) {
    console.error('Check duel completion error:', error);
  }
}

/**
 * Update leaderboard after duel
 */
async function updateLeaderboard(userId, score) {
  try {
    const existing = await prisma.leaderboard.findUnique({
      where: { userId: parseInt(userId) },
    });

    if (existing) {
      await prisma.leaderboard.update({
        where: { userId: parseInt(userId) },
        data: {
          totalDuels: existing.totalDuels + 1,
          wins: existing.wins + 1,
          rating: existing.rating + score * 10,
        },
      });
    } else {
      await prisma.leaderboard.create({
        data: {
          userId: parseInt(userId),
          totalDuels: 1,
          wins: 1,
          rating: score * 10,
        },
      });
    }

    // Invalidate leaderboard cache when it's updated
    await deleteCachePattern('leaderboard:*');

    // Update user rating
    await prisma.user.update({
      where: { id: parseInt(userId) },
      data: {
        rating: {
          increment: score * 10,
        },
      },
    });
  } catch (error) {
    console.error('Update leaderboard error:', error);
  }
}

/**
 * Get duel questions (without correct answers)
 */
async function getDuelQuestions(duelId, playerId) {
  try {
    const duel = await prisma.duel.findUnique({
      where: { id: parseInt(duelId) },
    });

    if (!duel) {
      throw createError.notFound('Duel not found');
    }

    // Verify player is part of duel
    if (duel.player1Id !== parseInt(playerId) && duel.player2Id !== parseInt(playerId)) {
      throw createError.forbidden('Not authorized to view this duel');
    }

    const questions = await prisma.duelQuestion.findMany({
      where: { duelId: parseInt(duelId) },
      include: {
        question: {
          select: {
            id: true,
            questionText: true,
            optionA: true,
            optionB: true,
            optionC: true,
            optionD: true,
            category: true,
            difficulty: true,
          },
        },
      },
    });

    return questions.map((dq) => dq.question);
  } catch (error) {
    if (error.isOperational) throw error;
    throw createError.internal('Failed to fetch duel questions');
  }
}

module.exports = {
  createDuel,
  getDuelById,
  getUserDuels,
  submitAnswer,
  getDuelQuestions,
};

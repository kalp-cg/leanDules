/**
 * Quiz Service
 * Business logic for quiz management and attempts
 */

const { prisma } = require('../config/db');
const { createError } = require('../middlewares/error.middleware');
const { calculatePagination } = require('../utils/response');
const { validateAnswers, calculateXP, shuffleArray } = require('../utils/quiz');

/**
 * Create a new quiz
 * @param {Object} quizData - Quiz creation data
 * @param {string} userId - ID of user creating the quiz
 * @returns {Promise<Object>} Created quiz
 */
async function createQuiz(quizData, userId) {
  const {
    name,
    questionIds,
    visibility = 'PUBLIC',
  } = quizData;

  try {
    // Validate questions exist and are published
    const questions = await prisma.question.findMany({
      where: {
        id: { in: questionIds },
        status: 'PUBLISHED',
      },
    });

    if (questions.length !== questionIds.length) {
      throw createError.badRequest('One or more questions not found or not published');
    }

    // Create quiz with questions
    const quiz = await prisma.$transaction(async (tx) => {
      // Create the quiz
      const newQuiz = await tx.quiz.create({
        data: {
          name,
          visibility,
          authorId: userId,
        },
      });

      // Create quiz-question associations with order
      await tx.quizQuestion.createMany({
        data: questionIds.map((questionId, index) => ({
          quizId: newQuiz.id,
          questionId,
          order: index + 1,
        })),
      });

      return newQuiz;
    });

    // Fetch complete quiz with questions
    const completeQuiz = await getQuizById(quiz.id, userId);
    return completeQuiz;
  } catch (error) {
    if (error.isOperational) {
      throw error;
    }
    console.error('Create quiz error:', error);
    throw createError.internal('Failed to create quiz');
  }
}

/**
 * Get quiz by ID
 * @param {string} quizId - Quiz ID
 * @param {string} [userId] - ID of requesting user
 * @param {boolean} [includeAnswers=false] - Include correct answers
 * @returns {Promise<Object>} Quiz data
 */
async function getQuizById(quizId, userId, includeAnswers = false) {
  try {
    const quiz = await prisma.quiz.findUnique({
      where: { id: quizId },
      include: {
        author: {
          select: {
            id: true,
            username: true,
            avatarUrl: true,
          },
        },
        questions: {
          include: {
            question: {
              include: {
                topics: {
                  include: {
                    topic: {
                      select: {
                        id: true,
                        name: true,
                      },
                    },
                  },
                },
              },
            },
          },
          orderBy: {
            order: 'asc',
          },
        },
        _count: {
          select: {
            attempts: true,
          },
        },
      },
    });

    if (!quiz) {
      throw createError.notFound('Quiz not found');
    }

    // Check access permissions
    if (quiz.visibility === 'PRIVATE' && quiz.authorId !== userId) {
      throw createError.forbidden('Access denied');
    }

    // Format questions
    const questions = quiz.questions.map(qq => {
      const question = qq.question;
      
      // Remove correct answer if not authorized
      if (!includeAnswers && quiz.authorId !== userId) {
        const { correctAnswer, ...questionWithoutAnswer } = question;
        return {
          ...questionWithoutAnswer,
          order: qq.order,
        };
      }
      
      return {
        ...question,
        order: qq.order,
      };
    });

    return {
      ...quiz,
      questions,
      attemptsCount: quiz._count.attempts,
    };
  } catch (error) {
    if (error.isOperational) {
      throw error;
    }
    console.error('Get quiz by ID error:', error);
    throw createError.internal('Failed to get quiz');
  }
}

/**
 * Get quizzes with filters
 * @param {Object} filters - Query filters
 * @param {Object} options - Query options
 * @returns {Promise<Object>} Quizzes list with pagination
 */
async function getQuizzes(filters = {}, options = {}) {
  const {
    authorId,
    visibility = 'PUBLIC',
  } = filters;

  const {
    page = 1,
    limit = 20,
    sortBy = 'createdAt',
    sortOrder = 'desc',
  } = options;

  const skip = (page - 1) * limit;

  try {
    const whereClause = {
      ...(visibility && { visibility }),
      ...(authorId && { authorId }),
    };

    const orderBy = {};
    orderBy[sortBy] = sortOrder;

    const [quizzes, totalCount] = await Promise.all([
      prisma.quiz.findMany({
        where: whereClause,
        include: {
          author: {
            select: {
              id: true,
              username: true,
              avatarUrl: true,
            },
          },
          _count: {
            select: {
              questions: true,
              attempts: true,
            },
          },
        },
        orderBy,
        skip,
        take: limit,
      }),
      prisma.quiz.count({
        where: whereClause,
      }),
    ]);

    const processedQuizzes = quizzes.map(quiz => ({
      ...quiz,
      questionCount: quiz._count.questions,
      attemptsCount: quiz._count.attempts,
    }));

    const pagination = calculatePagination(page, limit, totalCount);

    return {
      quizzes: processedQuizzes,
      pagination,
    };
  } catch (error) {
    console.error('Get quizzes error:', error);
    throw createError.internal('Failed to get quizzes');
  }
}

/**
 * Attempt a quiz
 * @param {string} quizId - Quiz ID
 * @param {Object} attemptData - Attempt data
 * @param {string} userId - ID of user attempting the quiz
 * @returns {Promise<Object>} Attempt results
 */
async function attemptQuiz(quizId, attemptData, userId) {
  const { answers, timeTaken } = attemptData;

  try {
    // Get quiz with questions and correct answers
    const quiz = await prisma.quiz.findUnique({
      where: { id: quizId },
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
    });

    if (!quiz) {
      throw createError.notFound('Quiz not found');
    }

    // Check access permissions
    if (quiz.visibility === 'PRIVATE' && quiz.authorId !== userId) {
      throw createError.forbidden('Access denied');
    }

    // Validate answers count
    if (answers.length !== quiz.questions.length) {
      throw createError.badRequest('Invalid number of answers provided');
    }

    // Get questions in order
    const questions = quiz.questions.map(qq => qq.question);

    // Validate and calculate results
    const results = validateAnswers(questions, answers);
    
    // Calculate XP
    const totalTimeLimit = questions.reduce((sum, q) => sum + q.timeLimit, 0);
    const xpGained = calculateXP(results, timeTaken, totalTimeLimit);

    // Create attempt record
    const attempt = await prisma.$transaction(async (tx) => {
      // Create attempt
      const newAttempt = await tx.attempt.create({
        data: {
          userId,
          quizId,
          questionId: questions[0].id, // Reference first question for now
          answers,
          score: results.totalScore,
          timeTaken,
        },
      });

      // Update user XP and level
      const user = await tx.user.findUnique({
        where: { id: userId },
        select: { xp: true, level: true },
      });

      const newXP = user.xp + xpGained;
      const newLevel = Math.floor(newXP / 1000) + 1; // Simple leveling formula

      await tx.user.update({
        where: { id: userId },
        data: {
          xp: newXP,
          level: newLevel,
        },
      });

      return newAttempt;
    });

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
    console.error('Attempt quiz error:', error);
    throw createError.internal('Failed to submit quiz attempt');
  }
}

/**
 * Update a quiz
 * @param {string} quizId - Quiz ID
 * @param {Object} updateData - Update data
 * @param {string} userId - ID of user updating the quiz
 * @returns {Promise<Object>} Updated quiz
 */
async function updateQuiz(quizId, updateData, userId) {
  const {
    name,
    questionIds,
    visibility,
  } = updateData;

  try {
    // Check if quiz exists and user has permission
    const existingQuiz = await prisma.quiz.findUnique({
      where: { id: quizId },
      include: {
        _count: {
          select: {
            attempts: true,
          },
        },
      },
    });

    if (!existingQuiz) {
      throw createError.notFound('Quiz not found');
    }

    if (existingQuiz.authorId !== userId) {
      throw createError.forbidden('Access denied');
    }

    // Don't allow question changes if quiz has attempts
    if (questionIds && existingQuiz._count.attempts > 0) {
      throw createError.badRequest('Cannot modify questions of a quiz that has been attempted');
    }

    // Validate new questions if provided
    if (questionIds) {
      const questions = await prisma.question.findMany({
        where: {
          id: { in: questionIds },
          status: 'PUBLISHED',
        },
      });

      if (questions.length !== questionIds.length) {
        throw createError.badRequest('One or more questions not found or not published');
      }
    }

    // Update quiz
    const updatedQuiz = await prisma.$transaction(async (tx) => {
      // Update quiz metadata
      const quiz = await tx.quiz.update({
        where: { id: quizId },
        data: {
          ...(name && { name }),
          ...(visibility && { visibility }),
        },
      });

      // Update questions if provided
      if (questionIds) {
        // Remove existing question associations
        await tx.quizQuestion.deleteMany({
          where: { quizId },
        });

        // Create new associations
        await tx.quizQuestion.createMany({
          data: questionIds.map((questionId, index) => ({
            quizId,
            questionId,
            order: index + 1,
          })),
        });
      }

      return quiz;
    });

    // Fetch complete updated quiz
    const completeQuiz = await getQuizById(quizId, userId, true);
    return completeQuiz;
  } catch (error) {
    if (error.isOperational) {
      throw error;
    }
    console.error('Update quiz error:', error);
    throw createError.internal('Failed to update quiz');
  }
}

/**
 * Delete a quiz
 * @param {string} quizId - Quiz ID
 * @param {string} userId - ID of user deleting the quiz
 * @returns {Promise<boolean>} Deletion status
 */
async function deleteQuiz(quizId, userId) {
  try {
    // Check if quiz exists and user has permission
    const quiz = await prisma.quiz.findUnique({
      where: { id: quizId },
      include: {
        _count: {
          select: {
            attempts: true,
            challenges: true,
          },
        },
      },
    });

    if (!quiz) {
      throw createError.notFound('Quiz not found');
    }

    if (quiz.authorId !== userId) {
      throw createError.forbidden('Access denied');
    }

    // Check if quiz has been used
    if (quiz._count.attempts > 0 || quiz._count.challenges > 0) {
      throw createError.badRequest('Cannot delete quiz that has been attempted or used in challenges');
    }

    // Delete quiz and associations
    await prisma.$transaction(async (tx) => {
      // Delete quiz-question associations
      await tx.quizQuestion.deleteMany({
        where: { quizId },
      });

      // Delete the quiz
      await tx.quiz.delete({
        where: { id: quizId },
      });
    });

    return true;
  } catch (error) {
    if (error.isOperational) {
      throw error;
    }
    console.error('Delete quiz error:', error);
    throw createError.internal('Failed to delete quiz');
  }
}

/**
 * Get user's quiz attempts
 * @param {string} userId - User ID
 * @param {Object} options - Query options
 * @returns {Promise<Object>} Attempts list with pagination
 */
async function getUserAttempts(userId, options = {}) {
  const { page = 1, limit = 20 } = options;
  const skip = (page - 1) * limit;

  try {
    const [attempts, totalCount] = await Promise.all([
      prisma.attempt.findMany({
        where: {
          userId,
          quizId: { not: null },
        },
        include: {
          quiz: {
            select: {
              id: true,
              name: true,
              author: {
                select: {
                  id: true,
                  username: true,
                },
              },
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
        skip,
        take: limit,
      }),
      prisma.attempt.count({
        where: {
          userId,
          quizId: { not: null },
        },
      }),
    ]);

    const pagination = calculatePagination(page, limit, totalCount);

    return {
      attempts,
      pagination,
    };
  } catch (error) {
    console.error('Get user attempts error:', error);
    throw createError.internal('Failed to get user attempts');
  }
}

module.exports = {
  createQuiz,
  getQuizById,
  getQuizzes,
  attemptQuiz,
  updateQuiz,
  deleteQuiz,
  getUserAttempts,
};
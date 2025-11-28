/**
 * Question Service
 * Business logic for question management
 */

const { prisma } = require('../config/db');
const { createError } = require('../middlewares/error.middleware');
const { calculatePagination } = require('../utils/response');
const { shuffleArray } = require('../utils/quiz');

/**
 * Create a new question
 * @param {Object} questionData - Question creation data
 * @param {string} userId - ID of user creating the question
 * @returns {Promise<Object>} Created question
 */
async function createQuestion(questionData, userId) {
  const {
    content,
    options,
    correctAnswer,
    explanation,
    difficulty,
    timeLimit,
    topicIds,
    type = 'MCQ',
  } = questionData;

  try {
    // Validate topics exist
    if (topicIds && topicIds.length > 0) {
      const existingTopics = await prisma.topic.findMany({
        where: {
          id: { in: topicIds },
        },
      });

      if (existingTopics.length !== topicIds.length) {
        throw createError.badRequest('One or more topics not found');
      }
    }

    // Validate options and correct answer for MCQ
    if (type === 'MCQ') {
      if (!options || !Array.isArray(options) || options.length < 2) {
        throw createError.badRequest('MCQ questions must have at least 2 options');
      }

      const correctIndex = parseInt(correctAnswer);
      if (isNaN(correctIndex) || correctIndex < 0 || correctIndex >= options.length) {
        throw createError.badRequest('Correct answer must be a valid option index');
      }
    }

    // Create question with topics
    const question = await prisma.$transaction(async (tx) => {
      // Create the question
      const newQuestion = await tx.question.create({
        data: {
          content,
          options: options || [],
          correctAnswer,
          explanation,
          difficulty,
          timeLimit: timeLimit || 30,
          type,
          status: 'DRAFT',
          authorId: userId,
        },
      });

      // Create topic associations
      if (topicIds && topicIds.length > 0) {
        await tx.topicQuestion.createMany({
          data: topicIds.map(topicId => ({
            questionId: newQuestion.id,
            topicId,
          })),
        });
      }

      return newQuestion;
    });

    // Fetch the complete question with relations
    const completeQuestion = await prisma.question.findUnique({
      where: { id: question.id },
      include: {
        author: {
          select: {
            id: true,
            username: true,
            avatarUrl: true,
          },
        },
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
    });

    return completeQuestion;
  } catch (error) {
    if (error.isOperational) {
      throw error;
    }
    console.error('Create question error:', error);
    throw createError.internal('Failed to create question');
  }
}

/**
 * Get question by ID
 * @param {string} questionId - Question ID
 * @param {string} [userId] - ID of requesting user
 * @param {boolean} [includeAnswer=false] - Include correct answer
 * @returns {Promise<Object>} Question data
 */
async function getQuestionById(questionId, userId, includeAnswer = false) {
  try {
    const question = await prisma.question.findUnique({
      where: { id: questionId },
      include: {
        author: {
          select: {
            id: true,
            username: true,
            avatarUrl: true,
          },
        },
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
    });

    if (!question) {
      throw createError.notFound('Question not found');
    }

    // Check if user can view the question
    if (question.status !== 'PUBLISHED' && question.authorId !== userId) {
      throw createError.forbidden('Access denied');
    }

    // Remove correct answer if not authorized
    if (!includeAnswer && question.authorId !== userId) {
      const { correctAnswer, ...questionWithoutAnswer } = question;
      return questionWithoutAnswer;
    }

    return question;
  } catch (error) {
    if (error.isOperational) {
      throw error;
    }
    console.error('Get question by ID error:', error);
    throw createError.internal('Failed to get question');
  }
}

/**
 * Get questions with filters
 * @param {Object} filters - Query filters
 * @param {Object} options - Query options
 * @returns {Promise<Object>} Questions list with pagination
 */
async function getQuestions(filters = {}, options = {}) {
  const {
    topicId,
    difficulty,
    type,
    status = 'PUBLISHED',
    authorId,
  } = filters;

  const {
    page = 1,
    limit = 20,
    sortBy = 'createdAt',
    sortOrder = 'desc',
    includeAnswer = false,
  } = options;

  const skip = (page - 1) * limit;

  try {
    // Build where clause
    const whereClause = {
      ...(status && { status }),
      ...(difficulty && { difficulty }),
      ...(type && { type }),
      ...(authorId && { authorId }),
    };

    // Add topic filter
    if (topicId) {
      whereClause.topics = {
        some: {
          topicId,
        },
      };
    }

    // Build order by clause
    const orderBy = {};
    orderBy[sortBy] = sortOrder;

    const [questions, totalCount] = await Promise.all([
      prisma.question.findMany({
        where: whereClause,
        include: {
          author: {
            select: {
              id: true,
              username: true,
              avatarUrl: true,
            },
          },
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
        orderBy,
        skip,
        take: limit,
      }),
      prisma.question.count({
        where: whereClause,
      }),
    ]);

    // Remove correct answers if not authorized
    const processedQuestions = questions.map(question => {
      if (!includeAnswer) {
        const { correctAnswer, ...questionWithoutAnswer } = question;
        return questionWithoutAnswer;
      }
      return question;
    });

    const pagination = calculatePagination(page, limit, totalCount);

    return {
      questions: processedQuestions,
      pagination,
    };
  } catch (error) {
    console.error('Get questions error:', error);
    throw createError.internal('Failed to get questions');
  }
}

/**
 * Update a question
 * @param {string} questionId - Question ID
 * @param {Object} updateData - Update data
 * @param {string} userId - ID of user updating the question
 * @returns {Promise<Object>} Updated question
 */
async function updateQuestion(questionId, updateData, userId) {
  const {
    content,
    options,
    correctAnswer,
    explanation,
    difficulty,
    timeLimit,
    topicIds,
    status,
  } = updateData;

  try {
    // Check if question exists and user has permission
    const existingQuestion = await prisma.question.findUnique({
      where: { id: questionId },
      include: {
        topics: true,
      },
    });

    if (!existingQuestion) {
      throw createError.notFound('Question not found');
    }

    if (existingQuestion.authorId !== userId) {
      throw createError.forbidden('Access denied');
    }

    // Validate new topics if provided
    if (topicIds) {
      const existingTopics = await prisma.topic.findMany({
        where: {
          id: { in: topicIds },
        },
      });

      if (existingTopics.length !== topicIds.length) {
        throw createError.badRequest('One or more topics not found');
      }
    }

    // Update question with topics
    const updatedQuestion = await prisma.$transaction(async (tx) => {
      // Update the question
      const question = await tx.question.update({
        where: { id: questionId },
        data: {
          ...(content && { content }),
          ...(options && { options }),
          ...(correctAnswer !== undefined && { correctAnswer }),
          ...(explanation !== undefined && { explanation }),
          ...(difficulty && { difficulty }),
          ...(timeLimit && { timeLimit }),
          ...(status && { status }),
        },
      });

      // Update topic associations if provided
      if (topicIds) {
        // Remove existing associations
        await tx.topicQuestion.deleteMany({
          where: { questionId },
        });

        // Create new associations
        if (topicIds.length > 0) {
          await tx.topicQuestion.createMany({
            data: topicIds.map(topicId => ({
              questionId,
              topicId,
            })),
          });
        }
      }

      return question;
    });

    // Fetch complete updated question
    const completeQuestion = await prisma.question.findUnique({
      where: { id: questionId },
      include: {
        author: {
          select: {
            id: true,
            username: true,
            avatarUrl: true,
          },
        },
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
    });

    return completeQuestion;
  } catch (error) {
    if (error.isOperational) {
      throw error;
    }
    console.error('Update question error:', error);
    throw createError.internal('Failed to update question');
  }
}

/**
 * Delete a question
 * @param {string} questionId - Question ID
 * @param {string} userId - ID of user deleting the question
 * @returns {Promise<boolean>} Deletion status
 */
async function deleteQuestion(questionId, userId) {
  try {
    // Check if question exists and user has permission
    const question = await prisma.question.findUnique({
      where: { id: questionId },
      include: {
        _count: {
          select: {
            quizQuestions: true,
            attempts: true,
          },
        },
      },
    });

    if (!question) {
      throw createError.notFound('Question not found');
    }

    if (question.authorId !== userId) {
      throw createError.forbidden('Access denied');
    }

    // Check if question is being used
    if (question._count.quizQuestions > 0 || question._count.attempts > 0) {
      throw createError.badRequest('Cannot delete question that has been used in quizzes or attempts');
    }

    // Delete question and its associations
    await prisma.$transaction(async (tx) => {
      // Delete topic associations
      await tx.topicQuestion.deleteMany({
        where: { questionId },
      });

      // Delete the question
      await tx.question.delete({
        where: { id: questionId },
      });
    });

    return true;
  } catch (error) {
    if (error.isOperational) {
      throw error;
    }
    console.error('Delete question error:', error);
    throw createError.internal('Failed to delete question');
  }
}

/**
 * Search questions
 * @param {string} query - Search query
 * @param {Object} filters - Search filters
 * @param {Object} options - Search options
 * @returns {Promise<Object>} Search results
 */
async function searchQuestions(query, filters = {}, options = {}) {
  const { page = 1, limit = 20 } = options;
  const skip = (page - 1) * limit;

  try {
    const whereClause = {
      content: {
        contains: query,
        mode: 'insensitive',
      },
      status: 'PUBLISHED',
      ...filters,
    };

    const [questions, totalCount] = await Promise.all([
      prisma.question.findMany({
        where: whereClause,
        include: {
          author: {
            select: {
              id: true,
              username: true,
              avatarUrl: true,
            },
          },
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
        orderBy: {
          createdAt: 'desc',
        },
        skip,
        take: limit,
      }),
      prisma.question.count({
        where: whereClause,
      }),
    ]);

    // Remove correct answers from search results
    const processedQuestions = questions.map(question => {
      const { correctAnswer, ...questionWithoutAnswer } = question;
      return questionWithoutAnswer;
    });

    const pagination = calculatePagination(page, limit, totalCount);

    return {
      questions: processedQuestions,
      pagination,
    };
  } catch (error) {
    console.error('Search questions error:', error);
    throw createError.internal('Failed to search questions');
  }
}

module.exports = {
  createQuestion,
  getQuestionById,
  getQuestions,
  updateQuestion,
  deleteQuestion,
  searchQuestions,
};
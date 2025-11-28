/**
 * Question Service
 * Handles question CRUD and management
 */

const { prisma } = require('../config/db');
const { createError } = require('../middlewares/error.middleware');
const { getCache, setCache, deleteCache, deleteCachePattern } = require('../config/redis');

/**
 * Create a new question
 */
async function createQuestion(questionData, authorId) {
  try {
    const {
      categoryId,
      difficultyId,
      questionText,
      optionA,
      optionB,
      optionC,
      optionD,
      correctOption,
    } = questionData;

    const question = await prisma.question.create({
      data: {
        categoryId: parseInt(categoryId),
        difficultyId: parseInt(difficultyId),
        authorId: parseInt(authorId),
        questionText,
        optionA,
        optionB,
        optionC,
        optionD,
        correctOption,
      },
      include: {
        category: true,
        difficulty: true,
        author: {
          select: {
            id: true,
            fullName: true,
            avatarUrl: true,
          },
        },
      },
    });

    // Invalidate questions cache when new question is created
    await deleteCachePattern('questions:*');

    return question;
  } catch (error) {
    console.error('Create question error:', error);
    throw createError.internal('Failed to create question');
  }
}

/**
 * Get questions with filters
 */
async function getQuestions(filters = {}, options = {}) {
  const { categoryId, difficultyId } = filters;
  const { page = 1, limit = 20 } = options;
  const skip = (page - 1) * limit;

  // Try to get from cache first
  const cacheKey = `questions:list:${categoryId || 'all'}:${difficultyId || 'all'}:${page}:${limit}`;
  const cached = await getCache(cacheKey);
  if (cached) {
    return cached;
  }

  try {
    const where = {};
    if (categoryId) where.categoryId = parseInt(categoryId);
    if (difficultyId) where.difficultyId = parseInt(difficultyId);

    const [questions, totalCount] = await Promise.all([
      prisma.question.findMany({
        where,
        include: {
          category: true,
          difficulty: true,
          author: {
            select: {
              id: true,
              fullName: true,
              avatarUrl: true,
            },
          },
        },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.question.count({ where }),
    ]);

    const result = {
      questions,
      pagination: {
        total: totalCount,
        page,
        limit,
        totalPages: Math.ceil(totalCount / limit),
      },
    };

    // Cache for 5 minutes
    await setCache(cacheKey, result, 300);

    return result;
  } catch (error) {
    throw createError.internal('Failed to fetch questions');
  }
}

/**
 * Get question by ID
 */
async function getQuestionById(questionId) {
  try {
    const question = await prisma.question.findUnique({
      where: { id: parseInt(questionId) },
      include: {
        category: true,
        difficulty: true,
        author: {
          select: {
            id: true,
            fullName: true,
            avatarUrl: true,
          },
        },
      },
    });

    if (!question) {
      throw createError.notFound('Question not found');
    }

    return question;
  } catch (error) {
    if (error.isOperational) throw error;
    throw createError.internal('Failed to fetch question');
  }
}

/**
 * Update question
 */
async function updateQuestion(questionId, updateData, authorId) {
  try {
    // Verify ownership
    const existing = await prisma.question.findUnique({
      where: { id: parseInt(questionId) },
    });

    if (!existing) {
      throw createError.notFound('Question not found');
    }

    if (existing.authorId !== parseInt(authorId)) {
      throw createError.forbidden('Not authorized to update this question');
    }

    const question = await prisma.question.update({
      where: { id: parseInt(questionId) },
      data: updateData,
      include: {
        category: true,
        difficulty: true,
      },
    });

    // Invalidate questions cache when question is updated
    await deleteCachePattern('questions:*');
    await deleteCache(`question:${questionId}`);

    return question;
  } catch (error) {
    if (error.isOperational) throw error;
    throw createError.internal('Failed to update question');
  }
}

/**
 * Delete question
 */
async function deleteQuestion(questionId, authorId) {
  try {
    const existing = await prisma.question.findUnique({
      where: { id: parseInt(questionId) },
    });

    if (!existing) {
      throw createError.notFound('Question not found');
    }

    if (existing.authorId !== parseInt(authorId)) {
      throw createError.forbidden('Not authorized to delete this question');
    }

    await prisma.question.delete({
      where: { id: parseInt(questionId) },
    });

    // Invalidate questions cache when question is deleted
    await deleteCachePattern('questions:*');
    await deleteCache(`question:${questionId}`);

    return { success: true };
  } catch (error) {
    if (error.isOperational) throw error;
    throw createError.internal('Failed to delete question');
  }
}

/**
 * Get random questions for a duel
 */
async function getRandomQuestions(filters = {}, count = 10) {
  try {
    const { categoryId, difficultyId } = filters;
    const where = {};
    if (categoryId) where.categoryId = parseInt(categoryId);
    if (difficultyId) where.difficultyId = parseInt(difficultyId);

    const questions = await prisma.question.findMany({
      where,
      take: count * 2, // Get more to ensure randomness
      orderBy: { createdAt: 'desc' },
    });

    // Shuffle and return requested count
    const shuffled = questions.sort(() => 0.5 - Math.random());
    return shuffled.slice(0, count);
  } catch (error) {
    throw createError.internal('Failed to fetch random questions');
  }
}

/**
 * Search questions
 */
async function searchQuestions(searchQuery, filters = {}, options = {}) {
  const { categoryId, difficultyId } = filters;
  const { page = 1, limit = 20 } = options;
  const skip = (page - 1) * limit;

  try {
    const where = {};
    
    if (searchQuery) {
      where.questionText = {
        contains: searchQuery,
        mode: 'insensitive',
      };
    }
    
    if (categoryId) where.categoryId = parseInt(categoryId);
    if (difficultyId) where.difficultyId = parseInt(difficultyId);

    const [questions, totalCount] = await Promise.all([
      prisma.question.findMany({
        where,
        include: {
          category: true,
          difficulty: true,
        },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.question.count({ where }),
    ]);

    return {
      questions,
      pagination: {
        total: totalCount,
        page,
        limit,
        totalPages: Math.ceil(totalCount / limit),
      },
    };
  } catch (error) {
    throw createError.internal('Failed to search questions');
  }
}

module.exports = {
  createQuestion,
  getQuestions,
  getQuestionById,
  updateQuestion,
  deleteQuestion,
  getRandomQuestions,
  searchQuestions,
};

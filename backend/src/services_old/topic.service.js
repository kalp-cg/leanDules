/**
 * Topic Service
 * Business logic for educational topic management
 */

const { prisma } = require('../config/db');
const { createError } = require('../middlewares/error.middleware');
const { calculatePagination } = require('../utils/response');

/**
 * Get all topics with hierarchy
 * @param {Object} options - Query options
 * @returns {Promise<Array>} Topics list
 */
async function getAllTopics(options = {}) {
  const { parentId, includeChildren = true } = options;

  try {
    const whereClause = parentId ? { parentId } : { parentId: null };

    const topics = await prisma.topic.findMany({
      where: whereClause,
      include: {
        ...(includeChildren && {
          children: {
            orderBy: { name: 'asc' },
            include: {
              _count: {
                select: {
                  questions: true,
                },
              },
            },
          },
        }),
        _count: {
          select: {
            questions: true,
            children: true,
          },
        },
      },
      orderBy: { name: 'asc' },
    });

    return topics;
  } catch (error) {
    console.error('Get all topics error:', error);
    throw createError.internal('Failed to get topics');
  }
}

/**
 * Get topic by ID
 * @param {string} topicId - Topic ID
 * @returns {Promise<Object>} Topic data
 */
async function getTopicById(topicId) {
  try {
    const topic = await prisma.topic.findUnique({
      where: { id: topicId },
      include: {
        parent: {
          select: {
            id: true,
            name: true,
          },
        },
        children: {
          select: {
            id: true,
            name: true,
          },
          orderBy: { name: 'asc' },
        },
        _count: {
          select: {
            questions: true,
            children: true,
          },
        },
      },
    });

    if (!topic) {
      throw createError.notFound('Topic not found');
    }

    return topic;
  } catch (error) {
    if (error.isOperational) {
      throw error;
    }
    console.error('Get topic by ID error:', error);
    throw createError.internal('Failed to get topic');
  }
}

/**
 * Create a new topic
 * @param {Object} topicData - Topic creation data
 * @param {string} userId - ID of user creating the topic
 * @returns {Promise<Object>} Created topic
 */
async function createTopic(topicData, userId) {
  const { name, parentId } = topicData;

  try {
    // Check if topic name already exists
    const existingTopic = await prisma.topic.findUnique({
      where: { name },
    });

    if (existingTopic) {
      throw createError.conflict('Topic name already exists');
    }

    // Validate parent topic if provided
    if (parentId) {
      const parentTopic = await prisma.topic.findUnique({
        where: { id: parentId },
      });

      if (!parentTopic) {
        throw createError.badRequest('Parent topic not found');
      }
    }

    // Create topic
    const topic = await prisma.topic.create({
      data: {
        name,
        parentId,
      },
      include: {
        parent: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    return topic;
  } catch (error) {
    if (error.isOperational) {
      throw error;
    }
    console.error('Create topic error:', error);
    throw createError.internal('Failed to create topic');
  }
}

/**
 * Update a topic
 * @param {string} topicId - Topic ID
 * @param {Object} updateData - Update data
 * @param {string} userId - ID of user updating the topic
 * @returns {Promise<Object>} Updated topic
 */
async function updateTopic(topicId, updateData, userId) {
  const { name, parentId } = updateData;

  try {
    // Check if topic exists
    const existingTopic = await prisma.topic.findUnique({
      where: { id: topicId },
    });

    if (!existingTopic) {
      throw createError.notFound('Topic not found');
    }

    // Check if new name already exists (if name is being changed)
    if (name && name !== existingTopic.name) {
      const nameExists = await prisma.topic.findUnique({
        where: { name },
      });

      if (nameExists) {
        throw createError.conflict('Topic name already exists');
      }
    }

    // Validate parent topic if provided
    if (parentId && parentId !== existingTopic.parentId) {
      // Check for circular reference
      if (parentId === topicId) {
        throw createError.badRequest('Topic cannot be its own parent');
      }

      const parentTopic = await prisma.topic.findUnique({
        where: { id: parentId },
      });

      if (!parentTopic) {
        throw createError.badRequest('Parent topic not found');
      }

      // Check if parentId is not a descendant of topicId
      const isDescendant = await checkIfDescendant(topicId, parentId);
      if (isDescendant) {
        throw createError.badRequest('Cannot set a descendant as parent');
      }
    }

    // Update topic
    const updatedTopic = await prisma.topic.update({
      where: { id: topicId },
      data: {
        ...(name && { name }),
        ...(parentId !== undefined && { parentId }),
      },
      include: {
        parent: {
          select: {
            id: true,
            name: true,
          },
        },
        children: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    return updatedTopic;
  } catch (error) {
    if (error.isOperational) {
      throw error;
    }
    console.error('Update topic error:', error);
    throw createError.internal('Failed to update topic');
  }
}

/**
 * Delete a topic
 * @param {string} topicId - Topic ID
 * @param {string} userId - ID of user deleting the topic
 * @returns {Promise<boolean>} Deletion status
 */
async function deleteTopic(topicId, userId) {
  try {
    // Check if topic exists
    const topic = await prisma.topic.findUnique({
      where: { id: topicId },
      include: {
        _count: {
          select: {
            children: true,
            questions: true,
          },
        },
      },
    });

    if (!topic) {
      throw createError.notFound('Topic not found');
    }

    // Check if topic has children or questions
    if (topic._count.children > 0) {
      throw createError.badRequest('Cannot delete topic with subtopics');
    }

    if (topic._count.questions > 0) {
      throw createError.badRequest('Cannot delete topic with questions');
    }

    // Delete topic
    await prisma.topic.delete({
      where: { id: topicId },
    });

    return true;
  } catch (error) {
    if (error.isOperational) {
      throw error;
    }
    console.error('Delete topic error:', error);
    throw createError.internal('Failed to delete topic');
  }
}

/**
 * Search topics
 * @param {string} query - Search query
 * @param {Object} options - Search options
 * @returns {Promise<Object>} Search results
 */
async function searchTopics(query, options = {}) {
  const { page = 1, limit = 20 } = options;
  const skip = (page - 1) * limit;

  try {
    const searchCondition = {
      name: {
        contains: query,
        mode: 'insensitive',
      },
    };

    const [topics, totalCount] = await Promise.all([
      prisma.topic.findMany({
        where: searchCondition,
        include: {
          parent: {
            select: {
              id: true,
              name: true,
            },
          },
          _count: {
            select: {
              questions: true,
              children: true,
            },
          },
        },
        orderBy: { name: 'asc' },
        skip,
        take: limit,
      }),
      prisma.topic.count({
        where: searchCondition,
      }),
    ]);

    const pagination = calculatePagination(page, limit, totalCount);

    return {
      topics,
      pagination,
    };
  } catch (error) {
    console.error('Search topics error:', error);
    throw createError.internal('Failed to search topics');
  }
}

/**
 * Check if a topic is a descendant of another topic
 * @param {string} ancestorId - Ancestor topic ID
 * @param {string} descendantId - Descendant topic ID
 * @returns {Promise<boolean>} True if descendant
 */
async function checkIfDescendant(ancestorId, descendantId) {
  try {
    let currentId = descendantId;
    const visited = new Set();

    while (currentId) {
      if (visited.has(currentId)) {
        // Circular reference detected
        break;
      }
      visited.add(currentId);

      if (currentId === ancestorId) {
        return true;
      }

      const topic = await prisma.topic.findUnique({
        where: { id: currentId },
        select: { parentId: true },
      });

      currentId = topic?.parentId;
    }

    return false;
  } catch (error) {
    console.error('Check descendant error:', error);
    return false;
  }
}

module.exports = {
  getAllTopics,
  getTopicById,
  createTopic,
  updateTopic,
  deleteTopic,
  searchTopics,
  checkIfDescendant,
};
/**
 * User Service
 * Business logic for user management and profile operations
 */

const { prisma } = require('../config/db');
const { createError } = require('../middlewares/error.middleware');
const { calculatePagination } = require('../utils/response');

/**
 * Get user profile by ID
 * @param {string} userId - User ID
 * @param {string} [requestingUserId] - ID of user making the request
 * @returns {Promise<Object>} User profile data
 */
async function getUserProfile(userId, requestingUserId) {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        username: true,
        email: requestingUserId === userId, // Only show email to self
        avatarUrl: true,
        bio: true,
        xp: true,
        level: true,
        reputation: true,
        followersCount: true,
        followingCount: true,
        createdAt: true,
        _count: {
          select: {
            authoredQuestions: true,
            authoredQuizzes: true,
            attempts: true,
          },
        },
      },
    });

    if (!user) {
      throw createError.notFound('User not found');
    }

    // Check if requesting user follows this user
    let isFollowing = false;
    if (requestingUserId && requestingUserId !== userId) {
      const follow = await prisma.follow.findUnique({
        where: {
          followerId_followingId: {
            followerId: requestingUserId,
            followingId: userId,
          },
        },
      });
      isFollowing = !!follow;
    }

    return {
      ...user,
      isFollowing,
      stats: {
        questionsCreated: user._count.authoredQuestions,
        quizzesCreated: user._count.authoredQuizzes,
        quizzesTaken: user._count.attempts,
      },
    };
  } catch (error) {
    if (error.isOperational) {
      throw error;
    }
    console.error('Get user profile error:', error);
    throw createError.internal('Failed to get user profile');
  }
}

/**
 * Update user profile
 * @param {string} userId - User ID
 * @param {Object} updateData - Profile update data
 * @returns {Promise<Object>} Updated user data
 */
async function updateProfile(userId, updateData) {
  const { username, bio, avatarUrl } = updateData;

  try {
    // Check if username is taken (if being changed)
    if (username) {
      const existingUser = await prisma.user.findFirst({
        where: {
          username,
          NOT: { id: userId },
        },
      });

      if (existingUser) {
        throw createError.conflict('Username already taken');
      }
    }

    // Update user profile
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        ...(username && { username }),
        ...(bio !== undefined && { bio }),
        ...(avatarUrl !== undefined && { avatarUrl }),
      },
      select: {
        id: true,
        username: true,
        email: true,
        avatarUrl: true,
        bio: true,
        xp: true,
        level: true,
        reputation: true,
        followersCount: true,
        followingCount: true,
        updatedAt: true,
      },
    });

    return updatedUser;
  } catch (error) {
    if (error.isOperational) {
      throw error;
    }
    console.error('Update profile error:', error);
    throw createError.internal('Failed to update profile');
  }
}

/**
 * Follow a user
 * @param {string} followerId - ID of user following
 * @param {string} followingId - ID of user being followed
 * @returns {Promise<boolean>} Follow status
 */
async function followUser(followerId, followingId) {
  try {
    if (followerId === followingId) {
      throw createError.badRequest('Cannot follow yourself');
    }

    // Check if target user exists
    const targetUser = await prisma.user.findUnique({
      where: { id: followingId },
    });

    if (!targetUser) {
      throw createError.notFound('User not found');
    }

    // Check if already following
    const existingFollow = await prisma.follow.findUnique({
      where: {
        followerId_followingId: {
          followerId,
          followingId,
        },
      },
    });

    if (existingFollow) {
      throw createError.conflict('Already following this user');
    }

    // Create follow relationship and update counts
    await prisma.$transaction(async (tx) => {
      // Create follow
      await tx.follow.create({
        data: {
          followerId,
          followingId,
        },
      });

      // Update follower count
      await tx.user.update({
        where: { id: followingId },
        data: {
          followersCount: {
            increment: 1,
          },
        },
      });

      // Update following count
      await tx.user.update({
        where: { id: followerId },
        data: {
          followingCount: {
            increment: 1,
          },
        },
      });
    });

    return true;
  } catch (error) {
    if (error.isOperational) {
      throw error;
    }
    console.error('Follow user error:', error);
    throw createError.internal('Failed to follow user');
  }
}

/**
 * Unfollow a user
 * @param {string} followerId - ID of user unfollowing
 * @param {string} followingId - ID of user being unfollowed
 * @returns {Promise<boolean>} Unfollow status
 */
async function unfollowUser(followerId, followingId) {
  try {
    // Check if follow relationship exists
    const follow = await prisma.follow.findUnique({
      where: {
        followerId_followingId: {
          followerId,
          followingId,
        },
      },
    });

    if (!follow) {
      throw createError.notFound('Not following this user');
    }

    // Remove follow relationship and update counts
    await prisma.$transaction(async (tx) => {
      // Delete follow
      await tx.follow.delete({
        where: {
          followerId_followingId: {
            followerId,
            followingId,
          },
        },
      });

      // Update follower count
      await tx.user.update({
        where: { id: followingId },
        data: {
          followersCount: {
            decrement: 1,
          },
        },
      });

      // Update following count
      await tx.user.update({
        where: { id: followerId },
        data: {
          followingCount: {
            decrement: 1,
          },
        },
      });
    });

    return true;
  } catch (error) {
    if (error.isOperational) {
      throw error;
    }
    console.error('Unfollow user error:', error);
    throw createError.internal('Failed to unfollow user');
  }
}

/**
 * Get user followers
 * @param {string} userId - User ID
 * @param {Object} options - Query options
 * @returns {Promise<Object>} Followers list with pagination
 */
async function getFollowers(userId, options = {}) {
  const { page = 1, limit = 20 } = options;
  const skip = (page - 1) * limit;

  try {
    const [followers, totalCount] = await Promise.all([
      prisma.follow.findMany({
        where: { followingId: userId },
        include: {
          follower: {
            select: {
              id: true,
              username: true,
              avatarUrl: true,
              xp: true,
              level: true,
              reputation: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.follow.count({
        where: { followingId: userId },
      }),
    ]);

    const followersData = followers.map((f) => f.follower);
    const pagination = calculatePagination(page, limit, totalCount);

    return {
      followers: followersData,
      pagination,
    };
  } catch (error) {
    console.error('Get followers error:', error);
    throw createError.internal('Failed to get followers');
  }
}

/**
 * Get users being followed
 * @param {string} userId - User ID
 * @param {Object} options - Query options
 * @returns {Promise<Object>} Following list with pagination
 */
async function getFollowing(userId, options = {}) {
  const { page = 1, limit = 20 } = options;
  const skip = (page - 1) * limit;

  try {
    const [following, totalCount] = await Promise.all([
      prisma.follow.findMany({
        where: { followerId: userId },
        include: {
          following: {
            select: {
              id: true,
              username: true,
              avatarUrl: true,
              xp: true,
              level: true,
              reputation: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.follow.count({
        where: { followerId: userId },
      }),
    ]);

    const followingData = following.map((f) => f.following);
    const pagination = calculatePagination(page, limit, totalCount);

    return {
      following: followingData,
      pagination,
    };
  } catch (error) {
    console.error('Get following error:', error);
    throw createError.internal('Failed to get following');
  }
}

/**
 * Search users
 * @param {string} query - Search query
 * @param {Object} options - Search options
 * @returns {Promise<Array>} Search results
 */
async function searchUsers(query, options = {}) {
  const { page = 1, limit = 20 } = options;
  const skip = (page - 1) * limit;

  try {
    const searchCondition = {
      OR: [
        {
          username: {
            contains: query,
            mode: 'insensitive',
          },
        },
        {
          bio: {
            contains: query,
            mode: 'insensitive',
          },
        },
      ],
      isActive: true,
    };

    const [users, totalCount] = await Promise.all([
      prisma.user.findMany({
        where: searchCondition,
        select: {
          id: true,
          username: true,
          avatarUrl: true,
          bio: true,
          xp: true,
          level: true,
          reputation: true,
          followersCount: true,
          _count: {
            select: {
              authoredQuestions: true,
              authoredQuizzes: true,
            },
          },
        },
        orderBy: [
          { reputation: 'desc' },
          { xp: 'desc' },
        ],
        skip,
        take: limit,
      }),
      prisma.user.count({
        where: searchCondition,
      }),
    ]);

    const pagination = calculatePagination(page, limit, totalCount);

    return {
      users,
      pagination,
    };
  } catch (error) {
    console.error('Search users error:', error);
    throw createError.internal('Failed to search users');
  }
}

module.exports = {
  getUserProfile,
  updateProfile,
  followUser,
  unfollowUser,
  getFollowers,
  getFollowing,
  searchUsers,
};
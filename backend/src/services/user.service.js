/**
 * User Service
 * Handles user profile and social features
 */

const { prisma } = require('../config/db');
const { createError } = require('../middlewares/error.middleware');

/**
 * Get user profile by ID
 */
async function getUserProfile(userId) {
  try {
    const user = await prisma.user.findUnique({
      where: { id: parseInt(userId) },
      select: {
        id: true,
        fullName: true,
        email: true,
        avatarUrl: true,
        role: true,
        rating: true,
        createdAt: true,
        _count: {
          select: {
            followers: true,
            following: true,
            questions: true,
          },
        },
      },
    });

    if (!user) {
      throw createError.notFound('User not found');
    }

    return user;
  } catch (error) {
    if (error.isOperational) throw error;
    throw createError.internal('Failed to fetch user profile');
  }
}

/**
 * Update user profile
 */
async function updateProfile(userId, updateData) {
  try {
    const { fullName, avatarUrl } = updateData;

    const user = await prisma.user.update({
      where: { id: parseInt(userId) },
      data: {
        ...(fullName && { fullName }),
        ...(avatarUrl && { avatarUrl }),
      },
      select: {
        id: true,
        fullName: true,
        email: true,
        avatarUrl: true,
        role: true,
        rating: true,
      },
    });

    return user;
  } catch (error) {
    if (error.isOperational) throw error;
    throw createError.internal('Failed to update profile');
  }
}

/**
 * Follow a user
 */
async function followUser(followerId, followingId) {
  try {
    if (followerId === followingId) {
      throw createError.badRequest('Cannot follow yourself');
    }

    const existing = await prisma.userFollower.findFirst({
      where: {
        followerId: parseInt(followerId),
        followingId: parseInt(followingId),
      },
    });

    if (existing) {
      throw createError.conflict('Already following this user');
    }

    await prisma.userFollower.create({
      data: {
        followerId: parseInt(followerId),
        followingId: parseInt(followingId),
      },
    });

    return { success: true };
  } catch (error) {
    if (error.isOperational) throw error;
    throw createError.internal('Failed to follow user');
  }
}

/**
 * Unfollow a user
 */
async function unfollowUser(followerId, followingId) {
  try {
    await prisma.userFollower.deleteMany({
      where: {
        followerId: parseInt(followerId),
        followingId: parseInt(followingId),
      },
    });

    return { success: true };
  } catch (error) {
    throw createError.internal('Failed to unfollow user');
  }
}

/**
 * Get user's followers
 */
async function getFollowers(userId, options = {}) {
  const { page = 1, limit = 20 } = options;
  const skip = (page - 1) * limit;

  try {
    const [followers, totalCount] = await Promise.all([
      prisma.userFollower.findMany({
        where: { followingId: parseInt(userId) },
        include: {
          follower: {
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
      prisma.userFollower.count({
        where: { followingId: parseInt(userId) },
      }),
    ]);

    return {
      followers: followers.map((f) => f.follower),
      pagination: {
        total: totalCount,
        page,
        limit,
        totalPages: Math.ceil(totalCount / limit),
      },
    };
  } catch (error) {
    throw createError.internal('Failed to fetch followers');
  }
}

/**
 * Get users that user is following
 */
async function getFollowing(userId, options = {}) {
  const { page = 1, limit = 20 } = options;
  const skip = (page - 1) * limit;

  try {
    const [following, totalCount] = await Promise.all([
      prisma.userFollower.findMany({
        where: { followerId: parseInt(userId) },
        include: {
          following: {
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
      prisma.userFollower.count({
        where: { followerId: parseInt(userId) },
      }),
    ]);

    return {
      following: following.map((f) => f.following),
      pagination: {
        total: totalCount,
        page,
        limit,
        totalPages: Math.ceil(totalCount / limit),
      },
    };
  } catch (error) {
    throw createError.internal('Failed to fetch following');
  }
}

/**
 * Search users by query
 */
async function searchUsers(query, options = {}) {
  const { page = 1, limit = 20 } = options;
  const skip = (page - 1) * limit;

  try {
    const where = {
      OR: [
        {
          fullName: {
            contains: query,
            mode: 'insensitive',
          },
        },
        {
          email: {
            contains: query,
            mode: 'insensitive',
          },
        },
      ],
    };

    const [users, totalCount] = await Promise.all([
      prisma.user.findMany({
        where,
        select: {
          id: true,
          fullName: true,
          email: true,
          avatarUrl: true,
          role: true,
          rating: true,
          createdAt: true,
          _count: {
            select: {
              followers: true,
              following: true,
            },
          },
        },
        skip,
        take: limit,
        orderBy: {
          rating: 'desc',
        },
      }),
      prisma.user.count({ where }),
    ]);

    return {
      users,
      pagination: {
        total: totalCount,
        page,
        limit,
        totalPages: Math.ceil(totalCount / limit),
      },
    };
  } catch (error) {
    throw createError.internal('User search failed');
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

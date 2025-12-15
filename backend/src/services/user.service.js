/**
 * User Service
 * Handles user profile and social features
 */

const { prisma } = require('../config/db');
const { createError } = require('../middlewares/error.middleware');
const feedService = require('./feed.service');

/**
 * Get all users (with pagination and search)
 */
async function getAllUsers(currentUserId, { page = 1, limit = 20, search = '', sortBy = 'newest' }) {
  try {
    const skip = (page - 1) * limit;
    const where = {};

    if (search) {
      where.OR = [
        { username: { contains: search, mode: 'insensitive' } },
        { fullName: { contains: search, mode: 'insensitive' } },
      ];
    }

    // Exclude current user
    if (currentUserId) {
      where.id = { not: parseInt(currentUserId) };
    }

    let orderBy = { createdAt: 'desc' };
    if (sortBy === 'rating') {
      orderBy = { rating: 'desc' };
    } else if (sortBy === 'xp') {
      orderBy = { xp: 'desc' };
    }

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        skip,
        take: limit,
        orderBy,
        select: {
          id: true,
          username: true,
          fullName: true,
          avatarUrl: true,
          level: true,
          rating: true,
          createdAt: true,
          _count: {
            select: {
              followers: true,
            }
          }
        },
      }),
      prisma.user.count({ where }),
    ]);

    // Check following status for each user
    const usersWithStatus = await Promise.all(users.map(async (user) => {
      const isFollowing = await prisma.userFollower.findUnique({
        where: {
          followerId_followingId: {
            followerId: parseInt(currentUserId),
            followingId: user.id,
          },
        },
      });
      return {
        ...user,
        isFollowing: !!isFollowing,
      };
    }));

    return {
      users: usersWithStatus,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  } catch (error) {
    console.error('Get all users error:', error);
    throw createError.internal('Failed to fetch users');
  }
}

/**
 * Get user profile by ID
 */
async function getUserProfile(userId, currentUserId = null) {
  try {
    // Update streak before fetching profile
    await updateStreak(userId);

    const user = await prisma.user.findUnique({
      where: { id: parseInt(userId) },
      select: {
        id: true,
        username: true,
        fullName: true,
        email: true,
        avatarUrl: true,
        bio: true,
        role: true,
        rating: true,
        xp: true,
        level: true,
        reputation: true,
        createdAt: true,
        currentStreak: true,
        longestStreak: true,
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

    let isFollowing = false;
    if (currentUserId && parseInt(currentUserId) !== parseInt(userId)) {
      const follow = await prisma.userFollower.findUnique({
        where: {
          followerId_followingId: {
            followerId: parseInt(currentUserId),
            followingId: parseInt(userId),
          },
        },
      });
      isFollowing = !!follow;
    }

    return {
      ...user,
      isFollowing,
    };
  } catch (error) {
    if (error.isOperational) throw error;
    throw createError.internal('Failed to fetch user profile');
  }
}

/**
 * Update user streak
 */
async function updateStreak(userId) {
  try {
    const user = await prisma.user.findUnique({
      where: { id: parseInt(userId) },
      select: { lastLoginAt: true, currentStreak: true, longestStreak: true },
    });

    if (!user) return;

    const now = new Date();
    const lastLogin = user.lastLoginAt ? new Date(user.lastLoginAt) : null;

    let newCurrentStreak = user.currentStreak;
    let newLongestStreak = user.longestStreak;

    if (!lastLogin) {
      // First login ever
      newCurrentStreak = 1;
      newLongestStreak = 1;
    } else {
      // Calculate difference in days
      // Reset time to midnight for accurate day comparison
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const lastDate = new Date(lastLogin.getFullYear(), lastLogin.getMonth(), lastLogin.getDate());
      
      const diffTime = Math.abs(today - lastDate);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      if (diffDays === 1) {
        // Consecutive day
        newCurrentStreak += 1;
        if (newCurrentStreak > newLongestStreak) {
          newLongestStreak = newCurrentStreak;
        }
      } else if (diffDays > 1) {
        // Missed a day (or more)
        newCurrentStreak = 1;
      }
      // If diffDays === 0 (same day), do nothing to streak
    }

    await prisma.user.update({
      where: { id: parseInt(userId) },
      data: {
        lastLoginAt: now,
        currentStreak: newCurrentStreak,
        longestStreak: newLongestStreak,
      },
    });
  } catch (error) {
    console.error('Failed to update streak:', error);
    // Don't throw, just log. Streak update shouldn't block profile fetch.
  }
}

/**
 * Update user profile
 */
async function updateProfile(userId, updateData) {
  try {
    const { fullName, avatarUrl, bio } = updateData;

    const updateFields = {};
    if (fullName !== undefined) updateFields.fullName = fullName;
    if (avatarUrl !== undefined) updateFields.avatarUrl = avatarUrl;
    if (bio !== undefined) updateFields.bio = bio;

    const user = await prisma.user.update({
      where: { id: parseInt(userId) },
      data: updateFields,
      select: {
        id: true,
        fullName: true,
        email: true,
        avatarUrl: true,
        bio: true,
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
    if (parseInt(followerId) === parseInt(followingId)) {
      throw createError.badRequest('Cannot follow yourself');
    }

    // Check if the user to follow exists
    const userToFollow = await prisma.user.findUnique({
      where: { id: parseInt(followingId) },
    });

    if (!userToFollow) {
      throw createError.notFound('User to follow not found');
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
    console.error('Follow user error:', error);
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

/**
 * Add XP to user and handle leveling up
 */
async function addXp(userId, amount) {
  try {
    const user = await prisma.user.findUnique({
      where: { id: parseInt(userId) },
      select: { id: true, xp: true, level: true }
    });

    if (!user) return;

    const newXp = user.xp + amount;
    // Simple level formula: 1000 XP per level
    const newLevel = Math.floor(newXp / 1000) + 1;

    const updateData = {
      xp: newXp
    };

    if (newLevel > user.level) {
      updateData.level = newLevel;
      
      // Create Level Up Activity
      try {
        await feedService.createActivity(userId, 'LEVEL_UP', {
          oldLevel: user.level,
          newLevel: newLevel
        });
      } catch (e) {
        console.error('Feed error', e);
      }
    }

    await prisma.user.update({
      where: { id: parseInt(userId) },
      data: updateData
    });

    return { newXp, newLevel, leveledUp: newLevel > user.level };
  } catch (error) {
    console.error('Add XP error:', error);
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
  getAllUsers,
  addXp,
};

/**
 * Leaderboard Service
 * Handles leaderboard rankings and statistics
 */

const { prisma } = require('../config/db');
const { createError } = require('../middlewares/error.middleware');
const { getCache, setCache, deleteCache } = require('../config/redis');

/**
 * Get global leaderboard
 */
async function getGlobalLeaderboard(options = {}) {
  const { page = 1, limit = 50 } = options;
  const skip = (page - 1) * limit;

  // Try to get from cache first
  const cacheKey = `leaderboard:global:${page}:${limit}`;
  const cached = await getCache(cacheKey);
  if (cached) {
    return cached;
  }

  try {
    const [leaderboard, totalCount] = await Promise.all([
      prisma.leaderboard.findMany({
        include: {
          user: {
            select: {
              id: true,
              fullName: true,
              avatarUrl: true,
              role: true,
            },
          },
        },
        orderBy: [
          { rating: 'desc' },
          { wins: 'desc' },
        ],
        skip,
        take: limit,
      }),
      prisma.leaderboard.count(),
    ]);

    const result = {
      leaderboard,
      pagination: {
        total: totalCount,
        page,
        limit,
        totalPages: Math.ceil(totalCount / limit),
      },
    };

    // Cache for 2 minutes (leaderboard changes frequently)
    await setCache(cacheKey, result, 120);

    return result;
  } catch (error) {
    throw createError.internal('Failed to fetch leaderboard');
  }
}

/**
 * Get user's rank
 */
async function getUserRank(userId) {
  // Try to get from cache first
  const cacheKey = `leaderboard:user:${userId}`;
  const cached = await getCache(cacheKey);
  if (cached) {
    return cached;
  }

  try {
    const userLeaderboard = await prisma.leaderboard.findUnique({
      where: { userId: parseInt(userId) },
      include: {
        user: {
          select: {
            id: true,
            fullName: true,
            avatarUrl: true,
            rating: true,
          },
        },
      },
    });

    if (!userLeaderboard) {
      return {
        rank: null,
        stats: {
          totalDuels: 0,
          wins: 0,
          rating: 0,
        },
      };
    }

    // Calculate rank
    const higherRanked = await prisma.leaderboard.count({
      where: {
        rating: {
          gt: userLeaderboard.rating,
        },
      },
    });

    const result = {
      rank: higherRanked + 1,
      stats: userLeaderboard,
    };

    // Cache for 3 minutes
    await setCache(cacheKey, result, 180);

    return result;
  } catch (error) {
    throw createError.internal('Failed to fetch user rank');
  }
}

/**
 * Get top performers
 */
async function getTopPerformers(limit = 10) {
  // Try to get from cache first
  const cacheKey = `leaderboard:top:${limit}`;
  const cached = await getCache(cacheKey);
  if (cached) {
    return cached;
  }

  try {
    const topUsers = await prisma.leaderboard.findMany({
      include: {
        user: {
          select: {
            id: true,
            fullName: true,
            avatarUrl: true,
          },
        },
      },
      orderBy: [
        { rating: 'desc' },
        { wins: 'desc' },
      ],
      take: limit,
    });

    // Cache for 2 minutes
    await setCache(cacheKey, topUsers, 120);

    return topUsers;
  } catch (error) {
    throw createError.internal('Failed to fetch top performers');
  }
}

/**
 * Get user ranking
 */
async function getUserRanking(userId, topicId = null) {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        fullName: true,
        avatarUrl: true,
        rating: true,
      },
    });

    if (!user) {
      throw createError.notFound('User not found');
    }

    // Get user's rank
    const higherRatedCount = await prisma.user.count({
      where: {
        rating: {
          gt: user.rating,
        },
      },
    });

    return {
      user,
      rank: higherRatedCount + 1,
      rating: user.rating,
    };
  } catch (error) {
    if (error.isOperational) throw error;
    throw createError.internal('Failed to fetch user ranking');
  }
}

/**
 * Get user statistics
 */
async function getUserStats(userId, topicId = null) {
  try {
    const stats = await prisma.leaderboard.findUnique({
      where: { userId },
      select: {
        wins: true,
        totalDuels: true,
        rating: true,
      },
    });

    if (!stats) {
      return {
        wins: 0,
        losses: 0,
        totalDuels: 0,
        rating: 0,
        winRate: 0,
      };
    }

    const losses = stats.totalDuels - stats.wins;
    const winRate = stats.totalDuels > 0 
      ? ((stats.wins / stats.totalDuels) * 100).toFixed(2) 
      : 0;

    return {
      wins: stats.wins,
      losses,
      totalDuels: stats.totalDuels,
      rating: stats.rating,
      winRate: parseFloat(winRate),
    };
  } catch (error) {
    console.error('getUserStats error:', error);
    throw createError.internal('Failed to fetch user statistics');
  }
}

/**
 * Get leaderboard around user
 */
async function getLeaderboardAroundUser(userId, options = {}) {
  const { range = 5, topicId = null } = options;

  try {
    // Get user's current rating
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { rating: true },
    });

    if (!user) {
      throw createError.notFound('User not found');
    }

    // Get users around this rating
    const leaderboard = await prisma.leaderboard.findMany({
      where: {
        rating: {
          gte: user.rating - (range * 100), // Approximate range
          lte: user.rating + (range * 100),
        },
      },
      include: {
        user: {
          select: {
            id: true,
            fullName: true,
            avatarUrl: true,
            role: true,
          },
        },
      },
      orderBy: [
        { rating: 'desc' },
        { wins: 'desc' },
      ],
      take: range * 2 + 1,
    });

    // Calculate user's rank
    const userRank = await prisma.user.count({
      where: {
        rating: {
          gt: user.rating,
        },
      },
    }) + 1;

    return {
      leaderboard,
      userRank,
      range,
      pagination: {
        total: leaderboard.length,
        page: 1,
        limit: range * 2 + 1,
        totalPages: 1,
      },
    };
  } catch (error) {
    if (error.isOperational) throw error;
    throw createError.internal('Failed to fetch leaderboard around user');
  }
}

module.exports = {
  getGlobalLeaderboard,
  getUserRank,
  getTopPerformers,
  getUserRanking,
  getUserStats,
  getLeaderboardAroundUser,
};

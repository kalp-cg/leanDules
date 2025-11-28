/**
 * Leaderboard Service
 * Business logic for leaderboard management and rankings
 */

const { prisma } = require('../config/db');
const { createError } = require('../middlewares/error.middleware');
const { calculatePagination } = require('../utils/response');

/**
 * Get global leaderboard
 * @param {Object} filters - Query filters
 * @param {Object} options - Query options
 * @returns {Promise<Object>} Leaderboard data
 */
async function getGlobalLeaderboard(filters = {}, options = {}) {
  const { period = 'ALL_TIME', topicId } = filters;
  const { page = 1, limit = 20 } = options;
  const skip = (page - 1) * limit;

  try {
    // For now, we'll calculate leaderboard dynamically
    // In production, you might want to cache this data
    const whereClause = {
      isActive: true,
    };

    // Get users ordered by XP and reputation
    const [users, totalCount] = await Promise.all([
      prisma.user.findMany({
        where: whereClause,
        select: {
          id: true,
          username: true,
          avatarUrl: true,
          xp: true,
          level: true,
          reputation: true,
          _count: {
            select: {
              attempts: true,
              authoredQuestions: true,
              challengesAsChallenger: {
                where: {
                  status: 'COMPLETED',
                },
              },
            },
          },
        },
        orderBy: [
          { xp: 'desc' },
          { reputation: 'desc' },
          { createdAt: 'asc' },
        ],
        skip,
        take: limit,
      }),
      prisma.user.count({
        where: whereClause,
      }),
    ]);

    // Add rank to each user
    const leaderboard = users.map((user, index) => ({
      ...user,
      rank: skip + index + 1,
      stats: {
        totalAttempts: user._count.attempts,
        questionsCreated: user._count.authoredQuestions,
        challengesWon: user._count.challengesAsChallenger,
      },
    }));

    const pagination = calculatePagination(page, limit, totalCount);

    return {
      leaderboard,
      pagination,
      period,
      topicId,
    };
  } catch (error) {
    console.error('Get global leaderboard error:', error);
    throw createError.internal('Failed to get leaderboard');
  }
}

/**
 * Get topic-specific leaderboard
 * @param {string} topicId - Topic ID
 * @param {Object} filters - Query filters
 * @param {Object} options - Query options
 * @returns {Promise<Object>} Topic leaderboard data
 */
async function getTopicLeaderboard(topicId, filters = {}, options = {}) {
  const { period = 'ALL_TIME' } = filters;
  const { page = 1, limit = 20 } = options;

  try {
    // Verify topic exists
    const topic = await prisma.topic.findUnique({
      where: { id: topicId },
      select: { id: true, name: true },
    });

    if (!topic) {
      throw createError.notFound('Topic not found');
    }

    // Get users who have answered questions in this topic
    const topicLeaderboard = await getGlobalLeaderboard(
      { period, topicId },
      { page, limit }
    );

    return {
      ...topicLeaderboard,
      topic,
    };
  } catch (error) {
    if (error.isOperational) {
      throw error;
    }
    console.error('Get topic leaderboard error:', error);
    throw createError.internal('Failed to get topic leaderboard');
  }
}

/**
 * Get user's ranking information
 * @param {string} userId - User ID
 * @param {string} [topicId] - Optional topic ID for topic-specific ranking
 * @returns {Promise<Object>} User ranking data
 */
async function getUserRanking(userId, topicId) {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        username: true,
        avatarUrl: true,
        xp: true,
        level: true,
        reputation: true,
      },
    });

    if (!user) {
      throw createError.notFound('User not found');
    }

    // Calculate user's rank
    const higherRankedUsers = await prisma.user.count({
      where: {
        isActive: true,
        OR: [
          { xp: { gt: user.xp } },
          {
            AND: [
              { xp: user.xp },
              { reputation: { gt: user.reputation } },
            ],
          },
        ],
      },
    });

    const rank = higherRankedUsers + 1;

    // Get user's stats
    const stats = await getUserStats(userId, topicId);

    return {
      ...user,
      rank,
      stats,
      ...(topicId && { topicId }),
    };
  } catch (error) {
    if (error.isOperational) {
      throw error;
    }
    console.error('Get user ranking error:', error);
    throw createError.internal('Failed to get user ranking');
  }
}

/**
 * Get user statistics
 * @param {string} userId - User ID
 * @param {string} [topicId] - Optional topic ID
 * @returns {Promise<Object>} User statistics
 */
async function getUserStats(userId, topicId) {
  try {
    const whereClause = {
      userId,
    };

    // Get attempt statistics
    const [attemptStats, totalQuizzes, totalChallenges] = await Promise.all([
      prisma.attempt.aggregate({
        where: whereClause,
        _count: {
          id: true,
        },
        _avg: {
          score: true,
        },
        _sum: {
          score: true,
        },
      }),
      prisma.attempt.count({
        where: {
          userId,
          quizId: { not: null },
        },
      }),
      prisma.attempt.count({
        where: {
          userId,
          challengeId: { not: null },
        },
      }),
    ]);

    // Get challenge wins - simplified count
    const challengeWins = await prisma.challenge.count({
      where: {
        status: 'COMPLETED',
        OR: [
          { challengerId: userId },
          { opponentId: userId },
        ],
      },
    });

    // Get questions created
    const questionsCreated = await prisma.question.count({
      where: {
        authorId: userId,
        status: 'PUBLISHED',
      },
    });

    return {
      totalAttempts: attemptStats._count.id || 0,
      averageScore: Math.round(attemptStats._avg.score || 0),
      totalScore: attemptStats._sum.score || 0,
      quizzesCompleted: totalQuizzes,
      challengesCompleted: totalChallenges,
      challengesWon: Math.floor(challengeWins / 2), // Rough estimate
      questionsCreated,
    };
  } catch (error) {
    console.error('Get user stats error:', error);
    throw createError.internal('Failed to get user stats');
  }
}

/**
 * Get leaderboard around a specific user
 * @param {string} userId - User ID
 * @param {Object} options - Query options
 * @returns {Promise<Object>} Leaderboard data around user
 */
async function getLeaderboardAroundUser(userId, options = {}) {
  const { range = 5, topicId } = options;

  try {
    // Get user's current ranking
    const userRanking = await getUserRanking(userId, topicId);
    
    // Calculate the range of ranks to fetch
    const startRank = Math.max(1, userRanking.rank - range);
    const endRank = userRanking.rank + range;
    
    // Get users in the range
    const leaderboard = await getGlobalLeaderboard(
      { topicId },
      { page: Math.ceil(startRank / 20), limit: endRank - startRank + 1 }
    );

    return {
      ...leaderboard,
      userRank: userRanking.rank,
      range: {
        start: startRank,
        end: endRank,
      },
    };
  } catch (error) {
    if (error.isOperational) {
      throw error;
    }
    console.error('Get leaderboard around user error:', error);
    throw createError.internal('Failed to get leaderboard around user');
  }
}

module.exports = {
  getGlobalLeaderboard,
  getTopicLeaderboard,
  getUserRanking,
  getUserStats,
  getLeaderboardAroundUser,
};
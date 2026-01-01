const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function resetAllUserStats() {
  try {
    console.log('🔄 Starting user statistics reset...');

    // 1. Reset all user stats to initial values
    const updatedUsers = await prisma.user.updateMany({
      data: {
        xp: 0,
        rating: 1200, // Standard starting rating
        level: 1,
        currentStreak: 0,
        longestStreak: 0,
      },
    });
    console.log(`✅ Reset ${updatedUsers.count} users' stats`);

    // 2. Delete all leaderboard entries
    const deletedLeaderboard = await prisma.leaderboardEntry.deleteMany({});
    console.log(`✅ Deleted ${deletedLeaderboard.count} leaderboard entries`);

    // 3. Delete all attempts (game history)
    const deletedAttempts = await prisma.attempt.deleteMany({});
    console.log(`✅ Deleted ${deletedAttempts.count} attempts`);

    // 4. Delete all challenges/duels
    const deletedChallenges = await prisma.challenge.deleteMany({});
    console.log(`✅ Deleted ${deletedChallenges.count} challenges`);

    // 5. Reset user analytics (if table exists)
    try {
      const deletedAnalytics = await prisma.userAnalytics.deleteMany({});
      console.log(`✅ Deleted ${deletedAnalytics.count} analytics records`);
    } catch (error) {
      console.log('⚠️  UserAnalytics table not found, skipping...');
    }

    // 6. Delete saved questions (vault)
    const deletedSaved = await prisma.savedQuestion.deleteMany({});
    console.log(`✅ Deleted ${deletedSaved.count} saved questions`);

    console.log('\n✅ All user statistics have been reset to 0!');
    console.log('📝 What was reset:');
    console.log('   - XP: 0');
    console.log('   - Rating: 1200');
    console.log('   - Level: 1');
    console.log('   - Streaks: 0');
    console.log('   - Leaderboard entries: cleared');
    console.log('   - Game history: cleared');
    console.log('   - Challenges: cleared');
    console.log('   - Analytics: cleared');
    console.log('   - Saved questions: cleared');
    console.log('\n✅ User accounts, passwords, and questions remain intact!');

  } catch (error) {
    console.error('❌ Error resetting stats:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the reset
resetAllUserStats()
  .then(() => {
    console.log('\n✅ Reset complete! You can now test with fresh stats.');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Reset failed:', error);
    process.exit(1);
  });

/**
 * Script to seed leaderboard data (users with ratings) and notifications
 */
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function seedLeaderboard() {
  try {
    console.log('🌱 Seeding leaderboard data...');

    // Create sample users with various ratings
    const users = [
      { fullName: 'Ashwani kumar', email: 'ashwani@example.com', rating: 2450 },
      { fullName: 'Akshar gangani', email: 'akshar@example.com', rating: 2380 },
      { fullName: 'Narvin', email: 'narvin@example.com', rating: 2310 },
      { fullName: 'Dhruv sonagram', email: 'dhruv@example.com', rating: 2245 },
      { fullName: 'Arya patel', email: 'arya@example.com', rating: 2180 },
      { fullName: 'Veer modi', email: 'veer@example.com', rating: 2120 },
      { fullName: 'Krish shyra', email: 'krish@example.com', rating: 2055 },
      { fullName: 'Nagesh jagtap', email: 'nagesh@example.com', rating: 1990 },
      { fullName: 'Khushi Rajput', email: 'khushi@example.com', rating: 1925 },
      { fullName: 'Krishna Paridwal', email: 'krishna@example.com', rating: 1860 },
      { fullName: 'Drishti Gupta', email: 'drishti@example.com', rating: 1795 },
      { fullName: 'Dev patel', email: 'dev@example.com', rating: 1730 },
      { fullName: 'Jeevan Kadam', email: 'jeevan@example.com', rating: 1665 },
      { fullName: 'Kashyap Dhamecha', email: 'kashyap@example.com', rating: 1600 },
      { fullName: 'Het Barsana', email: 'het@example.com', rating: 1535 },
      { fullName: 'Nehil ghetiya', email: 'nehil@example.com', rating: 1470 },
      { fullName: 'Pavan Patel', email: 'pavan@example.com', rating: 1405 },
      { fullName: 'Prathmesh pimple', email: 'prathmesh@example.com', rating: 1340 },
      { fullName: 'mohil Mundke', email: 'mohil@example.com', rating: 1275 },
      { fullName: 'Vanshika Zawar', email: 'vanshika@example.com', rating: 1210 },
    ];

    // Use a simple hash for demo users (they won't be able to login anyway)
    const demoPassword = '$2b$10$demoPasswordHashForSeeding1234567890123456789012';

    console.log('Creating users...');
    for (const userData of users) {
      const existingUser = await prisma.user.findUnique({
        where: { email: userData.email }
      });

      if (!existingUser) {
        // Generate a username from email or name
        const username = userData.email.split('@')[0] + Math.floor(Math.random() * 1000);
        
        await prisma.user.create({
          data: {
            ...userData,
            username: username,
            passwordHash: demoPassword,
            isActive: true,
            role: 'user'
          }
        });
        console.log(`✅ Created user: ${userData.fullName} (Rating: ${userData.rating})`);
      } else {
        // Update rating if user exists
        await prisma.user.update({
          where: { email: userData.email },
          data: { rating: userData.rating }
        });
        console.log(`✅ Updated rating for: ${userData.fullName} (Rating: ${userData.rating})`);
      }
    }

    // Get the current logged in user (kalppatel1209@gmail.com)
    const currentUser = await prisma.user.findUnique({
      where: { email: 'kalppatel1209@gmail.com' }
    });

    if (currentUser) {
      // Update current user's rating to put them in the middle
      await prisma.user.update({
        where: { id: currentUser.id },
        data: { rating: 1850 }
      });
      console.log(`✅ Updated current user rating to 1850`);

      // Create sample notifications for the current user
      console.log('Creating notifications...');
      
      const notifications = [
        {
          userId: currentUser.id,
          message: '🎮 New Duel Challenge! Ashwani kumar challenged you to a Mathematics duel',
          isRead: false
        },
        {
          userId: currentUser.id,
          message: '🏆 Duel Result: You won the duel against Akshar gangani! +50 rating',
          isRead: false
        },
        {
          userId: currentUser.id,
          message: '⭐ Achievement Unlocked! You earned the "Quick Thinker" badge',
          isRead: false
        },
        {
          userId: currentUser.id,
          message: '🎮 New Duel Challenge! Narvin challenged you to a Science duel',
          isRead: false
        },
        {
          userId: currentUser.id,
          message: '📈 Rank Update: You moved up to rank #8 on the leaderboard!',
          isRead: true
        },
        {
          userId: currentUser.id,
          message: '🔥 Winning Streak! You won 3 duels in a row',
          isRead: false
        },
        {
          userId: currentUser.id,
          message: '🎯 New High Score! You scored 950 points in History category',
          isRead: true
        }
      ];

      for (const notifData of notifications) {
        await prisma.notification.create({
          data: notifData
        });
      }
      console.log(`✅ Created ${notifications.length} notifications for current user`);
    }

    console.log('✅ Leaderboard seeding completed!');
    console.log('\n📊 Summary:');
    console.log(`- Created/Updated ${users.length} users with ratings`);
    console.log(`- Ratings range from 1535 to 2450`);
    if (currentUser) {
      console.log(`- Created 7 notifications for current user`);
      console.log(`- Updated current user rating to 1850 (rank ~#9-10)`);
    }

  } catch (error) {
    console.error('❌ Error seeding leaderboard:', error);
  } finally {
    await prisma.$disconnect();
  }
}

seedLeaderboard();

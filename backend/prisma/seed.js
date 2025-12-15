const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');

  // Clear existing data (in correct order to avoid FK constraints)
  await prisma.notification.deleteMany();
  await prisma.flag.deleteMany();
  await prisma.adminLog.deleteMany();
  await prisma.leaderboardEntry.deleteMany();
  await prisma.attempt.deleteMany();
  await prisma.challengeParticipant.deleteMany();
  await prisma.challenge.deleteMany();
  await prisma.questionSetQuestion.deleteMany();
  await prisma.questionSet.deleteMany();
  await prisma.duelAnswer.deleteMany();
  await prisma.duelQuestion.deleteMany();
  await prisma.duel.deleteMany();
  await prisma.questionTopic.deleteMany();
  await prisma.question.deleteMany();
  await prisma.topic.deleteMany();
  await prisma.userFollower.deleteMany();
  await prisma.refreshToken.deleteMany();
  await prisma.report.deleteMany();
  await prisma.user.deleteMany();

  console.log('✅ Cleared existing data');

  // Create users with new schema fields
  const hashedPassword = await bcrypt.hash('password123', 10);
  
  const users = await Promise.all([
    prisma.user.create({
      data: {
        fullName: 'Admin User',
        email: 'admin@learnduels.com',
        passwordHash: hashedPassword,
        role: 'admin',
        rating: 2000,
        isActive: true,
      },
    }),
    prisma.user.create({
      data: {
        fullName: 'John Doe',
        email: 'john@example.com',
        passwordHash: hashedPassword,
        role: 'user',
        rating: 1500,
        isActive: true,
      },
    }),
    prisma.user.create({
      data: {
        fullName: 'Jane Smith',
        email: 'jane@example.com',
        passwordHash: hashedPassword,
        role: 'user',
        rating: 1600,
        isActive: true,
      },
    }),
    prisma.user.create({
      data: {
        fullName: 'Bob Wilson',
        email: 'bob@example.com',
        passwordHash: hashedPassword,
        role: 'user',
        rating: 1400,
        isActive: true,
      },
    }),
    prisma.user.create({
      data: {
        fullName: 'Alice Johnson',
        email: 'alice@example.com',
        passwordHash: hashedPassword,
        role: 'user',
        rating: 1700,
        isActive: true,
      },
    }),
  ]);

  console.log(`✅ Created ${users.length} users`);

  // Create categories
  const categories = await Promise.all([
    prisma.category.create({ data: { name: 'Mathematics' } }),
    prisma.category.create({ data: { name: 'Science' } }),
    prisma.category.create({ data: { name: 'History' } }),
    prisma.category.create({ data: { name: 'Geography' } }),
    prisma.category.create({ data: { name: 'Programming' } }),
    prisma.category.create({ data: { name: 'English' } }),
  ]);

  console.log(`✅ Created ${categories.length} categories`);

  // Create difficulties
  const difficulties = await Promise.all([
    prisma.difficulty.create({ data: { level: 'Easy' } }),
    prisma.difficulty.create({ data: { level: 'Medium' } }),
    prisma.difficulty.create({ data: { level: 'Hard' } }),
  ]);

  console.log(`✅ Created ${difficulties.length} difficulty levels`);

  // Create questions
  const mathQuestions = [
    {
      categoryId: categories[0].id,
      difficultyId: difficulties[0].id,
      questionText: 'What is 2 + 2?',
      optionA: '3',
      optionB: '4',
      optionC: '5',
      optionD: '6',
      correctOption: 'B',
      authorId: users[0].id,
    },
    {
      categoryId: categories[0].id,
      difficultyId: difficulties[1].id,
      questionText: 'What is the square root of 144?',
      optionA: '10',
      optionB: '11',
      optionC: '12',
      optionD: '13',
      correctOption: 'C',
      authorId: users[0].id,
    },
    {
      categoryId: categories[0].id,
      difficultyId: difficulties[2].id,
      questionText: 'What is the derivative of x²?',
      optionA: 'x',
      optionB: '2x',
      optionC: 'x²',
      optionD: '2',
      correctOption: 'B',
      authorId: users[0].id,
    },
  ];

  const scienceQuestions = [
    {
      categoryId: categories[1].id,
      difficultyId: difficulties[0].id,
      questionText: 'What is the chemical symbol for water?',
      optionA: 'H2O',
      optionB: 'CO2',
      optionC: 'O2',
      optionD: 'N2',
      correctOption: 'A',
      authorId: users[0].id,
    },
    {
      categoryId: categories[1].id,
      difficultyId: difficulties[1].id,
      questionText: 'What planet is known as the Red Planet?',
      optionA: 'Venus',
      optionB: 'Mars',
      optionC: 'Jupiter',
      optionD: 'Saturn',
      correctOption: 'B',
      authorId: users[0].id,
    },
  ];

  const programmingQuestions = [
    {
      categoryId: categories[4].id,
      difficultyId: difficulties[1].id,
      questionText: 'What does HTML stand for?',
      optionA: 'Hyper Text Markup Language',
      optionB: 'High Tech Modern Language',
      optionC: 'Home Tool Markup Language',
      optionD: 'Hyperlinks and Text Markup Language',
      correctOption: 'A',
      authorId: users[0].id,
    },
    {
      categoryId: categories[4].id,
      difficultyId: difficulties[2].id,
      questionText: 'Which programming paradigm does JavaScript primarily support?',
      optionA: 'Object-Oriented',
      optionB: 'Functional',
      optionC: 'Procedural',
      optionD: 'All of the above',
      correctOption: 'D',
      authorId: users[0].id,
    },
  ];

  const allQuestions = [...mathQuestions, ...scienceQuestions, ...programmingQuestions];
  
  const questions = await Promise.all(
    allQuestions.map((q) => prisma.question.create({ data: q }))
  );

  console.log(`✅ Created ${questions.length} questions`);

  // Create follow relationships
  await Promise.all([
    prisma.userFollower.create({
      data: { followerId: users[1].id, followingId: users[2].id },
    }),
    prisma.userFollower.create({
      data: { followerId: users[1].id, followingId: users[3].id },
    }),
    prisma.userFollower.create({
      data: { followerId: users[2].id, followingId: users[1].id },
    }),
    prisma.userFollower.create({
      data: { followerId: users[3].id, followingId: users[1].id },
    }),
    prisma.userFollower.create({
      data: { followerId: users[4].id, followingId: users[1].id },
    }),
  ]);

  console.log('✅ Created follow relationships');

  // Create a completed duel
  const duel = await prisma.duel.create({
    data: {
      player1Id: users[1].id,
      player2Id: users[2].id,
      winnerId: users[1].id,
      status: 'completed',
      completedAt: new Date(),
    },
  });

  // Add questions to duel
  await Promise.all(
    questions.slice(0, 5).map((q) =>
      prisma.duelQuestion.create({
        data: {
          duelId: duel.id,
          questionId: q.id,
        },
      })
    )
  );

  // Add answers
  await Promise.all([
    prisma.duelAnswer.create({
      data: {
        duelId: duel.id,
        playerId: users[1].id,
        questionId: questions[0].id,
        selectedOpt: 'B',
        isCorrect: true,
      },
    }),
    prisma.duelAnswer.create({
      data: {
        duelId: duel.id,
        playerId: users[2].id,
        questionId: questions[0].id,
        selectedOpt: 'A',
        isCorrect: false,
      },
    }),
  ]);

  console.log('✅ Created sample duel with answers');

  // Create leaderboard entries
  await Promise.all([
    prisma.leaderboard.create({
      data: {
        userId: users[1].id,
        totalDuels: 10,
        wins: 7,
        rating: 1500,
      },
    }),
    prisma.leaderboard.create({
      data: {
        userId: users[2].id,
        totalDuels: 8,
        wins: 5,
        rating: 1600,
      },
    }),
    prisma.leaderboard.create({
      data: {
        userId: users[3].id,
        totalDuels: 5,
        wins: 2,
        rating: 1400,
      },
    }),
  ]);

  console.log('✅ Created leaderboard entries');

  // Create notifications
  await Promise.all([
    prisma.notification.create({
      data: {
        userId: users[1].id,
        message: 'You won a duel against Jane Smith!',
        isRead: false,
      },
    }),
    prisma.notification.create({
      data: {
        userId: users[2].id,
        message: 'John Doe challenged you to a duel!',
        isRead: false,
      },
    }),
  ]);

  console.log('✅ Created notifications');

  console.log('🎉 Database seeded successfully!');
  console.log('\n📊 Summary:');
  console.log(`   Users: ${users.length}`);
  console.log(`   Categories: ${categories.length}`);
  console.log(`   Questions: ${questions.length}`);
  console.log(`   Duels: 1`);
  console.log('\n🔑 Test Credentials:');
  console.log('   Admin: admin@learnduels.com / password123');
  console.log('   User: john@example.com / password123');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

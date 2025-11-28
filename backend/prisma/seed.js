/**
 * Database Seed Script
 * Populates initial data for categories, difficulties, and demo users
 */

const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seeding...');

  // Seed Categories
  console.log('📚 Seeding categories...');
  const categories = [
    'Mathematics',
    'Science',
    'History',
    'Geography',
    'Literature',
    'Technology',
    'Sports',
    'Music',
    'Art',
    'General Knowledge',
  ];

  for (const name of categories) {
    await prisma.category.upsert({
      where: { name },
      update: {},
      create: { name },
    });
  }
  console.log('✅ Categories seeded');

  // Seed Difficulties
  console.log('🎯 Seeding difficulty levels...');
  const difficulties = ['Easy', 'Medium', 'Hard'];

  for (const level of difficulties) {
    await prisma.difficulty.upsert({
      where: { level },
      update: {},
      create: { level },
    });
  }
  console.log('✅ Difficulties seeded');

  // Seed Demo Users
  console.log('👥 Seeding demo users...');
  const passwordHash = await bcrypt.hash('demo123', 12);

  const demoUsers = [
    {
      fullName: 'Demo User 1',
      email: 'demo1@learnduels.com',
      passwordHash,
      role: 'user',
      rating: 1500,
    },
    {
      fullName: 'Demo User 2',
      email: 'demo2@learnduels.com',
      passwordHash,
      role: 'user',
      rating: 1200,
    },
    {
      fullName: 'Admin User',
      email: 'admin@learnduels.com',
      passwordHash,
      role: 'admin',
      rating: 2000,
    },
  ];

  for (const userData of demoUsers) {
    await prisma.user.upsert({
      where: { email: userData.email },
      update: {},
      create: userData,
    });
  }
  console.log('✅ Demo users seeded');

  // Seed Subscription Plans
  console.log('💳 Seeding subscription plans...');
  
  // Check if plans already exist
  const existingPlans = await prisma.subscriptionPlan.count();
  
  if (existingPlans === 0) {
    const plans = [
      {
        name: 'Free',
        price: 0,
        duration: 365,
        features: 'Basic access, 10 duels per day',
      },
      {
        name: 'Pro Monthly',
        price: 9.99,
        duration: 30,
        features: 'Unlimited duels, Ad-free, Priority matching, Custom themes',
      },
      {
        name: 'Pro Yearly',
        price: 99.99,
        duration: 365,
        features: 'Unlimited duels, Ad-free, Priority matching, Custom themes, Exclusive badges',
      },
    ];

    await prisma.subscriptionPlan.createMany({
      data: plans,
    });
  }
  console.log('✅ Subscription plans seeded');

  // Get category and difficulty IDs for sample questions
  const mathCategory = await prisma.category.findUnique({ where: { name: 'Mathematics' } });
  const easyDifficulty = await prisma.difficulty.findUnique({ where: { level: 'Easy' } });
  const mediumDifficulty = await prisma.difficulty.findUnique({ where: { level: 'Medium' } });
  const demoUser = await prisma.user.findUnique({ where: { email: 'demo1@learnduels.com' } });

  // Seed Sample Questions
  console.log('❓ Seeding sample questions...');
  const sampleQuestions = [
    {
      categoryId: mathCategory.id,
      difficultyId: easyDifficulty.id,
      authorId: demoUser.id,
      questionText: 'What is 2 + 2?',
      optionA: '3',
      optionB: '4',
      optionC: '5',
      optionD: '6',
      correctOption: 'B',
    },
    {
      categoryId: mathCategory.id,
      difficultyId: easyDifficulty.id,
      authorId: demoUser.id,
      questionText: 'What is 10 - 5?',
      optionA: '3',
      optionB: '4',
      optionC: '5',
      optionD: '6',
      correctOption: 'C',
    },
    {
      categoryId: mathCategory.id,
      difficultyId: mediumDifficulty.id,
      authorId: demoUser.id,
      questionText: 'What is 15 × 3?',
      optionA: '35',
      optionB: '40',
      optionC: '45',
      optionD: '50',
      correctOption: 'C',
    },
  ];

  for (const question of sampleQuestions) {
    await prisma.question.create({
      data: question,
    });
  }
  console.log('✅ Sample questions seeded');

  console.log('🎉 Database seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Seeding error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

/**
 * Script to seed questions into the database
 */
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function seedQuestions() {
  try {
    console.log('🌱 Seeding questions...');

    // Check if categories and difficulties exist
    const categories = await prisma.category.findMany();
    const difficulties = await prisma.difficulty.findMany();

    if (categories.length === 0) {
      console.log('❌ No categories found. Please create at least one category first.');
      return;
    }

    if (difficulties.length === 0) {
      console.log('❌ No difficulties found. Please create at least one difficulty first.');
      return;
    }

    // Get the first user (admin) as author
    const author = await prisma.user.findFirst();
    if (!author) {
      console.log('❌ No users found. Please create a user first.');
      return;
    }

    const categoryId = categories[0].id;
    const difficultyId = difficulties[0].id;
    const authorId = author.id;

    // Create sample questions
    const questions = [
      {
        categoryId,
        difficultyId,
        authorId,
        questionText: "What is 2 + 2?",
        optionA: "3",
        optionB: "4",
        optionC: "5",
        optionD: "6",
        correctOption: "B"
      },
      {
        categoryId,
        difficultyId,
        authorId,
        questionText: "What is 10 - 5?",
        optionA: "3",
        optionB: "4",
        optionC: "5",
        optionD: "6",
        correctOption: "C"
      },
      {
        categoryId,
        difficultyId,
        authorId,
        questionText: "What is 3 × 3?",
        optionA: "6",
        optionB: "9",
        optionC: "12",
        optionD: "15",
        correctOption: "B"
      },
      {
        categoryId,
        difficultyId,
        authorId,
        questionText: "What is 20 ÷ 4?",
        optionA: "4",
        optionB: "5",
        optionC: "6",
        optionD: "7",
        correctOption: "B"
      },
      {
        categoryId,
        difficultyId,
        authorId,
        questionText: "What is 7 + 8?",
        optionA: "13",
        optionB: "14",
        optionC: "15",
        optionD: "16",
        correctOption: "C"
      }
    ];

    // Check if questions already exist
    const existingQuestions = await prisma.question.count();
    if (existingQuestions > 0) {
      console.log(`⚠️  ${existingQuestions} questions already exist in the database.`);
      console.log('✅ Skipping question seeding.');
      return;
    }

    // Insert questions
    for (const question of questions) {
      await prisma.question.create({ data: question });
    }

    console.log(`✅ Successfully seeded ${questions.length} questions!`);
    console.log('\n📊 Summary:');
    console.log(`   - Category: ${categories[0].name} (ID: ${categoryId})`);
    console.log(`   - Difficulty: ${difficulties[0].level} (ID: ${difficultyId})`);
    console.log(`   - Author: ${author.fullName} (ID: ${authorId})`);
    console.log('\n🎯 You can now create duels and test the API!');

  } catch (error) {
    console.error('❌ Error seeding questions:', error.message);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

seedQuestions()
  .then(() => {
    console.log('\n✅ Seeding completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Seeding failed:', error);
    process.exit(1);
  });

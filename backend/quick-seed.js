const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkAndSeed() {
  try {
    // Check current questions
    const count = await prisma.question.count({
      where: { deletedAt: null }
    });
    console.log(`Current questions in DB: ${count}`);

    // Delete all existing questions
    await prisma.$executeRaw`DELETE FROM "DuelQuestion"`;
    await prisma.$executeRaw`UPDATE "Question" SET "deletedAt" = NOW()`;
    console.log('✅ Deleted all old questions');

    // Import and seed real questions
    const scrapedQuestions = require('../questions_scrapping/javascript.js');
    console.log(`Found ${scrapedQuestions.length} questions in scrapping folder`);

    // Get or create JavaScript topic
    let jsTopic = await prisma.topic.findFirst({ where: { slug: 'javascript' } });
    if (!jsTopic) {
      let progTopic = await prisma.topic.findFirst({ where: { slug: 'programming' } });
      if (!progTopic) {
        progTopic = await prisma.topic.create({ data: { name: 'Programming', slug: 'programming' } });
      }
      jsTopic = await prisma.topic.create({
        data: { name: 'JavaScript', slug: 'javascript', parentId: progTopic.id }
      });
    }

    // Get admin
    const admin = await prisma.user.findFirst({ where: { role: 'admin' } });
    if (!admin) {
      console.error('❌ No admin found');
      return;
    }

    // Seed questions
    let created = 0;
    for (let i = 0; i < scrapedQuestions.length; i++) {
      const q = scrapedQuestions[i];
      
      const options = q.options.map((opt, idx) => ({
        id: String.fromCharCode(97 + idx),
        text: opt
      }));

      const correctIdx = q.options.indexOf(q.answer);
      const correctAnswer = String.fromCharCode(97 + correctIdx);

      const difficulty = i % 3 === 0 ? 'easy' : i % 3 === 1 ? 'medium' : 'hard';

      await prisma.question.create({
        data: {
          content: q.question,
          options: options,
          correctAnswer: correctAnswer,
          difficulty: difficulty,
          explanation: q.explanation,
          timeLimit: difficulty === 'hard' ? 45 : 30,
          type: 'mcq',
          status: 'published',
          authorId: admin.id,
          topics: { create: { topicId: jsTopic.id } }
        }
      });
      created++;
    }

    console.log(`✅ Created ${created} real JavaScript questions!`);
    
    // Verify
    const newCount = await prisma.question.count({
      where: { deletedAt: null, status: 'published' }
    });
    console.log(`Total published questions now: ${newCount}`);

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

checkAndSeed();

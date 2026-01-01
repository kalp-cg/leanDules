const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Import questions from scrapping folder
const scrapedQuestions = require('../questions_scrapping/javascript.js');

async function seedJavaScriptQuestions() {
  try {
    console.log('🚀 Starting JavaScript questions seed from questions_scrapping folder...');

    // Find or create JavaScript topic
    let jsTopic = await prisma.topic.findFirst({
      where: { slug: 'javascript' }
    });

    if (!jsTopic) {
      let programmingTopic = await prisma.topic.findFirst({
        where: { slug: 'programming' }
      });

      if (!programmingTopic) {
        programmingTopic = await prisma.topic.create({
          data: { name: 'Programming', slug: 'programming' }
        });
      }

      jsTopic = await prisma.topic.create({
        data: {
          name: 'JavaScript',
          slug: 'javascript',
          description: 'JavaScript programming language',
          parentId: programmingTopic.id
        }
      });
    }

    // Find admin user
    const admin = await prisma.user.findFirst({
      where: { role: 'admin' }
    });

    if (!admin) {
      console.error('❌ No admin user found. Create an admin first.');
      return;
    }

    console.log(`✅ JavaScript topic (ID: ${jsTopic.id})`);
    console.log(`✅ Admin user (ID: ${admin.id})`);

    // Transform scraped questions
    const jsQuestions = scrapedQuestions.map((q, index) => {
      const optionsArray = q.options.map((opt, i) => ({
        id: String.fromCharCode(97 + i),
        text: opt
      }));

      const correctIndex = q.options.indexOf(q.answer);
      const correctAnswerId = String.fromCharCode(97 + correctIndex);

      let difficulty = 'easy';
      if (index % 3 === 1) difficulty = 'medium';
      if (index % 3 === 2) difficulty = 'hard';

      return {
        content: q.question,
        options: optionsArray,
        correctAnswer: correctAnswerId,
        difficulty,
        explanation: q.explanation,
        timeLimit: difficulty === 'hard' ? 45 : 30
      };
    });

    console.log(`\n📝 Creating ${jsQuestions.length} questions...\n`);

    let created = 0;

    for (const q of jsQuestions) {
      const existing = await prisma.question.findFirst({
        where: { content: q.content, deletedAt: null }
      });

      if (existing) {
        console.log(`⏭️  Skipped: "${q.content.substring(0, 50)}..."`);
        continue;
      }

      await prisma.question.create({
        data: {
          content: q.content,
          options: q.options,
          correctAnswer: q.correctAnswer,
          difficulty: q.difficulty,
          explanation: q.explanation,
          timeLimit: q.timeLimit,
          type: 'mcq',
          status: 'published',
          authorId: admin.id,
          topics: {
            create: { topicId: jsTopic.id }
          }
        }
      });

      console.log(`✅ Created: "${q.content.substring(0, 60)}..." (${q.difficulty})`);
      created++;
    }

    console.log(`\n✅ Complete! Created ${created}/${jsQuestions.length} questions\n`);

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

seedJavaScriptQuestions();

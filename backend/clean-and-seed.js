const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function cleanAndSeed() {
  try {
    console.log('🗑️  Step 1: Removing ALL questions from database...');
    
    // Delete all duel questions first (foreign key constraint)
    await prisma.$executeRaw`DELETE FROM "DuelQuestion"`;
    await prisma.$executeRaw`DELETE FROM "QuestionSetItem"`;
    await prisma.$executeRaw`DELETE FROM "QuestionTopic"`;
    await prisma.$executeRaw`DELETE FROM "Attempt"`;
    await prisma.$executeRaw`DELETE FROM "SavedQuestion"`;
    
    // Delete all questions
    await prisma.$executeRaw`DELETE FROM "Question"`;
    
    console.log('✅ All questions deleted from database\n');
    
    console.log('📥 Step 2: Loading questions from questions_scrapping/javascript.js...');
    
    // Import scraped questions
    const scrapedQuestions = require('../questions_scrapping/javascript.js');
    console.log(`Found ${scrapedQuestions.length} JavaScript questions\n`);
    
    // Get or create JavaScript topic
    let jsTopic = await prisma.topic.findFirst({ where: { slug: 'javascript' } });
    
    if (!jsTopic) {
      let progTopic = await prisma.topic.findFirst({ where: { slug: 'programming' } });
      if (!progTopic) {
        progTopic = await prisma.topic.create({
          data: { name: 'Programming', slug: 'programming' }
        });
      }
      jsTopic = await prisma.topic.create({
        data: {
          name: 'JavaScript',
          slug: 'javascript',
          description: 'JavaScript programming language',
          parentId: progTopic.id
        }
      });
    }
    
    // Get admin user
    const admin = await prisma.user.findFirst({ where: { role: 'admin' } });
    if (!admin) {
      console.error('❌ No admin user found. Create an admin user first.');
      return;
    }
    
    console.log(`✅ Using JavaScript topic (ID: ${jsTopic.id})`);
    console.log(`✅ Using admin user (ID: ${admin.id})\n`);
    
    console.log('💾 Step 3: Adding real JavaScript questions to database...\n');
    
    let created = 0;
    
    for (let i = 0; i < scrapedQuestions.length; i++) {
      const q = scrapedQuestions[i];
      
      // Transform to proper format
      const options = q.options.map((opt, idx) => ({
        id: String.fromCharCode(97 + idx), // a, b, c, d
        text: opt
      }));
      
      // Find correct answer
      const correctIdx = q.options.indexOf(q.answer);
      const correctAnswer = String.fromCharCode(97 + correctIdx);
      
      // Distribute difficulty
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
          topics: {
            create: {
              topicId: jsTopic.id
            }
          }
        }
      });
      
      created++;
      if (created % 10 === 0) {
        console.log(`   ✅ Added ${created} questions...`);
      }
    }
    
    console.log(`\n🎉 SUCCESS! Added ${created} real JavaScript questions to database!`);
    
    // Verify
    const total = await prisma.question.count({
      where: { deletedAt: null, status: 'published' }
    });
    
    console.log(`\n📊 Final Count: ${total} published questions in database`);
    
    // Show sample
    const sample = await prisma.question.findMany({
      where: { deletedAt: null },
      select: { content: true, difficulty: true },
      take: 3
    });
    
    console.log('\n📝 Sample questions:');
    sample.forEach(q => console.log(`   - [${q.difficulty}] ${q.content.substring(0, 60)}...`));
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

cleanAndSeed();

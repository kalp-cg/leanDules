const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();

const USERS_LIST = [
  "Kanishka", "Krish", "Dax", "Priy", "Dhruvesh", "Nehil", "Het", "Pawan", 
  "Aniket", "Arya", "Kiran", "Vanshika 1", "Vanshika 2", "Khushi", "Kalpan", 
  "Isha", "RIjans", "Dhruv", "Jatin", "Ishita", "Kalp", "Dristi", "Mahir", 
  "Kk", "Homasvi", "Jatan", "Garvit", "Priyasha", "Khushbu", "Dhruvil", 
  "Yashvi", "Arjun", "Krishna", "Deep", "Dev", "Kashyap", "Shubham"
];

const TOPIC_MAPPING = {
  'cpp.js': 'C++',
  'dsa_array.js': 'DSA Arrays',
  'dsa_string.js': 'DSA Strings',
  'express.js': 'Express.js',
  'javascript.js': 'JavaScript',
  'next.js': 'Next.js',
  'node.js': 'Node.js',
  'operating_systems.js': 'Operating Systems',
  'python.js': 'Python',
  'react.js': 'React'
};

async function main() {
  console.log('🌱 Starting full database seed...');

  // 1. Create Users
  console.log('👥 Creating users...');
  const passwordHash = await bcrypt.hash('User0000', 10);
  
  for (const name of USERS_LIST) {
    // Generate a unique username and email
    const cleanName = name.replace(/\s+/g, '').toLowerCase();
    const username = cleanName;
    const email = `${cleanName}@example.com`;

    try {
      await prisma.user.upsert({
        where: { email },
        update: {},
        create: {
          username,
          fullName: name,
          email,
          passwordHash,
          role: 'user',
          isActive: true,
          xp: Math.floor(Math.random() * 1000), // Random XP
          reputation: Math.floor(Math.random() * 100), // Random Rep
          level: Math.floor(Math.random() * 10) + 1, // Random Level
          currentStreak: Math.floor(Math.random() * 5),
          longestStreak: Math.floor(Math.random() * 10),
        },
      });
      process.stdout.write('.');
    } catch (e) {
      console.log(`\n⚠️ Skipped ${name}: ${e.message.split('\n')[0]}`);
    }
  }
  console.log('\n✅ Users created.');

  // 2. Import Questions
  console.log('📚 Importing questions...');
  const scrapingDir = path.join(__dirname, '../../questions_scrapping');
  
  if (!fs.existsSync(scrapingDir)) {
    console.error(`❌ Questions directory not found at ${scrapingDir}`);
    return;
  }

  const adminUser = await prisma.user.findFirst({ where: { username: 'kalp' } }) || await prisma.user.findFirst();

  const files = fs.readdirSync(scrapingDir).filter(f => f.endsWith('.js') && f !== 'test_scrape.js');

  for (const file of files) {
    const topicName = TOPIC_MAPPING[file] || file.replace('.js', '');
    console.log(`\nProcessing ${topicName} (${file})...`);

    // Create or get Topic
    const slug = topicName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    
    const topic = await prisma.topic.upsert({
      where: { name: topicName },
      update: {},
      create: {
        name: topicName,
        slug: slug,
        description: `Questions about ${topicName}`,
      },
    });

    // Read and parse file
    const filePath = path.join(scrapingDir, file);
    const content = fs.readFileSync(filePath, 'utf8');
    
    if (!content.trim()) {
      console.log(`⚠️ Skipping empty file: ${file}`);
      continue;
    }

    // Extract the array using a safe eval-like approach
    // We assume the file has `const questions = [...]`
    let questionsData = [];
    try {
      // Remove "const questions =" and any trailing semicolon, then parse
      // This is a bit hacky but avoids full eval
      // Better: use new Function
      const getQuestions = new Function(`
        const module = { exports: {} };
        ${content}
        if (Array.isArray(module.exports) && module.exports.length > 0) {
            return module.exports;
        }
        if (typeof questions !== 'undefined') {
            return questions;
        }
        return [];
      `);
      questionsData = getQuestions();
    } catch (e) {
      console.error(`❌ Failed to parse ${file}: ${e.message}`);
      continue;
    }

    console.log(`Found ${questionsData.length} questions.`);

    let count = 0;
    for (const q of questionsData) {
      // Find correct option index
      // The schema expects option1, option2, option3, option4 and correctOption (1-4)
      // But the scraping format has options array and answer string
      
      const options = q.options;
      const answerText = q.answer;
      
      // Find index of answer (0-3) -> (1-4)
      let correctIndex = options.indexOf(answerText);
      
      // Handle case where answer text might not match exactly or is A/B/C/D
      if (correctIndex === -1) {
        // Try to match loosely? Or just default to 1 and log warning
        // console.warn(`  ⚠️ Answer "${answerText}" not found in options for "${q.question.substring(0, 20)}..."`);
        // Some scraping data might have "Option A" etc.
        // For now, skip if not found
        continue; 
      }

      // Check if question already exists to avoid duplicates (idempotency)
      const existingQuestion = await prisma.question.findFirst({
        where: { 
          content: q.question,
          topics: {
            some: {
              topicId: topic.id
            }
          }
        }
      });

      if (existingQuestion) {
        // Update existing question if needed, or just skip
        // For now we skip to prevent duplicates
        continue;
      }

      // Create Question
      await prisma.question.create({
        data: {
          content: q.question,
          type: 'mcq',
          difficulty: 'medium',
          timeLimit: 30,
          explanation: q.explanation,
          status: 'published',
          authorId: adminUser.id,
          options: options.map((opt, idx) => ({ id: String.fromCharCode(65 + idx), text: opt })),
          correctAnswer: String.fromCharCode(65 + correctIndex),
          topics: {
            create: {
              topicId: topic.id
            }
          }
        },
      });
      count++;
      process.stdout.write('.');
    }
    console.log(`\n✅ Imported ${count} questions for ${topicName}`);
  }

  console.log('\n✨ Seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

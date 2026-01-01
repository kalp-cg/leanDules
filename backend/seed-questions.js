/**
 * Seed script to populate Topics and Questions for Duels
 */
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const topics = [
  { name: 'General Knowledge', slug: 'general-knowledge', description: 'Test your general awareness' },
  { name: 'Science', slug: 'science', description: 'Physics, Chemistry, Biology and more' },
  { name: 'History', slug: 'history', description: 'World history, events and figures' },
  { name: 'Technology', slug: 'technology', description: 'Computers, AI, and modern tech' },
  { name: 'Sports', slug: 'sports', description: 'Games, athletes and championships' },
  { name: 'Geography', slug: 'geography', description: 'Countries, capitals, and landscapes' },
  { name: 'Movies', slug: 'movies', description: 'Cinema, actors, and films' },
  { name: 'Music', slug: 'music', description: 'Songs, albums, and artists' }
];

const sampleQuestions = {
  'general-knowledge': [
    {
      content: 'What is the capital of France?',
      options: [
        { id: 'A', text: 'London' },
        { id: 'B', text: 'Berlin' },
        { id: 'C', text: 'Paris' },
        { id: 'D', text: 'Madrid' }
      ],
      correctAnswer: 'C',
      difficulty: 'easy'
    },
    {
      content: 'Who painted the Mona Lisa?',
      options: [
        { id: 'A', text: 'Van Gogh' },
        { id: 'B', text: 'Leonardo da Vinci' },
        { id: 'C', text: 'Picasso' },
        { id: 'D', text: 'Michelangelo' }
      ],
      correctAnswer: 'B',
      difficulty: 'medium'
    },
    {
      content: 'Which planet is known as the Red Planet?',
      options: [
        { id: 'A', text: 'Venus' },
        { id: 'B', text: 'Mars' },
        { id: 'C', text: 'Jupiter' },
        { id: 'D', text: 'Saturn' }
      ],
      correctAnswer: 'B',
      difficulty: 'easy'
    },
    {
      content: 'What is the largest ocean on Earth?',
      options: [
        { id: 'A', text: 'Atlantic Ocean' },
        { id: 'B', text: 'Indian Ocean' },
        { id: 'C', text: 'Arctic Ocean' },
        { id: 'D', text: 'Pacific Ocean' }
      ],
      correctAnswer: 'D',
      difficulty: 'medium'
    },
    {
      content: 'What is the currency of Japan?',
      options: [
        { id: 'A', text: 'Yen' },
        { id: 'B', text: 'Won' },
        { id: 'C', text: 'Dollar' },
        { id: 'D', text: 'Euro' }
      ],
      correctAnswer: 'A',
      difficulty: 'medium'
    },
    {
      content: 'How many continents are there?',
      options: [
        { id: 'A', text: '5' },
        { id: 'B', text: '6' },
        { id: 'C', text: '7' },
        { id: 'D', text: '8' }
      ],
      correctAnswer: 'C',
      difficulty: 'easy'
    },
    {
      content: 'Which is the tallest animal in the world?',
      options: [
        { id: 'A', text: 'Elephant' },
        { id: 'B', text: 'Giraffe' },
        { id: 'C', text: 'Blue Whale' },
        { id: 'D', text: 'Ostrich' }
      ],
      correctAnswer: 'B',
      difficulty: 'easy'
    },
    {
      content: 'Who wrote "Hamlet"?',
      options: [
        { id: 'A', text: 'Charles Dickens' },
        { id: 'B', text: 'Mark Twain' },
        { id: 'C', text: 'William Shakespeare' },
        { id: 'D', text: 'Jane Austen' }
      ],
      correctAnswer: 'C',
      difficulty: 'medium'
    },
    {
      content: 'What is the chemical symbol for Gold?',
      options: [
        { id: 'A', text: 'Au' },
        { id: 'B', text: 'Ag' },
        { id: 'C', text: 'Fe' },
        { id: 'D', text: 'Pb' }
      ],
      correctAnswer: 'A',
      difficulty: 'hard'
    },
    {
      content: 'In which year did World War II end?',
      options: [
        { id: 'A', text: '1942' },
        { id: 'B', text: '1945' },
        { id: 'C', text: '1950' },
        { id: 'D', text: '1939' }
      ],
      correctAnswer: 'B',
      difficulty: 'hard'
    }

  ],
  'science': [
    {
      content: 'What is the powerhouse of the cell?',
      options: [
        { id: 'A', text: 'Nucleus' },
        { id: 'B', text: 'Mitochondria' },
        { id: 'C', text: 'Ribosome' },
        { id: 'D', text: 'Golgi body' }
      ],
      correctAnswer: 'B',
      difficulty: 'medium'
    },
    {
      content: 'What is the speed of light?',
      options: [
        { id: 'A', text: '300,000 km/s' },
        { id: 'B', text: '150,000 km/s' },
        { id: 'C', text: '1,000 km/s' },
        { id: 'D', text: 'Light has no speed' }
      ],
      correctAnswer: 'A',
      difficulty: 'hard'
    },
    {
      content: 'What gas do plants absorb from the atmosphere?',
      options: [
        { id: 'A', text: 'Oxygen' },
        { id: 'B', text: 'Carbon Dioxide' },
        { id: 'C', text: 'Nitrogen' },
        { id: 'D', text: 'Hydrogen' }
      ],
      correctAnswer: 'B',
      difficulty: 'easy'
    },
    {
      content: 'What is the H in H2O?',
      options: [
        { id: 'A', text: 'Helium' },
        { id: 'B', text: 'Hydrogen' },
        { id: 'C', text: 'Heavy Water' },
        { id: 'D', text: 'Hot' }
      ],
      correctAnswer: 'B',
      difficulty: 'easy'
    },
    {
      content: 'Which planet has the most moons?',
      options: [
        { id: 'A', text: 'Jupiter' },
        { id: 'B', text: 'Saturn' },
        { id: 'C', text: 'Uranus' },
        { id: 'D', text: 'Neptune' }
      ],
      correctAnswer: 'B',
      difficulty: 'hard'
    },
    {
      content: 'What is the hardest natural substance on Earth?',
      options: [
        { id: 'A', text: 'Gold' },
        { id: 'B', text: 'Iron' },
        { id: 'C', text: 'Diamond' },
        { id: 'D', text: 'Platinum' }
      ],
      correctAnswer: 'C',
      difficulty: 'medium'
    },
    {
      content: 'What part of the plant conducts photosynthesis?',
      options: [
        { id: 'A', text: 'Root' },
        { id: 'B', text: 'Stem' },
        { id: 'C', text: 'Leaf' },
        { id: 'D', text: 'Flower' }
      ],
      correctAnswer: 'C',
      difficulty: 'easy'
    },
    {
      content: 'What is the freezing point of water in Celsius?',
      options: [
        { id: 'A', text: '0' },
        { id: 'B', text: '32' },
        { id: 'C', text: '100' },
        { id: 'D', text: '-1' }
      ],
      correctAnswer: 'A',
      difficulty: 'easy'
    },
    {
      content: 'Who developed the theory of relativity?',
      options: [
        { id: 'A', text: 'Isaac Newton' },
        { id: 'B', text: 'Albert Einstein' },
        { id: 'C', text: 'Galileo Galilei' },
        { id: 'D', text: 'Nikola Tesla' }
      ],
      correctAnswer: 'B',
      difficulty: 'hard'
    },
    {
      content: 'What is the most abundant gas in the Earths atmosphere?',
      options: [
        { id: 'A', text: 'Oxygen' },
        { id: 'B', text: 'Carbon Dioxide' },
        { id: 'C', text: 'Nitrogen' },
        { id: 'D', text: 'Argon' }
      ],
      correctAnswer: 'C',
      difficulty: 'medium'
    }

  ],
  'technology': [
    {
      content: 'What does CPU stand for?',
      options: [
        { id: 'A', text: 'Central Processing Unit' },
        { id: 'B', text: 'Computer Personal Unit' },
        { id: 'C', text: 'Central Personal Unit' },
        { id: 'D', text: 'Central Processor Utility' }
      ],
      correctAnswer: 'A',
      difficulty: 'easy'
    },
    {
      content: 'Who is the founder of Microsoft?',
      options: [
        { id: 'A', text: 'Steve Jobs' },
        { id: 'B', text: 'Bill Gates' },
        { id: 'C', text: 'Mark Zuckerberg' },
        { id: 'D', text: 'Elon Musk' }
      ],
      correctAnswer: 'B',
      difficulty: 'easy'
    },
    {
      content: 'What is the main language used for web pages?',
      options: [
        { id: 'A', text: 'Python' },
        { id: 'B', text: 'HTML' },
        { id: 'C', text: 'C++' },
        { id: 'D', text: 'Java' }
      ],
      correctAnswer: 'B',
      difficulty: 'medium'
    },
    {
      content: 'What year was the first iPhone released?',
      options: [
        { id: 'A', text: '2005' },
        { id: 'B', text: '2007' },
        { id: 'C', text: '2008' },
        { id: 'D', text: '2010' }
      ],
      correctAnswer: 'B',
      difficulty: 'hard'
    },
    {
      content: 'What does RAM stand for?',
      options: [
        { id: 'A', text: 'Read Access Memory' },
        { id: 'B', text: 'Random Access Memory' },
        { id: 'C', text: 'Run Access Memory' },
        { id: 'D', text: 'Read All Memory' }
      ],
      correctAnswer: 'B',
      difficulty: 'medium'
    },
    {
      content: 'What company owns Android?',
      options: [
        { id: 'A', text: 'Apple' },
        { id: 'B', text: 'Microsoft' },
        { id: 'C', text: 'Google' },
        { id: 'D', text: 'Samsung' }
      ],
      correctAnswer: 'C',
      difficulty: 'easy'
    },
    {
      content: 'What is the name of the first electronic computer?',
      options: [
        { id: 'A', text: 'ENIAC' },
        { id: 'B', text: 'UNIVAC' },
        { id: 'C', text: 'IBM PC' },
        { id: 'D', text: 'Altair' }
      ],
      correctAnswer: 'A',
      difficulty: 'hard'
    },
    {
      content: 'Which protocol is used to send email?',
      options: [
        { id: 'A', text: 'HTTP' },
        { id: 'B', text: 'FTP' },
        { id: 'C', text: 'SMTP' },
        { id: 'D', text: 'SSH' }
      ],
      correctAnswer: 'C',
      difficulty: 'hard'
    }

  ]
};

async function main() {
  try {
    console.log('🌱 Starting seed...');

    // 1. Get an author (use first user or create admin)
    let author = await prisma.user.findFirst({
      where: { role: 'admin' } // Try to get an admin first
    });

    if (!author) {
      author = await prisma.user.findFirst();
      if (!author) {
        console.log('No user found to assign as author. Please create a user first.');
        return;
      }
    }
    console.log(`👤 Using author: ${author.username} (${author.id})`);

    // 2. Create Topics
    for (const topicData of topics) {
      const topic = await prisma.topic.upsert({
        where: { slug: topicData.slug },
        update: {},
        create: topicData,
      });
      console.log(`📚 Topic synced: ${topic.name}`);

      // 3. Create Questions for this Topic
      const questionsData = sampleQuestions[topicData.slug] || [];

      for (const qData of questionsData) {
        // Check if question exists (simple duplicate check by content)
        const existingQ = await prisma.question.findFirst({
          where: { content: qData.content }
        });

        if (!existingQ) {
          const question = await prisma.question.create({
            data: {
              content: qData.content,
              options: qData.options, // Prisma handles JSON array
              correctAnswer: qData.correctAnswer,
              difficulty: qData.difficulty,
              type: 'mcq',
              status: 'published',
              authorId: author.id,
              topics: {
                create: {
                  topicId: topic.id
                }
              }
            }
          });
          console.log(`   ➕ Created Question: ${question.content.substring(0, 30)}...`);
        } else {
          console.log(`   ⏩ Skipped existing question: ${qData.content.substring(0, 30)}...`);
          // Ensure topic link exists
          const link = await prisma.questionTopic.findUnique({
            where: {
              questionId_topicId: {
                questionId: existingQ.id,
                topicId: topic.id
              }
            }
          });

          if (!link) {
            await prisma.questionTopic.create({
              data: {
                questionId: existingQ.id,
                topicId: topic.id
              }
            });
            console.log(`      🔗 Linked topic ${topic.name}`);
          }
        }
      }
    }

    console.log('✅ Seeding completed successfully!');

  } catch (error) {
    console.error('❌ Error seeding data:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();

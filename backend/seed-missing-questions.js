const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const questionsData = {
  "topic-1766952720867": [
    {
      content: "What is the primary function of a health check in software?",
      options: ["To monitor system status", "To delete data", "To increase speed", "To design UI"],
      correctAnswer: "To monitor system status",
      difficulty: "easy"
    },
    {
      content: "Which HTTP status code typically indicates 'OK'?",
      options: ["200", "404", "500", "403"],
      correctAnswer: "200",
      difficulty: "easy"
    },
    {
      content: "What does API stand for?",
      options: ["Application Programming Interface", "Apple Pie Ingredients", "Automated Program Instruction", "Advanced Protocol Integration"],
      correctAnswer: "Application Programming Interface",
      difficulty: "medium"
    },
    {
      content: "Which of these is a common database?",
      options: ["PostgreSQL", "Excel", "Notepad", "Chrome"],
      correctAnswer: "PostgreSQL",
      difficulty: "easy"
    },
    {
      content: "What is latency in networking?",
      options: ["Time delay in data transmission", "Internet speed", "Cable length", "Server weight"],
      correctAnswer: "Time delay in data transmission",
      difficulty: "medium"
    },
    {
      content: "What does CPU stand for?",
      options: ["Central Processing Unit", "Computer Personal Unit", "Central Process Utility", "Control Processing Unit"],
      correctAnswer: "Central Processing Unit",
      difficulty: "easy"
    },
    {
      content: "Which is a volatile memory type?",
      options: ["RAM", "HDD", "SSD", "ROM"],
      correctAnswer: "RAM",
      difficulty: "medium"
    },
    {
      content: "What is the purpose of a firewall?",
      options: ["Network security", "Cooling the CPU", "Speeding up internet", "Organizing files"],
      correctAnswer: "Network security",
      difficulty: "easy"
    },
    {
      content: "What does 'Cloud Computing' refer to?",
      options: ["Services delivered over the internet", "Computing in airplanes", "Weather forecasting", "Rain simulation"],
      correctAnswer: "Services delivered over the internet",
      difficulty: "medium"
    },
    {
      content: "What is a bug in software?",
      options: ["An error or flaw", "A feature", "A virus", "A user"],
      correctAnswer: "An error or flaw",
      difficulty: "easy"
    }
  ]
};

async function seedMissingQuestions() {
  console.log('Starting to seed missing questions...');

  const admin = await prisma.user.findFirst({
    where: { role: 'admin' }
  });
  const authorId = admin ? admin.id : 1; 

  for (const [slug, questions] of Object.entries(questionsData)) {
    console.log(`Processing topic: ${slug}`);
    
    const topic = await prisma.topic.findFirst({
      where: { slug: slug }
    });

    if (!topic) {
      console.log(`Topic ${slug} not found, skipping...`);
      continue;
    }

    console.log(`Found topic ${topic.name} (ID: ${topic.id}). Adding ${questions.length} questions...`);

    for (const q of questions) {
      const existing = await prisma.question.findFirst({
        where: {
          content: q.content,
          topics: {
            some: {
              topicId: topic.id
            }
          }
        }
      });

      if (existing) {
        continue;
      }

      await prisma.question.create({
        data: {
          content: q.content,
          options: q.options,
          correctAnswer: q.correctAnswer,
          difficulty: q.difficulty,
          authorId: authorId,
          status: 'published',
          topics: {
            create: {
              topicId: topic.id
            }
          }
        }
      });
    }
    console.log(`Finished adding questions for ${topic.name}`);
  }

  console.log('Seeding completed!');
}

seedMissingQuestions()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

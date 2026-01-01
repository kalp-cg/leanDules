const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const topics = await prisma.topic.findMany();
  const difficulties = ['easy', 'medium', 'hard'];

  console.log('Question Distribution (Topic / Difficulty):');
  console.log('-------------------------------------------');

  for (const topic of topics) {
    console.log(`Topic: ${topic.name} (ID: ${topic.id})`);
    for (const diff of difficulties) {
      const count = await prisma.question.count({
        where: {
          topics: {
            some: {
              topicId: topic.id
            }
          },
          difficulty: diff,
          status: 'published',
          deletedAt: null
        }
      });
      console.log(`  - ${diff}: ${count}`);
    }
    console.log('');
  }
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

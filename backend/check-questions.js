const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const topics = await prisma.topic.findMany({
    include: {
      _count: {
        select: { questions: true }
      }
    }
  });

  console.log('Topics and Question Counts:');
  topics.forEach(t => {
    console.log(`ID: ${t.id}, Name: ${t.name}, Slug: ${t.slug}, Questions: ${t._count.questions}`);
  });
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

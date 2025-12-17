const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('🧹 Cleaning up challenge messages...');
  
  const result = await prisma.message.deleteMany({
    where: {
      type: 'challenge'
    }
  });

  console.log(`✅ Deleted ${result.count} challenge messages.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

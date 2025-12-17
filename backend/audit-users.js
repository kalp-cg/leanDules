const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function listUsers() {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        username: true,
        passwordHash: true,
        authProvider: true
      }
    });
    
    console.log('--- User Audit ---');
    users.forEach(u => {
      console.log(`User: ${u.email} (${u.authProvider})`);
      console.log(`   Has Password Hash: ${!!u.passwordHash}`);
      if (u.passwordHash) {
          console.log(`   Hash Length: ${u.passwordHash.length}`);
          console.log(`   Hash Start: ${u.passwordHash.substring(0, 10)}...`);
      }
    });
    console.log('------------------');
  } catch (e) {
    console.error(e);
  } finally {
    await prisma.$disconnect();
  }
}

listUsers();
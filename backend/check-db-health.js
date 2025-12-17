const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkDb() {
  try {
    console.log('Checking DB connection...');
    const count = await prisma.user.count();
    console.log(`✅ User count: ${count}`);
    
    const user = await prisma.user.findFirst();
    if (user) {
        console.log('✅ Found a user:', user.username);
    } else {
        console.log('⚠️ No users found');
    }
  } catch (e) {
    console.error('❌ DB Error:', e);
  } finally {
    await prisma.$disconnect();
  }
}

checkDb();
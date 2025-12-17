const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();

async function testLogin(email, password) {
  try {
    console.log(`Testing login for ${email}...`);
    const user = await prisma.user.findUnique({ where: { email } });
    
    if (!user) {
      console.log('❌ User not found');
      return;
    }
    console.log('✅ User found:', user.username);
    console.log('   Hash:', user.passwordHash);

    const isValid = await bcrypt.compare(password, user.passwordHash);
    console.log(`   Password valid: ${isValid}`);
  } catch (e) {
    console.error('❌ Error:', e);
  } finally {
    await prisma.$disconnect();
  }
}

// Replace with the credentials the user is likely using, or a known test user
// I'll try to find a user first
async function findAnyUser() {
    const user = await prisma.user.findFirst();
    if (user) {
        console.log('Found user:', user.email);
        // I can't know the password, but I can check if the hash looks valid
    }
}

findAnyUser();
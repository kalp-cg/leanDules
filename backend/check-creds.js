const { prisma } = require('./src/config/db');
const bcrypt = require('bcryptjs');

async function checkCredentials() {
  try {
    const user = await prisma.user.findUnique({ where: { username: 'kalp' } });
    if (user) {
        console.log('User "kalp" exists with email:', user.email);
        const match = await bcrypt.compare('Kalp0000', user.passwordHash);
        console.log('Password "Kalp0000" matches:', match);
    } else {
        console.log('User "kalp" not found.');
    }
  } catch (error) {
    console.error(error);
  } finally {
    await prisma.$disconnect();
  }
}

checkCredentials();

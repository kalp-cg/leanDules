const { prisma } = require('./src/config/db');

async function checkUser() {
  try {
    console.log('Checking for user kalp09@gmail.com...');
    const user = await prisma.user.findUnique({
      where: { email: 'kalp09@gmail.com' },
    });
    console.log('User found:', user);

    console.log('Checking for user with username "kalp"...');
    const userByUsername = await prisma.user.findUnique({
        where: { username: 'kalp' },
    });
    console.log('User with username "kalp":', userByUsername);

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkUser();

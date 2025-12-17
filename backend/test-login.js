const { prisma } = require('./src/config/db');
const bcrypt = require('bcryptjs');
const authService = require('./src/services/auth.service');

async function testLogin() {
  try {
    console.log('Creating test user...');
    const email = 'login_test_' + Date.now() + '@example.com';
    const password = 'password123';
    const username = 'login_test_' + Date.now();
    const passwordHash = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: { username, email, passwordHash },
    });
    console.log('Test user created:', user.email);

    console.log('Attempting login...');
    const result = await authService.login({ email, password });
    console.log('Login successful!', result.user.email);

    console.log('Attempting login with wrong password...');
    try {
        await authService.login({ email, password: 'wrongpassword' });
    } catch (e) {
        console.log('Login failed as expected:', e.message);
    }

  } catch (error) {
    console.error('❌ Login test failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testLogin();

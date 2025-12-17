const axios = require('axios');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const bcrypt = require('bcryptjs');

const API_URL = 'http://localhost:4000/api/auth';
const TEST_EMAIL = `reset_test_${Date.now()}@example.com`;
const TEST_PASSWORD = 'Password123!';
const NEW_PASSWORD = 'NewPassword123!';

async function runTest() {
  try {
    console.log('🚀 Starting Password Reset Test...');

    // 1. Create User
    console.log(`\n1. Creating test user: ${TEST_EMAIL}`);
    
    const hashedPassword = await bcrypt.hash(TEST_PASSWORD, 10);
    
    const user = await prisma.user.create({
      data: {
        email: TEST_EMAIL,
        username: `reset_user_${Date.now()}`,
        passwordHash: hashedPassword,
        isActive: true
      }
    });
    console.log('✅ User created:', user.id);

    // 2. Request Password Reset
    console.log('\n2. Requesting password reset...');
    try {
        const forgotRes = await axios.post(`${API_URL}/forgot-password`, {
            email: TEST_EMAIL
        });
        console.log('✅ Forgot password response:', forgotRes.data);
    } catch (e) {
        console.error('❌ Forgot password failed:', e.message);
        if (e.response) {
            console.error('Status:', e.response.status);
            console.error('Data:', e.response.data);
        } else if (e.request) {
            console.error('No response received. Server might be down.');
        }
        process.exit(1);
    }

    // 3. Get Token from DB
    console.log('\n3. Fetching token from database...');
    // Wait a bit for DB update just in case
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const updatedUser = await prisma.user.findUnique({
      where: { id: user.id }
    });
    
    const token = updatedUser.passwordResetToken;
    if (!token) {
      console.error('❌ No reset token found in database!');
      process.exit(1);
    }
    console.log('✅ Token found:', token);

    // 4. Reset Password
    console.log('\n4. Resetting password...');
    try {
        const resetRes = await axios.post(`${API_URL}/reset-password`, {
            token: token,
            newPassword: NEW_PASSWORD
        });
        console.log('✅ Reset password response:', resetRes.data);
    } catch (e) {
        console.error('❌ Reset password failed:', e.response?.data || e.message);
        process.exit(1);
    }

    // 5. Login with New Password
    console.log('\n5. Logging in with new password...');
    try {
        const loginRes = await axios.post(`${API_URL}/login`, {
            email: TEST_EMAIL,
            password: NEW_PASSWORD
        });
        console.log('✅ Login successful!', loginRes.data.success);
    } catch (e) {
        console.error('❌ Login failed:', e.response?.data || e.message);
        process.exit(1);
    }

    console.log('\n🎉 Password Reset Flow Verified Successfully!');

    // Cleanup
    await prisma.user.delete({ where: { id: user.id } });
    console.log('🧹 Test user cleaned up.');

  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

runTest();

const axios = require('axios');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const bcrypt = require('bcryptjs');
const { generateTokenPair } = require('./src/utils/token');

const API_URL = 'http://localhost:4000/api';
const TIMESTAMP = Date.now();
const ADMIN_EMAIL = `admin_check_${TIMESTAMP}@example.com`;
const USER_EMAIL = `user_check_${TIMESTAMP}@example.com`;
const PASSWORD = 'Password123!';

const colors = {
  reset: "\x1b[0m",
  green: "\x1b[32m",
  red: "\x1b[31m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  cyan: "\x1b[36m"
};

function log(step, message, status = 'INFO') {
  let color = colors.blue;
  let icon = 'ℹ️';
  
  if (status === 'SUCCESS') { color = colors.green; icon = '✅'; }
  if (status === 'ERROR') { color = colors.red; icon = '❌'; }
  if (status === 'WARN') { color = colors.yellow; icon = '⚠️'; }
  
  console.log(`${color}${icon} [${step}] ${message}${colors.reset}`);
}

async function runHealthCheck() {
  console.log(`${colors.cyan}🚀 Starting LearnDuels System Health Check...${colors.reset}\n`);
  
  let adminToken, userToken;
  let adminId, userId;
  let topicId, questionId, challengeId, conversationId;

  try {
    // 1. Database Connection
    try {
      await prisma.$connect();
      log('Database', 'Connection successful', 'SUCCESS');
    } catch (e) {
      throw new Error(`Database connection failed: ${e.message}`);
    }

    // 2. User Creation & Auth
    try {
      const hashedPassword = await bcrypt.hash(PASSWORD, 10);
      
      // Create Admin
      const admin = await prisma.user.create({
        data: {
          email: ADMIN_EMAIL,
          username: `admin_${TIMESTAMP}`,
          fullName: 'System Admin',
          passwordHash: hashedPassword,
          role: 'admin',
          isActive: true,
          xp: 1000, // Give some XP for leaderboard
          rating: 1500
        }
      });
      adminId = admin.id;
      adminToken = generateTokenPair({ userId: admin.id, email: admin.email }).accessToken;
      
      // Create User
      const user = await prisma.user.create({
        data: {
          email: USER_EMAIL,
          username: `user_${TIMESTAMP}`,
          fullName: 'Test User',
          passwordHash: hashedPassword,
          role: 'user',
          isActive: true,
          xp: 500, // Give some XP for leaderboard
          rating: 1200
        }
      });
      userId = user.id;
      userToken = generateTokenPair({ userId: user.id, email: user.email }).accessToken;

      log('Auth', 'Test users created and tokens generated', 'SUCCESS');
    } catch (e) {
      throw new Error(`Auth setup failed: ${e.message}`);
    }

    // 3. Topics (Admin Feature)
    try {
      const res = await axios.post(`${API_URL}/topics`, {
        name: `Topic ${TIMESTAMP}`,
        description: 'Health check topic'
      }, { headers: { Authorization: `Bearer ${adminToken}` } });
      
      topicId = res.data.data.id;
      log('Topics', `Topic created (ID: ${topicId})`, 'SUCCESS');
    } catch (e) {
      log('Topics', `Failed to create topic: ${e.response?.data?.message || e.message}`, 'ERROR');
    }

    // 4. Questions
    try {
      const res = await axios.post(`${API_URL}/questions`, {
        content: 'What is the result of 1+1?',
        options: [{ id: 'A', text: '1' }, { id: 'B', text: '2' }],
        correctAnswer: 'B',
        difficulty: 'easy',
        topicIds: topicId ? [topicId] : []
      }, { headers: { Authorization: `Bearer ${adminToken}` } });
      
      questionId = res.data.data.id;
      log('Questions', `Question created (ID: ${questionId})`, 'SUCCESS');
    } catch (e) {
      log('Questions', `Failed to create question: ${e.response?.data?.message || e.message}`, 'ERROR');
    }

    // 5. Challenges
    try {
      const res = await axios.post(`${API_URL}/challenges`, {
        type: 'async',
        settings: {
          difficulty: 'easy',
          numQuestions: 5,
          timeLimit: 30
        }
      }, { headers: { Authorization: `Bearer ${userToken}` } });
      
      challengeId = res.data.data.id;
      log('Challenges', `Challenge created (ID: ${challengeId})`, 'SUCCESS');
    } catch (e) {
      log('Challenges', `Failed to create challenge: ${e.response?.data?.message || e.message}`, 'ERROR');
    }

    // 6. Reports (New Feature)
    try {
      const res = await axios.post(`${API_URL}/reports`, {
        type: 'user',
        reportedId: adminId,
        reason: 'Health check report'
      }, { headers: { Authorization: `Bearer ${userToken}` } });
      
      log('Reports', `Report submitted (ID: ${res.data.data.id})`, 'SUCCESS');
    } catch (e) {
      log('Reports', `Failed to submit report: ${e.response?.data?.message || e.message}`, 'ERROR');
    }

    // 7. Chat (New Feature)
    try {
      // Start Conversation
      const convRes = await axios.post(`${API_URL}/chat/conversations/direct`, {
        userId: adminId
      }, { headers: { Authorization: `Bearer ${userToken}` } });
      conversationId = convRes.data.data.id;
      
      // Send Message
      await axios.post(`${API_URL}/chat/conversations/${conversationId}/messages`, {
        content: 'Health check message'
      }, { headers: { Authorization: `Bearer ${userToken}` } });

      log('Chat', `Conversation started and message sent (ID: ${conversationId})`, 'SUCCESS');
    } catch (e) {
      log('Chat', `Chat test failed: ${e.response?.data?.message || e.message}`, 'ERROR');
    }

    // 8. General API Health
    try {
      const res = await axios.get(`${API_URL}`);
      log('API', `Root endpoint healthy (Version: ${res.data.version})`, 'SUCCESS');
    } catch (e) {
      log('API', `Root endpoint check failed`, 'ERROR');
    }

    console.log(`\n${colors.green}✨ System Health Check Completed ✨${colors.reset}`);

  } catch (error) {
    console.error(`\n${colors.red}⛔ CRITICAL FAILURE: ${error.message}${colors.reset}`);
  } finally {
    await prisma.$disconnect();
  }
}

runHealthCheck();

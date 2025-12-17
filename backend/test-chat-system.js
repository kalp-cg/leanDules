const axios = require('axios');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const bcrypt = require('bcryptjs');
const { generateTokenPair } = require('./src/utils/token');

const API_URL = 'http://localhost:4000/api';
const USER1_EMAIL = `chat_user1_${Date.now()}@example.com`;
const USER2_EMAIL = `chat_user2_${Date.now()}@example.com`;
const PASSWORD = 'Password123!';

async function runTest() {
  try {
    console.log('🚀 Starting Chat System Test...');

    // 1. Create Users
    console.log('\n1. Creating test users...');
    const hashedPassword = await bcrypt.hash(PASSWORD, 10);
    
    const user1 = await prisma.user.create({
      data: {
        email: USER1_EMAIL,
        username: `chat_user1_${Date.now()}`,
        passwordHash: hashedPassword,
        isActive: true,
        role: 'user'
      }
    });

    const user2 = await prisma.user.create({
      data: {
        email: USER2_EMAIL,
        username: `chat_user2_${Date.now()}`,
        passwordHash: hashedPassword,
        isActive: true,
        role: 'user'
      }
    });

    console.log('✅ Users created');

    // 2. Generate Tokens
    const token1 = generateTokenPair({ userId: user1.id, email: user1.email }).accessToken;
    const token2 = generateTokenPair({ userId: user2.id, email: user2.email }).accessToken;

    const headers1 = { Authorization: `Bearer ${token1}` };
    const headers2 = { Authorization: `Bearer ${token2}` };

    // 3. Start Conversation
    console.log('\n2. Starting conversation...');
    const convRes = await axios.post(`${API_URL}/chat/conversations/direct`, {
      userId: user2.id
    }, { headers: headers1 });
    
    const conversationId = convRes.data.data.id;
    console.log(`✅ Conversation started: ID ${conversationId}`);

    // 4. Send Message (User 1 -> User 2)
    console.log('\n3. Sending message...');
    const msgRes = await axios.post(`${API_URL}/chat/conversations/${conversationId}/messages`, {
      content: 'Hello from User 1!'
    }, { headers: headers1 });
    
    console.log(`✅ Message sent: "${msgRes.data.data.content}"`);

    // 5. Reply (User 2 -> User 1)
    console.log('\n4. Replying...');
    const replyRes = await axios.post(`${API_URL}/chat/conversations/${conversationId}/messages`, {
      content: 'Hello back from User 2!'
    }, { headers: headers2 });
    
    console.log(`✅ Reply sent: "${replyRes.data.data.content}"`);

    // 6. Get Messages (User 1)
    console.log('\n5. Fetching messages...');
    const msgsRes = await axios.get(`${API_URL}/chat/conversations/${conversationId}/messages`, { headers: headers1 });
    
    const messages = msgsRes.data.data;
    console.log(`✅ Fetched ${messages.length} messages`);
    if (messages.length !== 2) throw new Error('Expected 2 messages');
    // Note: Service returns oldest first (reverse), so index 0 should be first message
    if (messages[0].content !== 'Hello from User 1!') throw new Error('Message order mismatch (expected oldest first)');

    // 7. Get Conversations List (User 1)
    console.log('\n6. Fetching conversation list...');
    const listRes = await axios.get(`${API_URL}/chat/conversations`, { headers: headers1 });
    
    const conversations = listRes.data.data;
    console.log(`✅ Fetched ${conversations.length} conversations`);
    if (conversations.length < 1) throw new Error('Expected at least 1 conversation');
    if (conversations[0].id !== conversationId) throw new Error('Conversation ID mismatch');

    console.log('\n🎉 Chat System Test Passed!');

  } catch (error) {
    console.error('❌ Test Failed:', error.response ? error.response.data : error.message);
  } finally {
    await prisma.$disconnect();
  }
}

runTest();

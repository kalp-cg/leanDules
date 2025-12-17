const io = require('socket.io-client');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const { generateTokenPair } = require('./src/utils/token');

const SERVER_URL = 'http://localhost:4000';

async function runTest() {
  try {
    console.log('🤖 Starting Chat Bot Test...');

    // 1. Create a Test User
    const username = `ChatBot_${Math.floor(Math.random() * 1000)}`;
    const email = `${username.toLowerCase()}@example.com`;
    
    console.log(`Creating test user: ${username}...`);
    const user = await prisma.user.create({
      data: {
        username,
        email,
        passwordHash: 'hashed_placeholder',
        fullName: 'Test Bot 🤖',
        role: 'user'
      }
    });

    // 2. Generate Token
    const token = generateTokenPair({ 
      userId: user.id, 
      email: user.email,
      username: user.username,
      fullName: user.fullName
    }).accessToken;

    // 3. Connect to Socket
    console.log('Connecting to socket...');
    const socket = io(SERVER_URL, {
      auth: { token },
      transports: ['websocket']
    });

    socket.on('connect', () => {
      console.log('✅ Connected to server!');
      
      // 4. Join Chat
      console.log('Joining general chat...');
      socket.emit('chat:join', {});
    });

    socket.on('chat:history', (messages) => {
      console.log(`📚 Received ${messages.length} history messages.`);
      
      // 5. Send a Test Message
      console.log('Sending test message...');
      socket.emit('chat:send', {
        message: '👋 Hello! I am a test bot verifying the chat system.',
        type: 'text'
      });
    });

    socket.on('chat:message', (msg) => {
      console.log('\n📨 New Message Received:');
      console.log(`   From: ${msg.senderName}`);
      console.log(`   Content: ${msg.content}`);
      console.log(`   Type: ${msg.type}`);
      if (msg.senderId === user.id) {
        console.log('   (This is my message)');
      }
    });

    socket.on('connect_error', (err) => {
      console.error('❌ Connection Error:', err.message);
    });

    // Keep alive for a bit to receive messages
    setTimeout(async () => {
      console.log('\n🛑 Test finished. Disconnecting...');
      socket.disconnect();
      await prisma.user.delete({ where: { id: user.id } }); // Cleanup
      await prisma.$disconnect();
      process.exit(0);
    }, 30000); // Run for 30 seconds

  } catch (error) {
    console.error('❌ Test Failed:', error);
    await prisma.$disconnect();
    process.exit(1);
  }
}

runTest();

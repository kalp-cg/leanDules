const io = require('socket.io-client');
const axios = require('axios');

const API_URL = 'http://localhost:4000/api';
const SOCKET_URL = 'http://localhost:4000';

// Test Users
const HOST_CREDENTIALS = { email: 'arya@example.com', password: 'password123' };
const JOINER_CREDENTIALS = { email: 'dev@example.com', password: 'password123' };

let hostToken, joinerToken;
let hostSocket, joinerSocket;
let createdRoomId;

async function login(credentials) {
  try {
    const res = await axios.post(`${API_URL}/auth/login`, credentials);
    return { token: res.data.data.accessToken, userId: res.data.data.user.id };
  } catch (error) {
    console.error(`Login failed for ${credentials.email}:`, error.response?.data || error.message);
    process.exit(1);
  }
}

function connectSocket(token, name) {
  return new Promise((resolve, reject) => {
    const socket = io(SOCKET_URL, {
      auth: { token },
      transports: ['websocket'],
      forceNew: true,
    });

    socket.on('connect', () => {
      console.log(`✅ ${name} connected to socket (${socket.id})`);
      resolve(socket);
    });

    socket.on('connect_error', (err) => {
      console.error(`❌ ${name} socket connection error:`, err.message);
      reject(err);
    });

    socket.on('duel:error', (err) => {
      console.error(`❌ ${name} received error:`, err);
    });
  });
}

async function runTest() {
  console.log('🚀 Starting Room Code Flow Test...');

  // 1. Login
  console.log('\n🔑 Logging in...');
  const host = await login(HOST_CREDENTIALS);
  hostToken = host.token;
  console.log(`Host logged in (ID: ${host.userId})`);

  const joiner = await login(JOINER_CREDENTIALS);
  joinerToken = joiner.token;
  console.log(`Joiner logged in (ID: ${joiner.userId})`);

  // 2. Connect Sockets
  console.log('\n🔌 Connecting sockets...');
  hostSocket = await connectSocket(hostToken, 'Host');
  joinerSocket = await connectSocket(joinerToken, 'Joiner');

  // 3. Host Creates Room
  console.log('\n🏠 Host creating room...');
  
  const roomCreatedPromise = new Promise((resolve) => {
    hostSocket.on('duel:room_created', (data) => {
      console.log(`✅ Room Created! Room ID: ${data.roomId}`);
      resolve(data.roomId);
    });
  });

  hostSocket.emit('duel:create_room', {
    categoryId: 1, // Mathematics
    difficultyId: 1, // Medium
    questionCount: 5
  });

  createdRoomId = await roomCreatedPromise;

  // 4. Joiner Joins Room
  console.log(`\n👋 Joiner joining room ${createdRoomId}...`);

  const gameStartPromise = new Promise((resolve) => {
    let startedCount = 0;
    const onStarted = (data) => {
      console.log(`\n🎮 Game Started! Room: ${data.roomId}`);
      console.log(`   Questions: ${data.questions.length}`);
      console.log(`   Players: ${Object.keys(data.players).join(', ')}`);
      startedCount++;
      if (startedCount === 2) resolve(data);
    };

    hostSocket.on('duel:started', (data) => {
        console.log('Host received duel:started');
        onStarted(data);
    });
    joinerSocket.on('duel:started', (data) => {
        console.log('Joiner received duel:started');
        onStarted(data);
    });
  });

  joinerSocket.emit('duel:join_room', { roomId: createdRoomId });

  await gameStartPromise;
  console.log('\n✅ Test Passed Successfully!');
  
  hostSocket.disconnect();
  joinerSocket.disconnect();
  process.exit(0);
}

runTest().catch(err => {
  console.error('Test Failed:', err);
  process.exit(1);
});

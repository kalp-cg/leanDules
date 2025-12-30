/**
 * Duel System End-to-End Test
 * Tests the full duel flow including:
 * - Login
 * - Joining matchmaking queue
 * - Answering questions
 * - Skip functionality
 * - Duel completion
 */

const io = require('socket.io-client');
const axios = require('axios');

const BASE_URL = 'http://localhost:4000';
const API_URL = `${BASE_URL}/api`;

// Test users
const user1 = { email: 'testuser1@test.com', password: 'password123' };
const user2 = { email: 'testuser2@test.com', password: 'password123' };

let token1, token2;
let socket1, socket2;
let duelData = null;

async function login(credentials) {
    try {
        const response = await axios.post(`${API_URL}/auth/login`, credentials);
        return response.data.data.accessToken;
    } catch (error) {
        console.error(`Login failed for ${credentials.email}:`, error.response?.data || error.message);
        return null;
    }
}

function connectSocket(token, userId) {
    return new Promise((resolve, reject) => {
        const socket = io(BASE_URL, {
            auth: { token },
            transports: ['websocket'],
        });

        socket.on('connect', () => {
            console.log(`✅ Socket connected for user ${userId}`);
            resolve(socket);
        });

        socket.on('connect_error', (err) => {
            console.error(`❌ Socket connection error for user ${userId}:`, err.message);
            reject(err);
        });

        setTimeout(() => reject(new Error('Socket connection timeout')), 10000);
    });
}

async function testDuelFlow() {
    console.log('\n🎮 DUEL SYSTEM END-TO-END TEST\n');
    console.log('='.repeat(50));

    // Step 1: Login both users
    console.log('\n📝 Step 1: Logging in users...');
    token1 = await login(user1);
    token2 = await login(user2);

    if (!token1 || !token2) {
        console.error('❌ Login failed for one or both users. Make sure test users exist.');
        console.log('   Try creating users first via the signup API.');
        process.exit(1);
    }
    console.log('   ✅ Both users logged in successfully');

    // Step 2: Connect sockets
    console.log('\n🔌 Step 2: Connecting sockets...');
    try {
        socket1 = await connectSocket(token1, 'User1');
        socket2 = await connectSocket(token2, 'User2');
    } catch (err) {
        console.error('❌ Failed to connect sockets:', err.message);
        process.exit(1);
    }

    // Step 3: Setup event listeners
    console.log('\n👂 Step 3: Setting up event listeners...');
    setupEventListeners(socket1, 'User1');
    setupEventListeners(socket2, 'User2');

    // Step 4: Join matchmaking queue
    console.log('\n🎯 Step 4: Joining matchmaking queue...');
    socket1.emit('duel:join_queue', { categoryId: 1 });

    // Wait a bit then have user2 join
    await sleep(1000);
    socket2.emit('duel:join_queue', { categoryId: 1 });

    // Wait for duel to start
    console.log('\n⏳ Waiting for duel to start...');
    await sleep(5000);

    if (!duelData) {
        console.log('❌ Duel did not start. Checking if questions exist...');
        // Check if questions exist
        try {
            const questionsResp = await axios.get(`${API_URL}/questions`, {
                headers: { Authorization: `Bearer ${token1}` }
            });
            console.log(`   Questions in database: ${questionsResp.data.data?.length || 0}`);
        } catch (e) {
            console.log('   Could not check questions:', e.message);
        }
        cleanup();
        return;
    }

    // Step 5: Answer questions
    console.log('\n📝 Step 5: Answering questions...');
    const questions = duelData.questions || [];

    if (questions.length === 0) {
        console.log('❌ No questions in duel');
        cleanup();
        return;
    }

    for (let i = 0; i < questions.length; i++) {
        const question = questions[i];
        console.log(`\n   Question ${i + 1}: ${question.questionText?.substring(0, 50)}...`);

        // User1 answers correctly (or tries to)
        const correctOption = question.correctOption || 'A';
        socket1.emit('duel:submit_answer', {
            questionId: question.id,
            answer: correctOption,
            timeUsed: 5
        });
        console.log(`   User1 answered: ${correctOption}`);

        // User2 skips (test skip functionality)
        if (i % 2 === 0) {
            socket2.emit('duel:submit_answer', {
                questionId: question.id,
                answer: null, // Skip
                timeUsed: 10
            });
            console.log(`   User2 skipped`);
        } else {
            socket2.emit('duel:submit_answer', {
                questionId: question.id,
                answer: 'B', // Random answer
                timeUsed: 8
            });
            console.log(`   User2 answered: B`);
        }

        await sleep(4000); // Wait for question result and next question
    }

    // Step 6: Wait for completion
    console.log('\n⏳ Waiting for duel completion...');
    await sleep(5000);

    console.log('\n' + '='.repeat(50));
    console.log('🏁 TEST COMPLETE\n');

    cleanup();
}

function setupEventListeners(socket, userId) {
    socket.on('duel:started', (data) => {
        console.log(`   🎮 [${userId}] Duel started! Questions: ${data.questions?.length || 0}`);
        duelData = data;
    });

    socket.on('duel:question', (data) => {
        console.log(`   📋 [${userId}] Question ${data.questionIndex + 1}`);
    });

    socket.on('duel:opponent_answered', (data) => {
        console.log(`   👀 [${userId}] Opponent answered question ${data.questionIndex + 1}`);
    });

    socket.on('duel:question_result', (data) => {
        console.log(`   📊 [${userId}] Question ${data.questionIndex + 1} results received`);
    });

    socket.on('duel:completed', (data) => {
        console.log(`   🏆 [${userId}] Duel completed! Winner: ${data.winnerId || 'TIE'}`);
        console.log(`   Scores:`, data.scores);
    });

    socket.on('duel:error', (data) => {
        console.error(`   ❌ [${userId}] Duel error:`, data.error || data.message);
    });

    socket.on('duel:queue_joined', () => {
        console.log(`   ✅ [${userId}] Joined matchmaking queue`);
    });
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

function cleanup() {
    if (socket1) socket1.disconnect();
    if (socket2) socket2.disconnect();
    process.exit(0);
}

// Run the test
testDuelFlow().catch(console.error);

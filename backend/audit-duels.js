const io = require('socket.io-client');
const axios = require('axios');

const API_URL = 'http://localhost:4000/api';
const SOCKET_URL = 'http://localhost:4000';

async function auditDuels() {
    console.log('🧪 Starting Real-time Duels Audit (Robust V2)...');

    let socket1, socket2;

    try {
        // 1. Get Tokens
        console.log('Fetching tokens...');
        const t1Res = await axios.get(`${API_URL}/test/token?id=1`);
        const t2Res = await axios.get(`${API_URL}/test/token?id=2`);
        const token1 = t1Res.data.token;
        const token2 = t2Res.data.token;

        // 2. Connect Sockets
        console.log('Connecting sockets...');
        socket1 = io(SOCKET_URL, { auth: { token: token1 }, transports: ['websocket'] });
        socket2 = io(SOCKET_URL, { auth: { token: token2 }, transports: ['websocket'] });

        await Promise.all([
            new Promise((r, rej) => socket1.on('connect', r).on('connect_error', rej)),
            new Promise((r, rej) => socket2.on('connect', r).on('connect_error', rej))
        ]);
        console.log('✅ Sockets connected');

        // Add error listeners
        socket1.on('duel:error', (err) => console.error('❌ Socket 1 Error:', err));
        socket2.on('duel:error', (err) => console.error('❌ Socket 2 Error:', err));

        // CRITICAL: Handle room join request (Challenger side)
        socket1.on('duel:join_room_request', (data) => {
            console.log('🔄 Socket 1 joining room:', data.roomId);
            socket1.emit('duel:join_room_ack', { roomId: data.roomId });
        });

        let challengeId, roomId, duelId;

        // 3. Setup User 2 to listen for invitation
        const invitationPromise = new Promise((resolve, reject) => {
            const timeout = setTimeout(() => reject(new Error('Invitation timeout')), 10000);
            socket2.on('duel:invitation_received', (data) => {
                clearTimeout(timeout);
                resolve(data);
            });
        });

        // 4. Create Duel via API (User 1 -> User 2)
        console.log('\n--- 1. Testing Duel Invitation ---');
        const duelRes = await axios.post(`${API_URL}/duels`, {
            opponentId: 2,
            categoryId: 1,
            difficultyId: 1,
            questionCount: 3
        }, { headers: { Authorization: `Bearer ${token1}` } });

        challengeId = duelRes.data.data.challengeId;
        duelId = duelRes.data.data.id;
        console.log(`✅ Duel created via API (Duel ID: ${duelId}, Challenge ID: ${challengeId})`);

        // 5. Wait for User 2 to receive invitation
        const inv = await invitationPromise;
        console.log('✅ User 2 received invitation');

        // 6. User 2 accepts invitation
        const gameStartPromise1 = new Promise(r => socket1.on('duel:started', r));
        const gameStartPromise2 = new Promise(r => socket2.on('duel:started', r));

        console.log('User 2 accepting duel...');
        socket2.emit('duel:accept', { challengeId, challengerId: 1 });

        const [gameData1, gameData2] = await Promise.all([gameStartPromise1, gameStartPromise2]);
        roomId = gameData1.roomId;
        console.log(`✅ Duel started! Room ID: ${roomId}`);

        // 7. Testing Gameplay
        console.log('\n--- 2. Testing Gameplay ---');

        // We asked for 3 questions
        const QUESTION_COUNT = 3;

        for (let i = 0; i < QUESTION_COUNT; i++) {
            console.log(`\nWaiting for Question ${i + 1}...`);
            const questionData = await new Promise(r => socket1.once('duel:question', r));
            console.log(`✅ Received Question ${questionData.questionIndex}: ${questionData.question.questionText}`);

            // Simulate think time
            await new Promise(r => setTimeout(r, 500));

            console.log(`Submitting answers for Q${i + 1}...`);
            socket1.emit('duel:submit_answer', { questionId: questionData.question.id, answer: 'A', timeUsed: 5 });
            socket2.emit('duel:submit_answer', { questionId: questionData.question.id, answer: 'B', timeUsed: 6 });

            console.log('Waiting for question result...');
            const result = await new Promise(r => socket1.once('duel:question_result', r));
            console.log(`✅ Question ${i + 1} result received. Score P1: ${result.currentScores.player1}, P2: ${result.currentScores.player2}`);
        }

        console.log('\n✅ Gameplay finished. Waiting for completion event...');
        // Optional: wait for duel completed event if it exists, or just proceed to rematch
        await new Promise(r => setTimeout(r, 1000));

        // 8. Testing Rematch
        console.log('\n--- 3. Testing Rematch ---');
        const rematchOfferedPromise = new Promise(r => socket2.on('duel:rematch_offered', r));
        console.log('User 1 requesting rematch...');
        socket1.emit('duel:rematch_request', {});

        await rematchOfferedPromise;
        console.log('✅ User 2 received rematch offer');

        const rematchStartedPromise = new Promise(r => socket1.on('duel:started', r));
        console.log('User 2 accepting rematch...');
        socket2.emit('duel:rematch_accept', {});

        const rematchData = await rematchStartedPromise;
        console.log('✅ Rematch started! New Duel ID:', rematchData.duelId);

        console.log('\n✨ Real-time Duels Audit Complete! All tests PASSED.');

        // Cleanup
        socket1.disconnect();
        socket2.disconnect();
        process.exit(0);
    } catch (error) {
        console.error('\n❌ Audit FAILED!');
        console.error('Error:', error.message);
        if (error.response) console.error('Data:', JSON.stringify(error.response.data, null, 2));
        if (socket1) socket1.disconnect();
        if (socket2) socket2.disconnect();
        process.exit(1);
    }
}

auditDuels();

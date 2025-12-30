const axios = require('axios');

const API_URL = 'http://localhost:4000/api';

async function testGameplay() {
    console.log('🧪 Starting Gameplay & Logic Audit...');

    try {
        console.log('Fetching tokens from server...');
        const t1Res = await axios.get(`${API_URL}/test/token?id=1`);
        const t2Res = await axios.get(`${API_URL}/test/token?id=2`);

        const token1 = t1Res.data.token;
        const token2 = t2Res.data.token;

        const auth1 = { headers: { Authorization: `Bearer ${token1}` } };
        const auth2 = { headers: { Authorization: `Bearer ${token2}` } };

        // 1. Fetch Topics
        console.log('\n--- 1. Testing Topics API ---');
        const topicsRes = await axios.get(`${API_URL}/topics`);
        if (!topicsRes.data.success || !Array.isArray(topicsRes.data.data)) {
            throw new Error('Invalid Topics API response');
        }
        console.log(`✅ Topics fetched: ${topicsRes.data.data.length} found`);
        const topicId = topicsRes.data.data[0].id;
        console.log(`Using Topic ID: ${topicId} (${topicsRes.data.data[0].name})`);

        // 2. Create Challenge (User 1 -> User 2)
        console.log('\n--- 2. Testing Challenge Creation ---');
        const challengeData = {
            opponentIds: [2],
            questionSetId: 1,
            type: 'async',
            settings: {
                numQuestions: 5,
                timeLimit: 30,
                difficulty: 'medium'
            }
        };
        const challengeRes = await axios.post(`${API_URL}/challenges`, challengeData, auth1);
        console.log('✅ Challenge Created:', challengeRes.data.data.id);
        const challengeId = challengeRes.data.data.id;

        // 3. User 2 accepts challenge
        console.log('\n--- 3. Testing Challenge Acceptance ---');
        const acceptRes = await axios.post(`${API_URL}/challenges/${challengeId}/accept`, {}, auth2);
        console.log('✅ Challenge Accepted. Status:', acceptRes.data.data.status);

        // 4. User 1 submits result
        console.log('\n--- 4. Testing Result Submission (User 1) ---');
        const result1 = {
            score: 4,
            timeTaken: 120
        };
        const submit1Res = await axios.post(`${API_URL}/challenges/${challengeId}/result`, result1, auth1);
        console.log('✅ User 1 Result Submitted. Status:', submit1Res.data.data.status);

        // 5. User 2 submits result
        console.log('\n--- 5. Testing Result Submission (User 2) ---');
        const result2 = {
            score: 3,
            timeTaken: 150
        };
        const submit2Res = await axios.post(`${API_URL}/challenges/${challengeId}/result`, result2, auth2);
        console.log('✅ User 2 Result Submitted. Winner ID:', submit2Res.data.data.winnerId);
        console.log('✅ Challenge Completed. Status:', submit2Res.data.data.status);

        // 6. Test Stats
        console.log('\n--- 6. Testing Challenge Stats ---');
        const statsRes = await axios.get(`${API_URL}/challenges/stats`, auth1);
        console.log('✅ Challenge Stats:', statsRes.data.data);

        console.log('\n✨ Gameplay & Logic Audit Complete! All tests PASSED.');
    } catch (error) {
        console.error('\n❌ Audit FAILED!');
        if (error.response) {
            console.error('Status:', error.response.status);
            console.error('Data:', JSON.stringify(error.response.data, null, 2));
        } else {
            console.error('Error Message:', error.message);
            console.error('Stack Trace:', error.stack);
        }
        process.exit(1);
    }
}

testGameplay();

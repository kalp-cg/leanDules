const axios = require('axios');
const API_URL = 'http://localhost:4000/api';

async function testAuth() {
    console.log('🧪 Starting Authentication Audit...');

    const testUser = {
        username: 'testuser_' + Date.now(),
        email: 'test_' + Date.now() + '@example.com',
        password: 'Password123!',
        fullName: 'Test Auditor'
    };

    try {
        // 1. Signup
        console.log('\n--- 1. Testing Signup ---');
        const signupRes = await axios.post(`${API_URL}/auth/signup`, testUser);
        console.log('✅ Signup Successful:', signupRes.data.message);
        const { accessToken, refreshToken } = signupRes.data.data;

        // 2. Login
        console.log('\n--- 2. Testing Login ---');
        const loginRes = await axios.post(`${API_URL}/auth/login`, {
            email: testUser.email,
            password: testUser.password
        });
        console.log('✅ Login Successful:', loginRes.data.message);
        const freshAccessToken = loginRes.data.data.accessToken;

        // 3. Get Profile (Me)
        console.log('\n--- 3. Testing Get Profile (/me) ---');
        const meRes = await axios.get(`${API_URL}/auth/me`, {
            headers: { Authorization: `Bearer ${freshAccessToken}` }
        });
        console.log('✅ Get Profile Successful. User:', meRes.data.data.username);

        // 4. Update Profile
        console.log('\n--- 4. Testing Profile Update ---');
        const updateRes = await axios.put(`${API_URL}/users/update`, {
            fullName: 'Updated Auditor Name',
            bio: 'Auditing the system one API at a time.'
        }, {
            headers: { Authorization: `Bearer ${freshAccessToken}` }
        });
        console.log('✅ Profile Update Successful:', updateRes.data.message);

        // 5. Refresh Token
        console.log('\n--- 5. Testing Token Refresh ---');
        const refreshRes = await axios.post(`${API_URL}/auth/refresh-token`, {
            refreshToken: refreshToken
        });
        console.log('✅ Token Refresh Successful');
        const secondaryAccessToken = refreshRes.data.data.accessToken;

        // 6. Verify refreshed token
        console.log('\n--- 6. Verifying New Access Token ---');
        const meAgainRes = await axios.get(`${API_URL}/auth/me`, {
            headers: { Authorization: `Bearer ${secondaryAccessToken}` }
        });
        console.log('✅ Refreshed Token verification successful');

        // 7. Logout
        console.log('\n--- 7. Testing Logout ---');
        const logoutRes = await axios.post(`${API_URL}/auth/logout`, {
            refreshToken: refreshRes.data.data.refreshToken || refreshToken
        }, {
            headers: { Authorization: `Bearer ${secondaryAccessToken}` }
        });
        console.log('✅ Logout Successful:', logoutRes.data.message);

        console.log('\n✨ Authentication & User Management Audit Complete! All tests PASSED.');
    } catch (error) {
        console.error('\n❌ Audit FAILED!');
        if (error.response) {
            console.error('Status:', error.response.status);
            console.error('Data:', JSON.stringify(error.response.data, null, 2));
        } else {
            console.error('Error:', error.message);
        }
        process.exit(1);
    }
}

testAuth();

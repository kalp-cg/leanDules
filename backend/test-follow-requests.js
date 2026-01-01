/**
 * Test Follow Request System
 * 
 * This script demonstrates the complete follow request flow:
 * 1. User A sends a follow request to User B
 * 2. User B receives the request
 * 3. User B can accept or reject the request
 */

const axios = require('axios');

const API_URL = 'http://localhost:3000/api';

// Test users
let userAToken = null;
let userBToken = null;
let userAId = null;
let userBId = null;

async function login(email, password) {
  try {
    const response = await axios.post(`${API_URL}/auth/login`, {
      email,
      password,
    });
    return response.data;
  } catch (error) {
    console.error('Login error:', error.response?.data || error.message);
    throw error;
  }
}

async function sendFollowRequest(token, targetUserId) {
  try {
    const response = await axios.post(
      `${API_URL}/users/${targetUserId}/follow`,
      {},
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    console.log('✅ Follow request sent:', response.data);
    return response.data;
  } catch (error) {
    console.error('❌ Send follow request error:', error.response?.data || error.message);
    throw error;
  }
}

async function getPendingFollowRequests(token) {
  try {
    const response = await axios.get(`${API_URL}/users/follow-requests`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    console.log('✅ Pending follow requests:', response.data);
    return response.data;
  } catch (error) {
    console.error('❌ Get follow requests error:', error.response?.data || error.message);
    throw error;
  }
}

async function acceptFollowRequest(token, followerId) {
  try {
    const response = await axios.post(
      `${API_URL}/users/${followerId}/follow/accept`,
      {},
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    console.log('✅ Follow request accepted:', response.data);
    return response.data;
  } catch (error) {
    console.error('❌ Accept follow request error:', error.response?.data || error.message);
    throw error;
  }
}

async function declineFollowRequest(token, followerId) {
  try {
    const response = await axios.post(
      `${API_URL}/users/${followerId}/follow/decline`,
      {},
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    console.log('✅ Follow request declined:', response.data);
    return response.data;
  } catch (error) {
    console.error('❌ Decline follow request error:', error.response?.data || error.message);
    throw error;
  }
}

async function getMyProfile(token) {
  try {
    const response = await axios.get(`${API_URL}/users/me`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data.data;
  } catch (error) {
    console.error('Get profile error:', error.response?.data || error.message);
    throw error;
  }
}

async function runTest() {
  console.log('\n🚀 Starting Follow Request System Test\n');
  console.log('='.repeat(50));

  try {
    // Step 1: Login as User A
    console.log('\n📝 Step 1: Login as User A');
    const userA = await login('testuser1@example.com', 'password123');
    userAToken = userA.data.accessToken;
    const profileA = await getMyProfile(userAToken);
    userAId = profileA.id;
    console.log(`✅ Logged in as: ${profileA.fullName} (ID: ${userAId})`);

    // Step 2: Login as User B
    console.log('\n📝 Step 2: Login as User B');
    const userB = await login('testuser2@example.com', 'password123');
    userBToken = userB.data.accessToken;
    const profileB = await getMyProfile(userBToken);
    userBId = profileB.id;
    console.log(`✅ Logged in as: ${profileB.fullName} (ID: ${userBId})`);

    // Step 3: User A sends follow request to User B
    console.log('\n📝 Step 3: User A sends follow request to User B');
    await sendFollowRequest(userAToken, userBId);

    // Step 4: User B checks pending follow requests
    console.log('\n📝 Step 4: User B checks pending follow requests');
    const pendingRequests = await getPendingFollowRequests(userBToken);
    console.log(`📬 User B has ${pendingRequests.data.requests.length} pending request(s)`);

    // Step 5: User B accepts the follow request
    console.log('\n📝 Step 5: User B accepts the follow request from User A');
    await acceptFollowRequest(userBToken, userAId);

    // Step 6: Verify no more pending requests
    console.log('\n📝 Step 6: Verify no more pending requests');
    const updatedRequests = await getPendingFollowRequests(userBToken);
    console.log(`📬 User B now has ${updatedRequests.data.requests.length} pending request(s)`);

    console.log('\n' + '='.repeat(50));
    console.log('✅ All tests passed successfully!');
    console.log('='.repeat(50) + '\n');

  } catch (error) {
    console.error('\n❌ Test failed:', error.message);
    process.exit(1);
  }
}

async function testDeclineFlow() {
  console.log('\n🚀 Testing Decline Flow\n');
  console.log('='.repeat(50));

  try {
    // Step 1: Login users
    console.log('\n📝 Login users');
    const userA = await login('testuser1@example.com', 'password123');
    userAToken = userA.data.accessToken;
    const profileA = await getMyProfile(userAToken);
    userAId = profileA.id;

    const userB = await login('testuser3@example.com', 'password123');
    userBToken = userB.data.accessToken;
    const profileB = await getMyProfile(userBToken);
    userBId = profileB.id;

    console.log(`✅ User A: ${profileA.fullName} (ID: ${userAId})`);
    console.log(`✅ User B: ${profileB.fullName} (ID: ${userBId})`);

    // Step 2: User A sends follow request to User B
    console.log('\n📝 User A sends follow request to User B');
    await sendFollowRequest(userAToken, userBId);

    // Step 3: User B checks and declines the request
    console.log('\n📝 User B checks and declines the request');
    const pendingRequests = await getPendingFollowRequests(userBToken);
    console.log(`📬 Pending requests: ${pendingRequests.data.requests.length}`);

    await declineFollowRequest(userBToken, userAId);

    console.log('\n' + '='.repeat(50));
    console.log('✅ Decline flow test passed!');
    console.log('='.repeat(50) + '\n');

  } catch (error) {
    console.error('\n❌ Test failed:', error.message);
  }
}

// Run tests
const testType = process.argv[2] || 'accept';

if (testType === 'decline') {
  testDeclineFlow();
} else {
  runTest();
}

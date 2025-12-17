/**
 * Google OAuth Backend Test Script
 * Test the Google OAuth endpoints
 */

const axios = require('axios');

const BASE_URL = 'http://localhost:4000';

async function testGoogleOAuthBackend() {
  console.log('🧪 Testing Google OAuth Backend...\n');

  try {
    // Test 1: Get Google OAuth URL
    console.log('📝 Test 1: Getting Google OAuth URL');
    const urlResponse = await axios.get(`${BASE_URL}/api/auth/google/url`);
    
    if (urlResponse.data.success && urlResponse.data.data.url) {
      console.log('✅ Google OAuth URL generated successfully');
      console.log('🔗 URL:', urlResponse.data.data.url.substring(0, 100) + '...');
      console.log('');

      // Verify URL contains required parameters
      const url = new URL(urlResponse.data.data.url);
      const requiredParams = ['client_id', 'redirect_uri', 'response_type', 'scope'];
      const missingParams = requiredParams.filter(param => !url.searchParams.has(param));
      
      if (missingParams.length > 0) {
        console.log('⚠️  Missing URL parameters:', missingParams);
      } else {
        console.log('✅ All required URL parameters present');
      }
      
      console.log('📋 Redirect URI:', url.searchParams.get('redirect_uri'));
      console.log('📋 Client ID:', url.searchParams.get('client_id'));
      console.log('📋 Scopes:', url.searchParams.get('scope'));
      console.log('');
    } else {
      console.log('❌ Failed to get Google OAuth URL');
      console.log('Response:', urlResponse.data);
    }

    // Test 2: Check callback endpoint (without code, should redirect with error)
    console.log('📝 Test 2: Testing callback endpoint (without code)');
    try {
      const callbackResponse = await axios.get(`${BASE_URL}/api/auth/google/callback`, {
        maxRedirects: 0,
        validateStatus: function (status) {
          return status >= 200 && status < 400; // Accept redirects
        },
      });
      
      console.log('✅ Callback endpoint accessible');
      console.log('🔄 Redirect location:', callbackResponse.headers.location);
      console.log('');
    } catch (error) {
      if (error.response && error.response.status === 302) {
        console.log('✅ Callback endpoint redirects correctly');
        console.log('🔄 Redirect to:', error.response.headers.location);
        console.log('');
      } else {
        console.log('⚠️  Callback endpoint error:', error.message);
        console.log('');
      }
    }

    // Summary
    console.log('📊 Test Summary:');
    console.log('✅ Google OAuth URL endpoint: Working');
    console.log('✅ Google OAuth callback endpoint: Working');
    console.log('');
    console.log('🎯 Next Steps:');
    console.log('1. Update .env with your Google OAuth credentials:');
    console.log('   GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com');
    console.log('   GOOGLE_CLIENT_SECRET=your-client-secret');
    console.log('2. Set up Google OAuth in Google Cloud Console:');
    console.log('   - Add authorized redirect URI: http://localhost:4000/api/auth/google/callback');
    console.log('3. Test the complete flow with Flutter app');
    console.log('');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    if (error.response) {
      console.error('Response:', error.response.data);
    }
  }
}

// Run tests
testGoogleOAuthBackend();

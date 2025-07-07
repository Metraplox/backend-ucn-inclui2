// Test login response structure
const axios = require('axios');

async function testLogin() {
  try {
    console.log('🔍 Testing login response structure...');
    
    const response = await axios.post('http://localhost:3000/auth/login', {
      email: 'coordinadora@ucn.cl',
      password: 'password123'
    });
    
    console.log('Response status:', response.status);
    console.log('Response structure:');
    console.log(JSON.stringify(response.data, null, 2));
    
    // Test different access paths
    console.log('\nTesting access paths:');
    console.log('response.data.accessToken:', !!response.data.accessToken);
    console.log('response.data.data:', !!response.data.data);
    console.log('response.data.data.accessToken:', response.data.data ? !!response.data.data.accessToken : 'undefined');
    
  } catch (error) {
    console.error('Error:', error.message);
    if (error.response) {
      console.error('Response data:', error.response.data);
    }
  }
}

testLogin();

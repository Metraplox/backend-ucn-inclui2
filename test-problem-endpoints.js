// Test remaining problematic endpoints
const axios = require('axios');

async function testProblemEndpoints() {
  try {
    // Get token
    const loginResponse = await axios.post('http://localhost:3000/auth/login', {
      email: 'coordinadora@ucn.cl',
      password: 'password123'
    });
    
    const token = loginResponse.data.data.data.accessToken;
    console.log('✅ Got token');
    
    // Test each problematic endpoint
    const endpoints = [
      '/students',
      '/courses', 
      '/departments',
      '/reports'
    ];
    
    for (const endpoint of endpoints) {
      console.log(`\n🔍 Testing ${endpoint}...`);
      try {
        const response = await axios.get(`http://localhost:3000${endpoint}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        console.log(`Status: ${response.status}`);
        console.log('Response structure:');
        console.log('- Type:', typeof response.data);
        console.log('- Keys:', Object.keys(response.data));
        
        if (response.data.data) {
          console.log('- data Type:', typeof response.data.data);
          console.log('- data Keys:', Object.keys(response.data.data));
          
          if (response.data.data.data) {
            console.log('- data.data Type:', typeof response.data.data.data);
            console.log('- data.data IsArray:', Array.isArray(response.data.data.data));
            if (Array.isArray(response.data.data.data)) {
              console.log('- Array length:', response.data.data.data.length);
            }
          }
        }
        
      } catch (error) {
        console.log(`❌ Error: ${error.response?.status} - ${error.response?.data?.message || error.message}`);
      }
    }
    
  } catch (error) {
    console.error('Setup error:', error.message);
  }
}

testProblemEndpoints();

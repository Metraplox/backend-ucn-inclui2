// Test API response structures
const axios = require('axios');

async function testApiResponses() {
  try {
    console.log('🔍 Testing API response structures...');
    
    // First, get a token
    const loginResponse = await axios.post('http://localhost:3000/auth/login', {
      email: 'coordinadora@ucn.cl',
      password: 'password123'
    });
    
    const token = loginResponse.data.data.data.accessToken;
    console.log('✅ Got token');
    
    // Test students endpoint
    console.log('\n📚 Testing /students endpoint...');
    try {
      const studentsResponse = await axios.get('http://localhost:3000/students', {
        headers: { Authorization: `Bearer ${token}` }
      });
      console.log('Students response structure:');
      console.log('Type:', typeof studentsResponse.data);
      console.log('Is Array:', Array.isArray(studentsResponse.data));
      console.log('Keys:', Object.keys(studentsResponse.data));
      console.log('Sample:', JSON.stringify(studentsResponse.data, null, 2).substring(0, 500) + '...');
    } catch (error) {
      console.error('Students error:', error.response?.status, error.response?.data || error.message);
    }
    
    // Test courses endpoint
    console.log('\n📖 Testing /courses endpoint...');
    try {
      const coursesResponse = await axios.get('http://localhost:3000/courses', {
        headers: { Authorization: `Bearer ${token}` }
      });
      console.log('Courses response structure:');
      console.log('Type:', typeof coursesResponse.data);
      console.log('Is Array:', Array.isArray(coursesResponse.data));
      console.log('Keys:', Object.keys(coursesResponse.data));
    } catch (error) {
      console.error('Courses error:', error.response?.status, error.response?.data || error.message);
    }
    
    // Test departments heads statistics
    console.log('\n🏢 Testing /departments/heads/statistics endpoint...');
    try {
      const statsResponse = await axios.get('http://localhost:3000/departments/heads/statistics', {
        headers: { Authorization: `Bearer ${token}` }
      });
      console.log('Stats response structure:');
      console.log('Type:', typeof statsResponse.data);
      console.log('Keys:', Object.keys(statsResponse.data));
    } catch (error) {
      console.error('Dept stats error:', error.response?.status, error.response?.data || error.message);
    }
    
    // Test semester-config endpoint
    console.log('\n⚙️ Testing /semester-config endpoint...');
    try {
      const configResponse = await axios.get('http://localhost:3000/semester-config', {
        headers: { Authorization: `Bearer ${token}` }
      });
      console.log('Config response structure:');
      console.log('Type:', typeof configResponse.data);
      console.log('Keys:', Object.keys(configResponse.data));
    } catch (error) {
      console.error('Config error:', error.response?.status, error.response?.data || error.message);
    }
    
  } catch (error) {
    console.error('Setup error:', error.message);
  }
}

testApiResponses();

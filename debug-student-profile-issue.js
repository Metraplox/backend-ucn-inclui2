const axios = require('axios');

const BASE_URL = 'http://localhost:3001';

async function testStudentAdjustments() {
  console.log('🔍 Testing student adjustments endpoint...');
  
  try {
    // Login as student
    console.log('📝 Logging in as student...');
    const loginResponse = await axios.post(`${BASE_URL}/auth/login`, {
      email: 'estudiante@alumnos.ucn.cl',
      password: 'password123'
    });
    
    console.log('✅ Login successful');
    const token = loginResponse.data.data.data.accessToken;
    const studentUser = loginResponse.data.data.data.user;
    console.log('👤 User:', studentUser.email);
    console.log('🔑 Roles:', studentUser.roles);
    console.log('📖 Student ID:', studentUser.studentId);
    
    if (studentUser.studentId) {
      console.log(`\n🎯 Testing adjustments for student: ${studentUser.studentId}`);
      try {
        const adjustmentsResponse = await axios.get(
          `${BASE_URL}/adjustments/student/${studentUser.studentId}`,
          {
            headers: { Authorization: `Bearer ${token}` }
          }
        );
        console.log('✅ Adjustments response received');
        console.log('📊 Status:', adjustmentsResponse.status);
        console.log('📊 Data type:', typeof adjustmentsResponse.data);
        console.log('📊 Is array:', Array.isArray(adjustmentsResponse.data));
        console.log('📊 Data length:', adjustmentsResponse.data?.length || 'N/A');
        console.log('� Sample data:', JSON.stringify(adjustmentsResponse.data).substring(0, 200) + '...');
      } catch (adjustmentError) {
        console.log('❌ Error getting adjustments:');
        console.log('Status:', adjustmentError.response?.status);
        console.log('Data:', adjustmentError.response?.data);
        console.log('Full error:', adjustmentError.message);
      }
    } else {
      console.log('⚠️ No studentId found in user object');
    }
    
  } catch (error) {
    console.error('❌ General error:');
    console.error('Status:', error.response?.status);
    console.error('Data:', error.response?.data || error.message);
  }
}

testStudentAdjustments();

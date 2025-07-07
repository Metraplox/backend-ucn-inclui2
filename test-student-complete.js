#!/usr/bin/env node

const axios = require('axios');

async function testStudentLogin() {
  console.log('🧪 Testing student login and profile access...');
  
  try {
    // Test 1: Login
    console.log('\n1️⃣ Testing student login...');
    const loginResponse = await axios.post('http://localhost:3001/auth/login', {
      email: 'estudiante@alumnos.ucn.cl',
      password: 'password123'
    });
    
    console.log('✅ Login successful!');
    const token = loginResponse.data.data.data.accessToken;
    const user = loginResponse.data.data.data.user;
    
    console.log('👤 User Info:');
    console.log('  - Email:', user.email);
    console.log('  - Roles:', user.roles);
    console.log('  - Student ID:', user.studentId);
    
    // Test 2: Get student profile
    console.log('\n2️⃣ Testing student profile...');
    try {
      const profileResponse = await axios.get('http://localhost:3001/students/profile', {
        headers: { Authorization: `Bearer ${token}` }
      });
      console.log('✅ Profile retrieved successfully!');
      console.log('📋 Profile Data:');
      console.log('  - ID:', profileResponse.data._id);
      console.log('  - Name:', profileResponse.data.nombreCompleto);
      console.log('  - Email:', profileResponse.data.email);
    } catch (profileError) {
      console.log('❌ Profile error:', profileError.response?.status, profileError.response?.data);
    }
    
    // Test 3: Get student adjustments
    if (user.studentId) {
      console.log('\n3️⃣ Testing student adjustments...');
      try {
        const adjustmentsResponse = await axios.get(
          `http://localhost:3001/adjustments/student/${user.studentId}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        console.log('✅ Adjustments retrieved successfully!');
        console.log('📊 Adjustments count:', adjustmentsResponse.data.length);
      } catch (adjustmentError) {
        console.log('❌ Adjustments error:', adjustmentError.response?.status, adjustmentError.response?.data);
      }
    }
    
    console.log('\n🎉 All tests completed!');
    
  } catch (error) {
    console.error('❌ Login failed:', error.response?.status, error.response?.data);
  }
}

testStudentLogin();

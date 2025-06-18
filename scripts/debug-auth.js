const axios = require('axios');

async function debugAuth() {
  console.log('🔐 DEBUG: Testing Authentication');
  
  const testCredentials = {
    email: 'coordinadora.inclusion@ucn.cl',
    password: 'inclui2025'
  };
  
  try {
    console.log(`📧 Testing login for: ${testCredentials.email}`);
    
    const response = await axios.post('http://localhost:3000/auth/login', testCredentials, {
      headers: {
        'Content-Type': 'application/json'
      },
      timeout: 10000
    });
    
    console.log('✅ Login successful!');
    console.log('📄 Response status:', response.status);
    
    // Acceder a los datos correctos considerando el interceptor
    const authData = response.data.data?.data || response.data.data || response.data;
    
    console.log('🎫 Token received:', authData.access_token ? 'YES' : 'NO');
    console.log('👤 User data available:', authData.user ? 'YES' : 'NO');
    
    if (authData.user) {
      console.log('👤 User info:');
      console.log(`   📧 Email: ${authData.user.email}`);
      console.log(`   👤 Nombre: ${authData.user.nombreCompleto}`);
      console.log(`   🔑 Roles: ${authData.user.roles.join(', ')}`);
    }
    
    if (authData.access_token) {
      console.log('\n🔑 Testing token with profile endpoint...');
      
      const profileResponse = await axios.get('http://localhost:3000/users/profile', {
        headers: {
          'Authorization': `Bearer ${authData.access_token}`
        },
        timeout: 10000
      });
      
      console.log('✅ Profile request successful!');
      const profileData = profileResponse.data.data || profileResponse.data;
      console.log('👤 Profile data:');
      console.log(`   📧 Email: ${profileData.email}`);
      console.log(`   👤 Nombre: ${profileData.nombreCompleto}`);
      console.log(`   🔑 Roles: ${profileData.roles.join(', ')}`);
    }
    
  } catch (error) {
    console.log('❌ Login failed!');
    if (error.response) {
      console.log('📄 Status:', error.response.status);
      console.log('💬 Message:', error.response.data?.message || 'No message');
      console.log('🔍 Full response:', JSON.stringify(error.response.data, null, 2));
    } else {
      console.log('🔍 Error:', error.message);
    }
  }
}

debugAuth(); 
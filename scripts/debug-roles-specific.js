const axios = require('axios');

const BASE_URL = 'http://localhost:3000';

async function testRolesDebug() {
  console.log('🔍 DEBUG ESPECÍFICO - PROBLEMA DE ROLES');
  console.log('=====================================\n');
  
  try {
    // 1. Login y obtener token
    console.log('🔐 Haciendo login...');
    const loginResponse = await axios.post(`${BASE_URL}/auth/login`, {
      email: 'coordinadora@ucn.cl',
      password: 'Test123!'
    });
    
    const token = loginResponse.data?.data?.data?.access_token;
    if (!token) {
      console.log('❌ No se pudo obtener token');
      return;
    }
    
    console.log('✅ Token obtenido');
    
    // 2. Decodificar payload del JWT (solo para debug)
    const payload = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());
    console.log('\n🔍 Payload del JWT:');
    console.log('  Email:', payload.email);
    console.log('  Roles:', payload.roles);
    console.log('  Sub:', payload.sub);
    
    // 3. Probar endpoint que sabemos funciona
    console.log('\n✅ Probando endpoint que funciona (/users/profile):');
    try {
      const profileResponse = await axios.get(`${BASE_URL}/users/profile`, {
        headers: { Authorization: `Bearer ${token}` },
        validateStatus: () => true
      });
      console.log('  Status:', profileResponse.status);
    } catch (error) {
      console.log('  Error:', error.message);
    }
    
    // 4. Probar endpoint problemático con headers detallados
    console.log('\n❌ Probando endpoint problemático (/students):');
    try {
      const studentsResponse = await axios.get(`${BASE_URL}/students`, {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        validateStatus: () => true
      });
      
      console.log('  Status:', studentsResponse.status);
      console.log('  Response:', JSON.stringify(studentsResponse.data, null, 2));
      
      // Si es 403, es problema de roles
      if (studentsResponse.status === 403) {
        console.log('\n🚨 ANÁLISIS DEL ERROR 403:');
        console.log('  - El usuario está autenticado (token válido)');
        console.log('  - Pero el RolesGuard está rechazando el acceso');
        console.log('  - Roles requeridos: COORDINADOR, EDUCADORA_SOCIAL, DIDDEC_STAFF');
        console.log('  - Rol del usuario:', payload.roles);
        console.log('  - ¿El rol está en el array?', payload.roles.includes('COORDINADOR'));
      }
      
    } catch (error) {
      console.log('  Error:', error.message);
    }
    
    // 5. Probar con otros usuarios para comparar
    console.log('\n🔄 Probando con educadora@ucn.cl:');
    try {
      const educadoraLogin = await axios.post(`${BASE_URL}/auth/login`, {
        email: 'educadora@ucn.cl',
        password: 'Test123!'
      });
      
      const educadoraToken = educadoraLogin.data?.data?.data?.access_token;
      const educadoraPayload = JSON.parse(Buffer.from(educadoraToken.split('.')[1], 'base64').toString());
      console.log('  Roles educadora:', educadoraPayload.roles);
      
      const educadoraStudents = await axios.get(`${BASE_URL}/students`, {
        headers: { Authorization: `Bearer ${educadoraToken}` },
        validateStatus: () => true
      });
      console.log('  Status con educadora:', educadoraStudents.status);
      
    } catch (error) {
      console.log('  Error con educadora:', error.message);
    }
    
  } catch (error) {
    console.error('❌ Error general:', error.message);
  }
}

testRolesDebug(); 
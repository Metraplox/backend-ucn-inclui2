// Script de prueba de login - UCN INCLUI2
// Última actualización: 10/07/2025

const axios = require('axios');

async function testLogin() {
  const usuarios = [
    { email: 'coordinador@ucn.cl', role: 'COORDINADOR' },
    { email: 'estudiante1@ucn.cl', role: 'ESTUDIANTE' },
    { email: 'docente@ucn.cl', role: 'DOCENTE' },
    { email: 'diddec@ucn.cl', role: 'DIDDEC_STAFF' },
    { email: 'educadora@ucn.cl', role: 'EDUCADORA_SOCIAL' },
    { email: 'jefe.carrera@ucn.cl', role: 'JEFE_CARRERA' },
    { email: 'jefe.departamento@ucn.cl', role: 'JEFE_DEPARTAMENTO' }
  ];

  console.log('🔐 Probando login con usuarios del seeder estándar...\n');

  for (const usuario of usuarios) {
    try {
      const response = await axios.post('http://localhost:3001/auth/login', {
        email: usuario.email,
        password: 'password123'
      });

      if (response.data?.success) {
        console.log(`✅ ${usuario.role}: Login exitoso`);
        console.log(`   Email: ${usuario.email}`);
        // Verificar estructura de token en la respuesta anidada
        const token = response.data.data?.data?.access_token || response.data.data?.access_token;
        console.log(`   Token: ${token ? 'Recibido' : 'NO recibido'}`);
      } else {
        console.log(`❌ ${usuario.role}: Login falló - ${response.data?.message || 'Sin mensaje'}`);
      }
    } catch (error) {
      console.log(`❌ ${usuario.role}: Error - ${error.response?.data?.message || error.message}`);
    }
    console.log('');
  }
}

testLogin().catch(console.error);

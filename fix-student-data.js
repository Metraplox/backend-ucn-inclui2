const axios = require('axios');

const BASE_URL = 'http://localhost:3001';

async function fixStudentData() {
  console.log('🔧 Verificando y corrigiendo datos del estudiante...');
  
  try {
    // Login con coordinador que tiene permisos para ver/editar estudiantes
    console.log('📝 Login con coordinador...');
    const loginResponse = await axios.post(`${BASE_URL}/auth/login`, {
      email: 'coordinador@ucn.cl',
      password: 'password123'
    });
    
    const coordinatorToken = loginResponse.data.data.data.accessToken;
    console.log('✅ Login coordinador exitoso');
    
    // Obtener lista de estudiantes
    console.log('📋 Obteniendo lista de estudiantes...');
    const studentsResponse = await axios.get(`${BASE_URL}/students`, {
      headers: { Authorization: `Bearer ${coordinatorToken}` }
    });
    
    console.log('📊 Estudiantes encontrados:', studentsResponse.data.length);
    
    // Buscar el estudiante de prueba
    const testStudent = studentsResponse.data.find(s => 
      s.email === 'estudiante@alumnos.ucn.cl'
    );
    
    if (testStudent) {
      console.log('👤 Estudiante encontrado:');
      console.log('- ID:', testStudent._id);
      console.log('- Email:', testStudent.email);
      console.log('- Nombre:', testStudent.nombres, testStudent.apellidos);
      console.log('- User ID:', testStudent.userId);
      console.log('- Carrera ID:', testStudent.carreraId);
    } else {
      console.log('❌ Estudiante de prueba no encontrado');
      console.log('Estudiantes disponibles:');
      studentsResponse.data.forEach(s => {
        console.log(`- ${s.email} (ID: ${s._id})`);
      });
    }
    
    // Ahora login con el estudiante para verificar su token
    console.log('\n📝 Login con estudiante...');
    try {
      const studentLoginResponse = await axios.post(`${BASE_URL}/auth/login`, {
        email: 'estudiante@alumnos.ucn.cl',
        password: 'password123'
      });
      
      const studentUser = studentLoginResponse.data.data.data.user;
      console.log('👤 Datos del usuario estudiante:');
      console.log('- User ID:', studentUser._id);
      console.log('- Email:', studentUser.email);
      console.log('- Roles:', studentUser.roles);
      console.log('- Student ID:', studentUser.studentId);
      
      // Si el studentId no está definido, necesitamos corregirlo
      if (!studentUser.studentId && testStudent) {
        console.log('🔧 Corrigiendo studentId en el usuario...');
        
        // Aquí podríamos hacer un PATCH al usuario para agregar el studentId
        // Pero primero vamos a verificar si existe el endpoint
        console.log('💡 El studentId debería ser:', testStudent._id);
      }
      
    } catch (studentLoginError) {
      console.log('❌ Error en login del estudiante:');
      console.log('Status:', studentLoginError.response?.status);
      console.log('Data:', studentLoginError.response?.data);
    }
    
  } catch (error) {
    console.error('❌ Error general:');
    console.error('Status:', error.response?.status);
    console.error('Data:', error.response?.data || error.message);
  }
}

fixStudentData();

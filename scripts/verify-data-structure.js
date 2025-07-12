/**
 * Script de verificación para la corrección del doble anidamiento de datos
 * Última actualización: 10/07/2025
 */

const axios = require('axios');

async function verifyDataStructure() {
  const baseUrl = process.env.BACKEND_URL || 'http://localhost:3000';
  
  console.log('🔍 Verificando estructura de datos del backend...');
  
  try {
    // Test 1: Verificar endpoint de estudiantes a través del cache
    console.log('\n1. Probando endpoint de estudiantes...');
    const studentsResponse = await axios.get(`${baseUrl}/api/hawaii-cache/students/20241`);
    
    console.log('Estructura de respuesta estudiantes:');
    console.log('- success:', typeof studentsResponse.data.success);
    console.log('- statusCode:', typeof studentsResponse.data.statusCode);
    console.log('- data:', Array.isArray(studentsResponse.data.data) ? 'Array' : typeof studentsResponse.data.data);
    
    if (studentsResponse.data.data && studentsResponse.data.data.data) {
      console.log('❌ ERROR: Detectado doble anidamiento en estudiantes!');
    } else {
      console.log('✅ OK: Estructura correcta para estudiantes');
    }
    
    // Test 2: Verificar endpoint de oferta académica
    console.log('\n2. Probando endpoint de oferta académica...');
    const coursesResponse = await axios.get(`${baseUrl}/api/hawaii-cache/courses/20241`);
    
    console.log('Estructura de respuesta cursos:');
    console.log('- success:', typeof coursesResponse.data.success);
    console.log('- statusCode:', typeof coursesResponse.data.statusCode);
    console.log('- data:', Array.isArray(coursesResponse.data.data) ? 'Array' : typeof coursesResponse.data.data);
    
    if (coursesResponse.data.data && coursesResponse.data.data.data) {
      console.log('❌ ERROR: Detectado doble anidamiento en cursos!');
    } else {
      console.log('✅ OK: Estructura correcta para cursos');
    }
    
    // Test 3: Verificar endpoint de inscripciones
    console.log('\n3. Probando endpoint de inscripciones...');
    const enrollmentsResponse = await axios.get(`${baseUrl}/api/hawaii-cache/enrollments/20241`);
    
    console.log('Estructura de respuesta inscripciones:');
    console.log('- success:', typeof enrollmentsResponse.data.success);
    console.log('- statusCode:', typeof enrollmentsResponse.data.statusCode);
    console.log('- data:', Array.isArray(enrollmentsResponse.data.data) ? 'Array' : typeof enrollmentsResponse.data.data);
    
    if (enrollmentsResponse.data.data && enrollmentsResponse.data.data.data) {
      console.log('❌ ERROR: Detectado doble anidamiento en inscripciones!');
    } else {
      console.log('✅ OK: Estructura correcta para inscripciones');
    }
    
    console.log('\n🎉 Verificación completada!');
    
  } catch (error) {
    console.error('❌ Error durante la verificación:', error.message);
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', error.response.data);
    }
  }
}

// Ejecutar verificación
verifyDataStructure();

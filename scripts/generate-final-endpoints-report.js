const axios = require('axios');
const fs = require('fs');

// Generador de reporte final sobre endpoints
async function generateFinalEndpointsReport() {
  let token = null;
  const report = {
    timestamp: new Date().toISOString(),
    auth: null,
    working: [],
    missing: [],
    discovered: [],
    problematic: [],
    summary: {}
  };
  
  try {
    console.log('🔐 Autenticando para generar reporte...');
    const loginResponse = await axios.post('http://localhost:3001/auth/login', {
      email: 'coordinadora@ucn.cl',
      password: 'Test123!'
    });
    
    token = loginResponse.data.data.data.access_token;
    report.auth = { status: 'success', token_structure: 'data.data.data.access_token' };
    console.log('✅ Autenticación exitosa\n');
    
  } catch (error) {
    report.auth = { status: 'failed', error: error.message };
    console.log('❌ Error en autenticación');
    return;
  }

  const headers = { Authorization: `Bearer ${token}` };
  
  console.log('📊 GENERANDO REPORTE COMPLETO DE ENDPOINTS');
  console.log('='.repeat(50));

  // 1. ENDPOINTS QUE SABEMOS QUE FUNCIONAN
  console.log('\n✅ VALIDANDO ENDPOINTS CONOCIDOS FUNCIONALES:');
  const workingEndpoints = [
    { method: 'POST', url: '/auth/login', desc: 'Autenticación' },
    { method: 'GET', url: '/users/profile', desc: 'Perfil usuario' },
    { method: 'GET', url: '/users', desc: 'Lista usuarios' },
    { method: 'GET', url: '/students', desc: 'Lista estudiantes' },
    { method: 'GET', url: '/departments', desc: 'Lista departamentos' },
    { method: 'GET', url: '/careers', desc: 'Lista carreras' },
    { method: 'GET', url: '/courses', desc: 'Lista cursos' },
    { method: 'GET', url: '/categories', desc: 'Lista categorías' },
    { method: 'GET', url: '/adjustments', desc: 'Lista ajustes' },
    { method: 'GET', url: '/resources', desc: 'Lista recursos' },
    { method: 'GET', url: '/notifications', desc: 'Notificaciones usuario' }
  ];

  for (const endpoint of workingEndpoints) {
    const result = await testEndpoint(endpoint.method, endpoint.url, headers, endpoint.desc);
    if (result.success) {
      report.working.push(result);
      console.log(`✅ ${endpoint.method} ${endpoint.url} - ${result.status}`);
    } else {
      report.problematic.push(result);
      console.log(`❌ ${endpoint.method} ${endpoint.url} - ${result.status} - ${result.error}`);
    }
  }

  // 2. ENDPOINTS DESCUBIERTOS EN EL TEST INTELIGENTE
  console.log('\n🔍 VALIDANDO ENDPOINTS DESCUBIERTOS:');
  const discoveredEndpoints = [
    { method: 'GET', url: '/consents/all', desc: 'Lista todos los consentimientos' },
    { method: 'GET', url: '/api', desc: 'Info de API' },
    { method: 'GET', url: '/health', desc: 'Health check' },
    { method: 'GET', url: '/diddec/statistics', desc: 'Estadísticas DIDDEC' },
    { method: 'GET', url: '/diddec/reports/semester/2025-1', desc: 'Reportes DIDDEC' }
  ];

  for (const endpoint of discoveredEndpoints) {
    const result = await testEndpoint(endpoint.method, endpoint.url, headers, endpoint.desc);
    if (result.success) {
      report.discovered.push(result);
      console.log(`🎉 ${endpoint.method} ${endpoint.url} - ${result.status} - ¡DESCUBIERTO!`);
    } else {
      console.log(`❌ ${endpoint.method} ${endpoint.url} - ${result.status}`);
    }
  }

  // 3. ENDPOINTS CONFIRMADOS COMO FALTANTES
  console.log('\n❌ CONFIRMANDO ENDPOINTS FALTANTES:');
  const missingEndpoints = [
    { method: 'GET', url: '/documents', desc: 'Lista general documentos' },
    { method: 'POST', url: '/documents', desc: 'Crear documento (base)' },
    { method: 'GET', url: '/consents', desc: 'Lista consentimientos (base)' },
    { method: 'POST', url: '/notifications', desc: 'Crear notificación' },
    { method: 'GET', url: '/sync/status', desc: 'Estado sincronización' },
    { method: 'POST', url: '/sync/hawaii', desc: 'Sincronizar Hawaii' }
  ];

  for (const endpoint of missingEndpoints) {
    const result = await testEndpoint(endpoint.method, endpoint.url, headers, endpoint.desc);
    if (!result.success && result.status === 404) {
      report.missing.push(result);
      console.log(`❌ ${endpoint.method} ${endpoint.url} - CONFIRMADO FALTANTE`);
    }
  }

  // 4. PROBLEMA ESPECÍFICO /students/profile
  console.log('\n🔴 VALIDANDO PROBLEMA CRÍTICO:');
  const profileResult = await testEndpoint('GET', '/students/profile', headers, 'Perfil estudiante');
  if (!profileResult.success && profileResult.status === 500) {
    report.problematic.push({
      ...profileResult,
      critical: true,
      notes: 'Error 500 - Probable problema con roles undefined en @CurrentUser'
    });
    console.log(`🔴 GET /students/profile - ERROR CRÍTICO 500`);
  }

  // 5. GENERAR ESTADÍSTICAS
  report.summary = {
    total_tested: report.working.length + report.missing.length + report.discovered.length + report.problematic.length,
    working_count: report.working.length,
    discovered_count: report.discovered.length,
    missing_count: report.missing.length,
    problematic_count: report.problematic.length,
    success_rate: Math.round((report.working.length + report.discovered.length) / (report.working.length + report.missing.length + report.discovered.length + report.problematic.length) * 100)
  };

  // 6. GUARDAR REPORTE
  const reportPath = 'docs/ENDPOINTS_FINAL_REPORT.json';
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));

  // 7. MOSTRAR RESUMEN
  console.log('\n📊 RESUMEN FINAL:');
  console.log('='.repeat(50));
  console.log(`✅ Endpoints funcionando: ${report.working.length}`);
  console.log(`🎉 Endpoints descubiertos: ${report.discovered.length}`);
  console.log(`❌ Endpoints faltantes: ${report.missing.length}`);
  console.log(`🔴 Endpoints problemáticos: ${report.problematic.length}`);
  console.log(`📈 Tasa de éxito: ${report.summary.success_rate}%`);
  console.log(`💾 Reporte guardado en: ${reportPath}`);

  // 8. RECOMENDACIONES
  console.log('\n🚀 RECOMENDACIONES PRIORITARIAS:');
  console.log('='.repeat(50));
  
  if (report.problematic.some(p => p.critical)) {
    console.log('🔴 CRÍTICO: Corregir /students/profile (error 500)');
  }
  
  if (report.missing.length > 0) {
    console.log('🟡 MEDIO: Implementar endpoints faltantes si son necesarios:');
    report.missing.forEach(m => console.log(`   - ${m.method} ${m.url}`));
  }

  if (report.discovered.length > 0) {
    console.log('✅ POSITIVO: Se encontraron endpoints adicionales funcionando');
  }

  console.log('\n✅ REPORTE COMPLETO GENERADO');
}

async function testEndpoint(method, url, headers, description) {
  try {
    let response;
    const fullUrl = `http://localhost:3001${url}`;
    
    if (method === 'GET') {
      response = await axios.get(fullUrl, { headers });
    } else if (method === 'POST') {
      response = await axios.post(fullUrl, {}, { headers });
    }
    
    return {
      success: true,
      method,
      url,
      status: response.status,
      description,
      response_size: JSON.stringify(response.data).length
    };
    
  } catch (error) {
    return {
      success: false,
      method,
      url,
      status: error.response?.status || 'CONNECTION_ERROR',
      description,
      error: error.response?.data?.message || error.message
    };
  }
}

// Ejecutar
generateFinalEndpointsReport().catch(console.error); 
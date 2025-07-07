// Pruebas de estrés y carga para validación de producción
const axios = require('axios');
const cluster = require('cluster');
const os = require('os');

const API_BASE = 'http://localhost:3000';
const STRESS_TEST_CONFIG = {
  concurrent_users: 50,
  requests_per_user: 20,
  test_duration_minutes: 5,
  critical_endpoints: [
    '/auth/login',
    '/students',
    '/adjustments',
    '/diddec/statistics',
    '/notifications'
  ]
};

class StressTestRunner {
  constructor() {
    this.results = {
      totalRequests: 0,
      successfulRequests: 0,
      failedRequests: 0,
      averageResponseTime: 0,
      maxResponseTime: 0,
      minResponseTime: Infinity,
      requestsPerSecond: 0,
      errorsByType: {},
      memoryUsage: [],
      cpuUsage: []
    };
    this.startTime = Date.now();
    this.responseTimes = [];
  }

  async runStressTest() {
    console.log('⚡ INICIANDO PRUEBAS DE ESTRÉS Y CARGA');
    console.log('=' * 60);
    console.log(`Usuarios concurrentes: ${STRESS_TEST_CONFIG.concurrent_users}`);
    console.log(`Requests por usuario: ${STRESS_TEST_CONFIG.requests_per_user}`);
    console.log(`Duración: ${STRESS_TEST_CONFIG.test_duration_minutes} minutos`);
    console.log('=' * 60);

    // Primero obtener token válido
    const token = await this.getAuthToken();
    if (!token) {
      console.error('❌ No se pudo obtener token de autenticación');
      return;
    }

    // Monitoreo de recursos del sistema
    this.startSystemMonitoring();

    // Ejecutar pruebas de carga en paralelo
    const promises = [];
    for (let i = 0; i < STRESS_TEST_CONFIG.concurrent_users; i++) {
      promises.push(this.simulateUser(token, i));
    }

    console.log(`🚀 Lanzando ${STRESS_TEST_CONFIG.concurrent_users} usuarios virtuales...`);
    
    await Promise.all(promises);
    
    this.stopSystemMonitoring();
    this.generateStressReport();
  }

  async getAuthToken() {
    try {
      const response = await axios.post(`${API_BASE}/auth/login`, {
        email: 'coordinadora@ucn.cl',
        password: 'password123'
      });
      return response.data.data.data.accessToken;
    } catch (error) {
      console.error('Error obteniendo token:', error.message);
      return null;
    }
  }

  async simulateUser(token, userId) {
    const userResults = {
      requests: 0,
      successes: 0,
      failures: 0,
      totalTime: 0
    };

    for (let i = 0; i < STRESS_TEST_CONFIG.requests_per_user; i++) {
      const endpoint = STRESS_TEST_CONFIG.critical_endpoints[
        Math.floor(Math.random() * STRESS_TEST_CONFIG.critical_endpoints.length)
      ];

      const startTime = Date.now();
      
      try {
        const response = await this.makeRequest(endpoint, token);
        const responseTime = Date.now() - startTime;
        
        this.recordSuccess(responseTime);
        userResults.successes++;
        
        // Simular tiempo de pensamiento del usuario (100-500ms)
        await this.sleep(100 + Math.random() * 400);
        
      } catch (error) {
        const responseTime = Date.now() - startTime;
        this.recordFailure(error, responseTime);
        userResults.failures++;
      }
      
      userResults.requests++;
      
      // Logging periódico
      if (i % 10 === 0) {
        console.log(`Usuario ${userId}: ${i}/${STRESS_TEST_CONFIG.requests_per_user} requests completados`);
      }
    }

    console.log(`✅ Usuario ${userId} completado: ${userResults.successes}/${userResults.requests} exitosos`);
    return userResults;
  }

  async makeRequest(endpoint, token) {
    const config = {
      headers: { Authorization: `Bearer ${token}` },
      timeout: 10000
    };

    switch (endpoint) {
      case '/auth/login':
        return await axios.post(`${API_BASE}${endpoint}`, {
          email: 'coordinadora@ucn.cl',
          password: 'password123'
        });
      
      case '/students':
        return await axios.get(`${API_BASE}${endpoint}`, config);
      
      case '/adjustments':
        return await axios.get(`${API_BASE}${endpoint}`, config);
      
      case '/diddec/statistics':
        return await axios.get(`${API_BASE}${endpoint}`, config);
      
      case '/notifications':
        return await axios.get(`${API_BASE}${endpoint}`, config);
      
      default:
        return await axios.get(`${API_BASE}${endpoint}`, config);
    }
  }

  recordSuccess(responseTime) {
    this.results.totalRequests++;
    this.results.successfulRequests++;
    this.responseTimes.push(responseTime);
    
    if (responseTime > this.results.maxResponseTime) {
      this.results.maxResponseTime = responseTime;
    }
    if (responseTime < this.results.minResponseTime) {
      this.results.minResponseTime = responseTime;
    }
  }

  recordFailure(error, responseTime) {
    this.results.totalRequests++;
    this.results.failedRequests++;
    
    const errorType = error.response?.status || 'network_error';
    this.results.errorsByType[errorType] = (this.results.errorsByType[errorType] || 0) + 1;
    
    if (responseTime) {
      this.responseTimes.push(responseTime);
    }
  }

  startSystemMonitoring() {
    this.monitoringInterval = setInterval(() => {
      const memUsage = process.memoryUsage();
      this.results.memoryUsage.push({
        timestamp: Date.now(),
        heapUsed: memUsage.heapUsed,
        heapTotal: memUsage.heapTotal,
        external: memUsage.external
      });
    }, 1000);
  }

  stopSystemMonitoring() {
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
    }
  }

  generateStressReport() {
    const duration = (Date.now() - this.startTime) / 1000;
    
    // Calcular métricas
    if (this.responseTimes.length > 0) {
      this.results.averageResponseTime = 
        this.responseTimes.reduce((a, b) => a + b, 0) / this.responseTimes.length;
    }
    
    this.results.requestsPerSecond = this.results.totalRequests / duration;
    
    // Percentiles
    const sortedTimes = this.responseTimes.sort((a, b) => a - b);
    const p95Index = Math.floor(sortedTimes.length * 0.95);
    const p99Index = Math.floor(sortedTimes.length * 0.99);
    
    console.log('\n' + '=' * 60);
    console.log('📊 REPORTE DE PRUEBAS DE ESTRÉS');
    console.log('=' * 60);
    
    console.log('\n🎯 MÉTRICAS GENERALES:');
    console.log(`   Duración total: ${duration.toFixed(2)} segundos`);
    console.log(`   Requests totales: ${this.results.totalRequests}`);
    console.log(`   Requests exitosos: ${this.results.successfulRequests}`);
    console.log(`   Requests fallidos: ${this.results.failedRequests}`);
    console.log(`   Tasa de éxito: ${((this.results.successfulRequests / this.results.totalRequests) * 100).toFixed(2)}%`);
    console.log(`   Requests por segundo: ${this.results.requestsPerSecond.toFixed(2)}`);
    
    console.log('\n⏱️  TIEMPOS DE RESPUESTA:');
    console.log(`   Promedio: ${this.results.averageResponseTime.toFixed(2)}ms`);
    console.log(`   Mínimo: ${this.results.minResponseTime}ms`);
    console.log(`   Máximo: ${this.results.maxResponseTime}ms`);
    
    if (sortedTimes.length > 0) {
      console.log(`   Percentil 95: ${sortedTimes[p95Index] || 0}ms`);
      console.log(`   Percentil 99: ${sortedTimes[p99Index] || 0}ms`);
    }
    
    if (Object.keys(this.results.errorsByType).length > 0) {
      console.log('\n❌ ERRORES POR TIPO:');
      Object.entries(this.results.errorsByType).forEach(([type, count]) => {
        console.log(`   ${type}: ${count}`);
      });
    }
    
    // Análisis de rendimiento
    console.log('\n📈 ANÁLISIS DE RENDIMIENTO:');
    
    const successRate = (this.results.successfulRequests / this.results.totalRequests) * 100;
    const avgResponseTime = this.results.averageResponseTime;
    
    if (successRate >= 99.5) {
      console.log('   ✅ Excelente estabilidad bajo carga');
    } else if (successRate >= 95) {
      console.log('   ⚠️  Estabilidad aceptable, revisar errores');
    } else {
      console.log('   ❌ Problemas de estabilidad detectados');
    }
    
    if (avgResponseTime <= 200) {
      console.log('   ✅ Excelente tiempo de respuesta');
    } else if (avgResponseTime <= 1000) {
      console.log('   ⚠️  Tiempo de respuesta aceptable');
    } else {
      console.log('   ❌ Tiempo de respuesta lento');
    }
    
    if (this.results.requestsPerSecond >= 100) {
      console.log('   ✅ Excelente throughput');
    } else if (this.results.requestsPerSecond >= 50) {
      console.log('   ⚠️  Throughput aceptable');
    } else {
      console.log('   ❌ Throughput bajo');
    }
    
    // Recomendaciones
    console.log('\n💡 RECOMENDACIONES:');
    
    if (this.results.maxResponseTime > 5000) {
      console.log('   - Considerar optimización de queries de base de datos');
      console.log('   - Implementar cache para endpoints frecuentes');
    }
    
    if (successRate < 99) {
      console.log('   - Revisar manejo de errores y timeouts');
      console.log('   - Considerar implementar circuit breakers');
    }
    
    if (this.results.requestsPerSecond < 50) {
      console.log('   - Optimizar performance del servidor');
      console.log('   - Considerar scaling horizontal');
    }
    
    // Guardar reporte detallado
    const report = {
      timestamp: new Date().toISOString(),
      config: STRESS_TEST_CONFIG,
      results: this.results,
      duration,
      analysis: {
        successRate,
        avgResponseTime,
        throughput: this.results.requestsPerSecond
      }
    };
    
    const fs = require('fs');
    const reportPath = `test-results/stress-test-${Date.now()}.json`;
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
    
    console.log(`\n📄 Reporte detallado guardado en: ${reportPath}`);
    console.log('=' * 60);
  }

  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// Ejecutar pruebas de estrés
async function runStressTests() {
  const runner = new StressTestRunner();
  await runner.runStressTest();
}

module.exports = { StressTestRunner, runStressTests };

// Si se ejecuta directamente
if (require.main === module) {
  runStressTests().catch(console.error);
}

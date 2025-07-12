const http = require('http');

const testEndpoint = (endpoint, description) => {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 3001,
      path: endpoint,
      method: 'GET',
      timeout: 5000
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => {
        try {
          const response = JSON.parse(data);
          console.log(`✅ ${description}`);
          console.log(`   Status: ${res.statusCode}`);
          console.log(`   Structure: ${JSON.stringify(response, null, 2).substring(0, 200)}...`);
          resolve({ status: res.statusCode, data: response });
        } catch (error) {
          console.log(`❌ ${description} - Error parsing JSON: ${error.message}`);
          reject(error);
        }
      });
    });

    req.on('error', (error) => {
      console.log(`❌ ${description} - Connection error: ${error.message}`);
      reject(error);
    });

    req.on('timeout', () => {
      console.log(`❌ ${description} - Request timeout`);
      req.abort();
      reject(new Error('Request timeout'));
    });

    req.setTimeout(5000);
    req.end();
  });
};

async function runTests() {
  console.log('🔍 Verificando estructura de datos del backend...\n');
  
  try {
    // Test endpoints que podrían tener el problema
    await testEndpoint('/api/hawaii/estudiantes', 'Hawaii estudiantes endpoint');
    await testEndpoint('/api/hawaii/oferta', 'Hawaii oferta endpoint');
    
  } catch (error) {
    console.log('❌ Error durante las pruebas:', error.message);
  }
}

runTests();

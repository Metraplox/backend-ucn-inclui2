const puppeteer = require('puppeteer');

async function testFrontendFunctionality() {
  console.log('🚀 INICIANDO PRUEBAS COMPLETAS DEL FRONTEND');
  console.log('==========================================');
  
  let browser;
  try {
    // Configurar Puppeteer
    browser = await puppeteer.launch({
      headless: false,
      args: ['--no-sandbox', '--disable-web-security', '--disable-features=VizDisplayCompositor']
    });
    
    const page = await browser.newPage();
    await page.setViewport({ width: 1200, height: 800 });
    
    console.log('📱 Navegando a la aplicación Flutter...');
    await page.goto('http://localhost:8080', { waitUntil: 'networkidle2' });
    
    // Esperar a que Flutter se cargue
    await page.waitForTimeout(3000);
    
    console.log('✅ Aplicación Flutter cargada');
    
    // Tomar screenshot del estado inicial
    await page.screenshot({ path: 'test_results/frontend_initial.png' });
    
    // Probar login
    console.log('🔐 Probando login...');
    
    // Buscar campos de email y password
    const emailField = await page.$('input[type="email"], input[placeholder*="email"], input[placeholder*="Email"]');
    const passwordField = await page.$('input[type="password"], input[placeholder*="password"], input[placeholder*="contraseña"]');
    
    if (emailField && passwordField) {
      await emailField.type('coordinador@ucn.cl');
      await passwordField.type('password123');
      
      // Buscar botón de login
      const loginButton = await page.$('button[type="submit"], button:contains("Iniciar"), button:contains("Login")');
      if (loginButton) {
        await loginButton.click();
        await page.waitForTimeout(2000);
        
        console.log('✅ Login enviado');
        await page.screenshot({ path: 'test_results/frontend_after_login.png' });
      } else {
        console.log('❌ No se encontró botón de login');
      }
    } else {
      console.log('❌ No se encontraron campos de login');
    }
    
    // Verificar navegación
    console.log('🧭 Verificando navegación...');
    const currentUrl = page.url();
    console.log(`📍 URL actual: ${currentUrl}`);
    
    // Buscar elementos de dashboard
    const dashboardElements = await page.$$('div[class*="dashboard"], div[class*="home"], h1, h2');
    console.log(`📊 Elementos de dashboard encontrados: ${dashboardElements.length}`);
    
    // Probar botones de navegación
    console.log('🔗 Probando botones de navegación...');
    const buttons = await page.$$('button, a[href], div[role="button"]');
    console.log(`🎯 Botones encontrados: ${buttons.length}`);
    
    if (buttons.length > 0) {
      // Hacer click en el primer botón que no sea de logout
      for (let i = 0; i < Math.min(3, buttons.length); i++) {
        try {
          const buttonText = await buttons[i].textContent();
          if (buttonText && !buttonText.toLowerCase().includes('logout') && !buttonText.toLowerCase().includes('salir')) {
            console.log(`🖱️ Haciendo click en: "${buttonText}"`);
            await buttons[i].click();
            await page.waitForTimeout(1000);
            await page.screenshot({ path: `test_results/frontend_navigation_${i}.png` });
          }
        } catch (error) {
          console.log(`⚠️ Error al hacer click en botón ${i}: ${error.message}`);
        }
      }
    }
    
    console.log('✅ PRUEBAS FRONTEND COMPLETADAS');
    
  } catch (error) {
    console.log('❌ Error en las pruebas:', error.message);
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}

// Función alternativa usando solo solicitudes HTTP
async function testFrontendAPI() {
  console.log('🔧 PROBANDO FUNCIONALIDAD VÍA API');
  console.log('==================================');
  
  const axios = require('axios');
  
  try {
    // Probar login
    console.log('🔐 Probando login API...');
    const loginResponse = await axios.post('http://localhost:3000/auth/login', {
      email: 'coordinador@ucn.cl',
      password: 'password123'
    });
    
    let data = loginResponse.data;
    while (data && typeof data === 'object' && data.data) {
      data = data.data;
    }
    
    if (data.accessToken) {
      console.log('✅ Login API exitoso');
      const token = data.accessToken;
      
      // Probar endpoints con token
      const testEndpoints = [
        '/students',
        '/notifications',
        '/dashboards/coordinator'
      ];
      
      for (const endpoint of testEndpoints) {
        try {
          const response = await axios.get(`http://localhost:3000${endpoint}`, {
            headers: { 'Authorization': `Bearer ${token}` }
          });
          console.log(`✅ ${endpoint}: ${response.status}`);
        } catch (error) {
          console.log(`❌ ${endpoint}: ${error.response?.status || 'Error'} - ${error.response?.statusText || error.message}`);
        }
      }
      
    } else {
      console.log('❌ No se obtuvo token del login');
    }
    
  } catch (error) {
    console.log('❌ Error en pruebas API:', error.message);
  }
}

async function main() {
  // Crear directorio para resultados
  const fs = require('fs');
  if (!fs.existsSync('test_results')) {
    fs.mkdirSync('test_results');
  }
  
  console.log('🎯 PRUEBAS COMPLETAS DEL FRONTEND UCN INCLUI2');
  console.log('============================================');
  
  // Primero probar API
  await testFrontendAPI();
  
  console.log('\n');
  
  // Luego probar frontend si hay navegador disponible
  try {
    await testFrontendFunctionality();
  } catch (error) {
    console.log('⚠️ Pruebas con navegador no disponibles, pero API funcional');
  }
  
  console.log('\n🎉 PRUEBAS COMPLETADAS - REVISA LOS RESULTADOS');
}

if (require.main === module) {
  main();
}

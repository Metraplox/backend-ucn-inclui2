/**
 * Script para iniciar el servidor NestJS en modo desarrollo con depuración
 */
const { spawn } = require('child_process');
const path = require('path');
require('dotenv').config();

// Colores para la consola
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  red: '\x1b[31m',
  cyan: '\x1b[36m'
};

console.log(`${colors.bright}${colors.cyan}=== INICIANDO SERVIDOR INCLUI2 EN MODO DESARROLLO ===${colors.reset}`);
console.log(`${colors.yellow}Verificando configuración...${colors.reset}`);

// Verificar variables de entorno críticas
const mongoUri = process.env.MONGODB_URI;
if (!mongoUri) {
  console.error(`${colors.red}Error: MONGODB_URI no está definido en el archivo .env${colors.reset}`);
  process.exit(1);
}

// Mostrar configuración
console.log(`${colors.blue}MongoDB URI: ${mongoUri.replace(/:[^:@]+@/, ':****@')}${colors.reset}`);
console.log(`${colors.blue}Puerto: ${process.env.PORT || 3000}${colors.reset}`);
console.log(`${colors.blue}Entorno: ${process.env.NODE_ENV || 'development'}${colors.reset}`);
console.log(`${colors.blue}CORS: ${process.env.FRONTEND_URL || '*'}${colors.reset}`);

// Iniciar el servidor NestJS en modo desarrollo
console.log(`${colors.yellow}Iniciando servidor NestJS en modo desarrollo...${colors.reset}`);

// Usar el CLI de NestJS directamente
const nestBin = path.join(__dirname, 'node_modules', '.bin', process.platform === 'win32' ? 'nest.cmd' : 'nest');
const server = spawn(nestBin, ['start', '--watch'], {
  stdio: 'inherit',
  env: { ...process.env, NODE_ENV: 'development' }
});

// Mostrar información útil después de un tiempo
setTimeout(() => {
  console.log(`\n${colors.bright}${colors.green}=== SERVIDOR INICIADO ===${colors.reset}`);
  console.log(`${colors.cyan}Swagger UI: ${colors.bright}http://localhost:${process.env.PORT || 3000}/api${colors.reset}`);
  console.log(`${colors.cyan}API Base URL: ${colors.bright}http://localhost:${process.env.PORT || 3000}${colors.reset}`);
  console.log(`${colors.yellow}Presiona Ctrl+C para detener el servidor${colors.reset}`);
}, 5000);

// Manejar señales de terminación
['SIGINT', 'SIGTERM', 'SIGQUIT'].forEach(signal => {
  process.on(signal, () => {
    console.log(`\n${colors.yellow}Deteniendo servidor...${colors.reset}`);
    server.kill(signal);
    process.exit(0);
  });
});

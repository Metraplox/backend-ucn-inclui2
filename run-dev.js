const { exec } = require('child_process');
const colors = require('colors');

console.log(colors.yellow('Iniciando servidor en modo desarrollo...'));

const server = exec('npx nest start --watch');

server.stdout.on('data', (data) => {
  console.log(data);
});

server.stderr.on('data', (data) => {
  console.error(colors.red(data));
});

server.on('close', (code) => {
  console.log(colors.yellow(`\nServidor detenido con código: ${code}`));
});

process.on('SIGINT', () => {
  console.log(colors.yellow('\nDeteniendo servidor...'));
  server.kill();
  process.exit();
});

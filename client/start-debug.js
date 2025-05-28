const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('Verificando ambiente...');
console.log(`Node version: ${process.version}`);
console.log(`Current directory: ${process.cwd()}`);

// Verifica se node_modules existe
if (!fs.existsSync(path.join(process.cwd(), 'node_modules'))) {
  console.log('node_modules não encontrado! Instalando dependências...');
  try {
    require('child_process').execSync('npm install', { stdio: 'inherit' });
  } catch (error) {
    console.error('Erro ao instalar dependências:', error);
    process.exit(1);
  }
}

console.log('Iniciando React...');
const child = spawn('npx', ['react-scripts', 'start'], { stdio: 'inherit' });

child.on('error', (error) => {
  console.error('Erro ao iniciar o servidor React:', error);
});

child.on('exit', (code) => {
  console.log(`Processo React terminou com código ${code}`);
});

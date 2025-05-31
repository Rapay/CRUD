/**
 * Script para corrigir problemas comuns e iniciar a aplicação React
 * Este script:
 * 1. Limpa o cache do npm
 * 2. Remove node_modules
 * 3. Reinstala as dependências
 * 4. Inicia o servidor React
 */
const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

console.log('🔍 Verificando o ambiente...');
console.log(`Node version: ${process.version}`);
console.log(`Diretório atual: ${process.cwd()}`);

function runCommand(command, options = {}) {
  try {
    console.log(`\n🚀 Executando: ${command}`);
    execSync(command, { 
      stdio: 'inherit', 
      ...options 
    });
    return true;
  } catch (error) {
    console.error(`❌ Erro ao executar "${command}":`, error.message);
    return false;
  }
}

// Verifica se o package-lock.json está corrompido
const packageLockPath = path.join(process.cwd(), 'package-lock.json');
if (fs.existsSync(packageLockPath)) {
  try {
    JSON.parse(fs.readFileSync(packageLockPath, 'utf8'));
    console.log('✅ package-lock.json está válido');
  } catch (e) {
    console.log('❌ package-lock.json está corrompido, removendo...');
    fs.unlinkSync(packageLockPath);
  }
}

// Instala dependências, sempre usando --force para resolver conflitos
console.log('\n🧹 Limpando instalação anterior e reinstalando dependências...');
runCommand('npm cache clean --force');

// Reinstalação das dependências
console.log('\n📦 Instalando dependências com --legacy-peer-deps...');
runCommand('npm install --legacy-peer-deps');

// Iniciar a aplicação React
console.log('\n🌟 Iniciando a aplicação React...');
runCommand('npx react-scripts start');

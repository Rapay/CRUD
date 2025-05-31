/**
 * Script para iniciar o servidor backend
 * Este script:
 * 1. Verifica se o arquivo .env existe
 * 2. Verifica a conexão com o banco de dados
 * 3. Inicia o servidor
 */
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🔍 Verificando configuração do servidor...');

// Verificando arquivo .env
const envPath = path.join(__dirname, '.env');
if (!fs.existsSync(envPath)) {
  console.log('❌ Arquivo .env não encontrado. Criando arquivo com configurações padrão...');
  
  const envContent = `DB_TYPE=sqlite
DB_PATH=database.sqlite
PORT=5000
JWT_SECRET=Mki7Shi2ZhjkMKIj39010AHSD123nkls456

# Configurações de email (opcional para testes)
EMAIL_HOST=smtp.exemplo.com
EMAIL_PORT=587
EMAIL_USER=seu_email@exemplo.com
EMAIL_PASSWORD=sua_senha
EMAIL_FROM=seu_email@exemplo.com`;
  
  fs.writeFileSync(envPath, envContent);
  console.log('✅ Arquivo .env criado com sucesso');
}

// Verificando dependências
console.log('\n📦 Verificando dependências do backend...');
try {
  execSync('npm list express sequelize jsonwebtoken bcryptjs', { stdio: 'inherit' });
} catch (error) {
  console.log('⚠️ Algumas dependências podem estar faltando, instalando...');
  execSync('npm install', { stdio: 'inherit' });
}

// Inicializando o banco de dados, se necessário
console.log('\n🗄️ Verificando banco de dados...');
if (!fs.existsSync(path.join(__dirname, 'database.sqlite'))) {
  console.log('💿 Banco de dados não encontrado. Inicializando...');
  try {
    execSync('node scripts/initDb.js', { stdio: 'inherit' });
    console.log('✅ Banco de dados inicializado com sucesso');
  } catch (error) {
    console.error('❌ Erro ao inicializar banco de dados:', error.message);
    process.exit(1);
  }
}

// Iniciando o servidor
console.log('\n🚀 Iniciando o servidor backend...');
try {
  require('./server.js');
} catch (error) {
  console.error('❌ Erro ao iniciar o servidor:', error.message);
  process.exit(1);
}

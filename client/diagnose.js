/**
 * Script de diagnóstico para o frontend React
 * Este script verifica problemas comuns que podem impedir o React de iniciar corretamente
 */
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🔍 Iniciando diagnóstico do frontend React...');
console.log(`Node version: ${process.version}`);
console.log(`Diretório atual: ${process.cwd()}`);

// Verificação de arquivos críticos
const criticalFiles = [
  'src/index.js',
  'src/App.js',
  'public/index.html',
  'package.json',
  'node_modules/react/package.json',
  'node_modules/react-dom/package.json',
  'node_modules/react-scripts/package.json'
];

console.log('\n📂 Verificando arquivos críticos:');
const missingFiles = [];
criticalFiles.forEach(file => {
  const filePath = path.join(process.cwd(), file);
  if (fs.existsSync(filePath)) {
    console.log(`✅ ${file} - OK`);
    
    // Verificação extra para node_modules
    if (file.includes('node_modules')) {
      try {
        const packageJson = JSON.parse(fs.readFileSync(filePath, 'utf8'));
        console.log(`   Versão: ${packageJson.version}`);
      } catch (e) {
        console.log(`   ⚠️ Erro ao ler package.json: ${e.message}`);
      }
    }
  } else {
    console.log(`❌ ${file} - FALTANDO`);
    missingFiles.push(file);
  }
});

// Verificação do conteúdo do App.js
console.log('\n📄 Verificando conteúdo de App.js:');
try {
  const appJsPath = path.join(process.cwd(), 'src/App.js');
  const appJsContent = fs.readFileSync(appJsPath, 'utf8');
  if (appJsContent.trim() === '') {
    console.log('❌ App.js está vazio!');
  } else if (appJsContent.includes('import React')) {
    console.log('✅ App.js contém importação React - OK');
  } else {
    console.log('⚠️ App.js não contém importação React');
  }
} catch (e) {
  console.log(`❌ Erro ao ler App.js: ${e.message}`);
}

// Verificação de versões de pacotes
console.log('\n📦 Verificando compatibilidade das dependências:');

const packageJsonPath = path.join(process.cwd(), 'package.json');
try {
  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
  const deps = packageJson.dependencies;
  
  console.log(`React: ${deps.react}`);
  console.log(`React DOM: ${deps['react-dom']}`);
  console.log(`React Scripts: ${deps['react-scripts']}`);
  
  // Verificar incompatibilidades conhecidas
  const reactVersion = deps.react.replace(/[\^~]/g, '');
  const reactDomVersion = deps['react-dom'].replace(/[\^~]/g, '');
  
  if (reactVersion.split('.')[0] !== reactDomVersion.split('.')[0]) {
    console.log('❌ React e React-DOM têm versões principais diferentes - Incompatível');
  }
  
} catch (e) {
  console.log(`❌ Erro ao ler package.json: ${e.message}`);
}

// Tentativa de solução: restaurar App.js a partir de backup, se vazio
try {
  const appJsPath = path.join(process.cwd(), 'src/App.js');
  const appJsContent = fs.readFileSync(appJsPath, 'utf8');
  
  if (appJsContent.trim() === '') {
    console.log('\n🔧 App.js está vazio, tentando restaurar a partir do backup...');
    
    // Tentar restaurar a partir do App.js.fixed
    const appJsFixedPath = path.join(process.cwd(), 'src/App.js.fixed');
    if (fs.existsSync(appJsFixedPath)) {
      const fixedContent = fs.readFileSync(appJsFixedPath, 'utf8');
      fs.writeFileSync(appJsPath, fixedContent);
      console.log('✅ App.js restaurado com sucesso a partir de App.js.fixed!');
    } else {
      console.log('❌ Backup App.js.fixed não encontrado');
    }
  }
} catch (e) {
  console.log(`❌ Erro ao tentar restaurar App.js: ${e.message}`);
}

// Resultado final
if (missingFiles.length > 0) {
  console.log('\n🚨 Problemas críticos encontrados:');
  console.log('Arquivos faltando:', missingFiles.join(', '));
  console.log('\n💡 Recomendação: Execute "npm install --legacy-peer-deps" para reinstalar as dependências');
} else {
  console.log('\n✅ Todos os arquivos críticos estão presentes');
  console.log('\n💡 Recomendação: Execute "npx react-scripts start" para iniciar o servidor de desenvolvimento React');
}

// Teste final: tentar importar react para verificar a instalação
try {
  console.log('\n🧪 Testando importação do React...');
  const reactPath = require.resolve('react');
  console.log(`✅ React encontrado em: ${reactPath}`);
} catch (e) {
  console.log(`❌ Erro ao importar React: ${e.message}`);
  console.log('💡 Recomendação: Execute "npm install react react-dom --legacy-peer-deps" para reinstalar o React');
}

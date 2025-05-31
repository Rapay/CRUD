# Sistema de Gerenciamento de Auto-Escola

Este projeto é um sistema full-stack para gerenciamento de auto-escolas, permitindo o cadastro de alunos, agendamento de aulas e gerenciamento de instrutores.

## Requisitos

- Node.js (v14 ou superior)
- NPM (v6 ou superior)

## Estrutura do Projeto

- `/client` - Frontend React
- `/config` - Configurações do backend
- `/controllers` - Controladores da API
- `/middleware` - Middlewares de autenticação
- `/models` - Modelos de dados
- `/routes` - Rotas da API
- `/scripts` - Scripts de inicialização e utilidades
- `/services` - Serviços de backend (notificações, etc.)

## Instalação

### Backend (Node.js)

1. Na pasta raiz do projeto, execute:

```bash
# Instalar dependências
npm install

# Inicializar banco de dados com dados de teste
npm run init-db

# Iniciar servidor
node start-server.js
```

O servidor backend estará disponível em: http://localhost:5000

### Frontend (React)

1. Na pasta `/client`, execute:

```bash
# Instalar dependências
npm install --legacy-peer-deps

# Iniciar aplicação React (modo desenvolvimento)
node fix-and-start.js
```

A aplicação React estará disponível em: http://localhost:3000

## Funcionalidades Implementadas

- **Autenticação**
  - Registro de alunos
  - Login de alunos
  - Proteção de rotas autenticadas

- **Gerenciamento de Aulas**
  - Listagem de aulas agendadas
  - Agendamento de novas aulas
  - Cancelamento de aulas

- **Gerenciamento de Instrutores**
  - Listagem de instrutores disponíveis

## Usuários de Teste

Após inicializar o banco de dados com `npm run init-db`, os seguintes usuários estarão disponíveis:

- **Aluno**: 
  - Email: `aluno@teste.com`
  - Senha: `123456`

## Solução de Problemas

### Frontend

Se encontrar problemas ao iniciar o frontend:

1. Execute `node fix-and-start.js` no diretório `/client`
2. Verifique se o backend está em execução na porta 5000

### Backend

Se encontrar problemas ao iniciar o backend:

1. Verifique se o arquivo `.env` existe e está configurado corretamente
2. Execute `node start-server.js` para inicializar o servidor com verificações automáticas
3. Verifique se o banco de dados foi inicializado com `npm run init-db`

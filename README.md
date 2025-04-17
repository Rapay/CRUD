# Sistema de Gerenciamento de Alunos

Um sistema CRUD completo para gerenciamento de alunos, construído com React, Node.js, Express e MongoDB.

## Pré-requisitos

- Node.js (v14 ou superior)
- MongoDB (executando localmente ou uma conta MongoDB Atlas)
- npm ou yarn

## Configuração

1. Clone o repositório
2. Instale as dependências do backend:
   ```bash
   npm install
   ```

3. Configure o frontend:
   ```bash
   # Execute o script de configuração
   setup-frontend.bat
   ```

4. Crie um arquivo `.env` no diretório raiz com as seguintes variáveis:
   ```
   MONGODB_URI=mongodb://localhost:27017/aluno-crud
   PORT=5000
   ```

## Executando a Aplicação

1. Inicie o servidor backend:
   ```bash
   npm run dev
   ```

2. Em um novo terminal, inicie o frontend:
   ```bash
   npm run client
   ```

3. Abra seu navegador e acesse `http://localhost:3000`

## Funcionalidades

- Criar, Ler, Atualizar e Excluir alunos
- Interface moderna com Material-UI
- Design responsivo
- Atualizações em tempo real
- Tratamento de erros
- Validação de formulários
- Gerenciamento de endereços

## Endpoints da API

- GET /api/students - Obter todos os alunos
- GET /api/students/:id - Obter um aluno específico
- POST /api/students - Criar um novo aluno
- PUT /api/students/:id - Atualizar um aluno
- DELETE /api/students/:id - Excluir um aluno

## Modelo de Dados

O modelo de aluno inclui os seguintes campos:
- nome (obrigatório)
- matricula (obrigatório, único)
- email (obrigatório, único)
- curso (obrigatório)
- dataNascimento
- telefone
- endereco (objeto com campos: rua, numero, bairro, cidade, estado, cep) 
# Sistema de Gerenciamento de Auto Escola

Um sistema CRUD completo para gerenciamento de auto escola, construído com React, Node.js, Express e PostgreSQL.

## Pré-requisitos

- Node.js (v14 ou superior)
- PostgreSQL
- npm ou yarn

## Configuração

1. Clone o repositório
2. Instale as dependências do backend:
   ```bash
   npm install
   ```

3. Configure o frontend:
   ```bash
   cd client
   npm install
   ```

4. Crie um arquivo `.env` no diretório raiz com as seguintes variáveis:
   ```
   DB_NAME=autoescola
   DB_USER=postgres
   DB_PASSWORD=postgres
   DB_HOST=localhost
   DB_PORT=5432
   PORT=5000
   ```

## Executando a Aplicação

1. Inicie o servidor backend:
   ```bash
   npm run dev
   ```

2. Em um novo terminal, inicie o frontend:
   ```bash
   cd client
   npm start
   ```

3. Abra seu navegador e acesse `http://localhost:3000`

## Funcionalidades

- Criar, Ler, Atualizar e Excluir alunos e tutores
- Agendar, validar e cancelar aulas
- Gerenciar status de aprovação dos alunos
- Emitir certificados para alunos aprovados
- Interface moderna com Bootstrap
- Design responsivo
- Atualizações em tempo real
- Tratamento de erros e validações

## Endpoints da API

### Alunos
- GET /api/alunos - Listar alunos
- GET /api/alunos/:id - Obter um aluno
- POST /api/alunos - Criar aluno
- PUT /api/alunos/:id - Atualizar aluno
- DELETE /api/alunos/:id - Excluir aluno
- POST /api/alunos/:alunoId/agendar-aula - Agendar aula
- POST /api/alunos/:alunoId/solicitar-certificado - Solicitar certificado

### Tutores
- GET /api/tutores - Listar tutores
- GET /api/tutores/:id - Obter um tutor
- POST /api/tutores - Criar tutor
- PUT /api/tutores/:id - Atualizar tutor
- DELETE /api/tutores/:id - Excluir tutor
- POST /api/tutores/aulas/:aulaId/validar - Validar aula
- POST /api/tutores/alunos/:alunoId/emitir-certificado - Emitir certificado

### Aulas
- GET /api/aulas - Listar aulas
- GET /api/aulas/:id - Obter uma aula
- POST /api/aulas - Criar aula
- PUT /api/aulas/:id - Atualizar aula
- DELETE /api/aulas/:id - Excluir aula
- PATCH /api/aulas/:id/status - Atualizar status da aula
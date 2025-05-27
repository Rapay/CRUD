const express = require('express');
const cors = require('cors');
const sequelize = require('./config/database');
const alunoRoutes = require('./routes/alunoRoutes');
const tutorRoutes = require('./routes/tutorRoutes');
const aulaRoutes = require('./routes/aulaRoutes');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Rota raiz
app.get('/api', (req, res) => {
    res.json({ message: 'Bem-vindo à API da Auto Escola' });
});

// Rotas da API
app.use('/api/alunos', alunoRoutes);
app.use('/api/tutores', tutorRoutes);
app.use('/api/aulas', aulaRoutes);

// Tratamento de erros
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ 
        mensagem: 'Erro interno do servidor',
        erro: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
});

// Rota para lidar com rotas não encontradas
app.use('*', (req, res) => {
    res.status(404).json({ mensagem: 'Rota não encontrada' });
});

// Sincronização do banco de dados e inicialização do servidor
const PORT = process.env.PORT || 5000;

async function startServer() {
    try {
        await sequelize.sync();
        console.log('Banco de dados sincronizado com sucesso');
        
        app.listen(PORT, () => {
            console.log(`Servidor rodando na porta ${PORT}`);
        });
    } catch (error) {
        console.error('Não foi possível iniciar o servidor:', error);
        process.exit(1);
    }
}

startServer();
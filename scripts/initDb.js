const sequelize = require('../config/database');
const Aluno = require('../models/Aluno');
const Tutor = require('../models/Tutor');
const Aula = require('../models/Aula');

async function initializeDatabase() {
    try {
        // Força a sincronização irá deletar as tabelas existentes e recriá-las
        await sequelize.sync({ force: true });
        console.log('Tabelas do banco de dados criadas com sucesso');

        // Cria alguns tutores para teste
        const tutores = await Tutor.bulkCreate([
            { nome: 'João Silva', especialidade: 'Teoria' },
            { nome: 'Maria Santos', especialidade: 'Prática' }
        ]);

        // Cria alguns alunos para teste
        const alunos = await Aluno.bulkCreate([
            { 
                nome: 'Pedro Oliveira', 
                email: 'pedro@email.com',
                senha: '123456' 
            },
            { 
                nome: 'Ana Costa', 
                email: 'ana@email.com',
                senha: '123456' 
            }
        ]);

        // Cria algumas aulas para teste
        await Aula.bulkCreate([
            {
                data: new Date(2025, 5, 21),
                tipo: 'TEORICA',
                AlunoId: alunos[0].id,
                TutorId: tutores[0].id
            },
            {
                data: new Date(2025, 5, 22),
                tipo: 'PRATICA',
                AlunoId: alunos[1].id,
                TutorId: tutores[1].id
            }
        ]);

        console.log('Dados de teste inseridos com sucesso');
    } catch (error) {
        console.error('Erro ao inicializar banco de dados:', error);
    } finally {
        await sequelize.close();
    }
}

initializeDatabase();

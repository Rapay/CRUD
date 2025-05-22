const sequelize = require('../config/database');
const Aluno = require('../models/Aluno');
const Tutor = require('../models/Tutor');
const Aula = require('../models/Aula');

async function initializeDatabase() {
    try {
        // Force sync will drop existing tables and recreate them
        await sequelize.sync({ force: true });
        console.log('Database tables created successfully');

        // Create some test tutors
        const tutores = await Tutor.bulkCreate([
            { nome: 'João Silva', especialidade: 'Teoria' },
            { nome: 'Maria Santos', especialidade: 'Prática' }
        ]);

        // Create some test students
        const alunos = await Aluno.bulkCreate([
            { nome: 'Pedro Oliveira', email: 'pedro@email.com' },
            { nome: 'Ana Costa', email: 'ana@email.com' }
        ]);

        // Create some test classes
        await Aula.bulkCreate([
            {
                data: new Date(2025, 5, 21), // Tomorrow
                tipo: 'TEORICA',
                AlunoId: alunos[0].id,
                TutorId: tutores[0].id
            },
            {
                data: new Date(2025, 5, 22), // Day after tomorrow
                tipo: 'PRATICA',
                AlunoId: alunos[1].id,
                TutorId: tutores[1].id
            }
        ]);

        console.log('Test data inserted successfully');
    } catch (error) {
        console.error('Error initializing database:', error);
    } finally {
        await sequelize.close();
    }
}

initializeDatabase();

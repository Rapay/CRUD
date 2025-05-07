const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const Aluno = require('./Aluno');
const Tutor = require('./Tutor');

const Aula = sequelize.define('Aula', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    data: {
        type: DataTypes.DATE,
        allowNull: false
    },
    tipo: {
        type: DataTypes.ENUM('TEORICA', 'PRATICA'),
        allowNull: false
    },
    status: {
        type: DataTypes.STRING,
        defaultValue: 'AGENDADA',
        validate: {
            isIn: [['AGENDADA', 'CONCLUIDA', 'CANCELADA']]
        }
    }
});

// Definindo os relacionamentos
Aula.belongsTo(Aluno);
Aula.belongsTo(Tutor);

module.exports = Aula;
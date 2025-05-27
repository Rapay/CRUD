const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

// Definição do modelo Tutor
const Tutor = sequelize.define('Tutor', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    nome: {
        type: DataTypes.STRING,
        allowNull: false
    },
    especialidade: {
        type: DataTypes.STRING,
        allowNull: false
    }
});

module.exports = Tutor;
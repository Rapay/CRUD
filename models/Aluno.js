const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const bcrypt = require('bcryptjs');

const Aluno = sequelize.define('Aluno', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    nome: {
        type: DataTypes.STRING,
        allowNull: false
    },
    email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        validate: {
            isEmail: true
        }
    },
    senha: {
        type: DataTypes.STRING,
        allowNull: false
    },
    telefone: {
        type: DataTypes.STRING,
        allowNull: true
    },
    endereco: {
        type: DataTypes.STRING,
        allowNull: true
    },
    dataNascimento: {
        type: DataTypes.DATEONLY,
        allowNull: true
    },
    statusAprovacao: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    }
}, {
    hooks: {
        // Hook para criptografar a senha antes de criar o aluno
        beforeCreate: async (aluno) => {
            if (aluno.senha) {
                const salt = await bcrypt.genSalt(10);
                aluno.senha = await bcrypt.hash(aluno.senha, salt);
            }
        }
    }
});

module.exports = Aluno;
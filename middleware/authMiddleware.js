const jwt = require('jsonwebtoken');
const Aluno = require('../models/Aluno');
require('dotenv').config();

// Middleware para verificar o token JWT
const authMiddleware = async (req, res, next) => {
    try {
        // Obtém o token do cabeçalho da requisição
        const authHeader = req.header('Authorization');
        const token = authHeader?.startsWith('Bearer ') ? authHeader.substring(7) : authHeader;

        // Verifica se o token existe
        if (!token) {
            return res.status(401).json({ mensagem: 'Acesso negado. Token não fornecido.' });
        }

        // Verifica se o token é válido
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        // Busca o aluno
        const aluno = await Aluno.findByPk(decoded.id);
        if (!aluno) {
            return res.status(401).json({ mensagem: 'Aluno não encontrado' });
        }

        // Adiciona o aluno à requisição
        req.aluno = aluno;
        next();
    } catch (error) {
        console.error('Erro de autenticação:', error.message);
        res.status(401).json({ mensagem: 'Token inválido ou expirado' });
    }
};

module.exports = authMiddleware;
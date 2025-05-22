const jwt = require('jsonwebtoken');
const Aluno = require('../models/Aluno');
require('dotenv').config();

const authMiddleware = async (req, res, next) => {
    try {
        // Get token from header
        const token = req.header('Authorization')?.replace('Bearer ', '');
        
        if (!token) {
            return res.status(401).json({ message: 'Autenticação necessária' });
        }

        // Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        // Find aluno
        const aluno = await Aluno.findByPk(decoded.id);
        if (!aluno) {
            return res.status(401).json({ message: 'Aluno não encontrado' });
        }

        // Add aluno to request
        req.aluno = aluno;
        next();
    } catch (error) {
        res.status(401).json({ message: 'Sessão inválida' });
    }
};

module.exports = authMiddleware;
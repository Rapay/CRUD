const express = require('express');
const router = express.Router();
const TutorController = require('../controllers/TutorController');
const authMiddleware = require('../middleware/authMiddleware');

// Rotas protegidas
router.use(authMiddleware);

// Consulta de disponibilidade
router.get('/:id/disponibilidade', TutorController.getDisponibilidade);

// Rotas CRUD
router.post('/', TutorController.criar);
router.get('/', TutorController.listar);
router.get('/:id', TutorController.buscarPorId);
router.put('/:id', TutorController.atualizar);
router.delete('/:id', TutorController.excluir);

// Rotas de lógica de negócio
router.post('/aulas/:aulaId/validar', TutorController.validarAula);
router.post('/alunos/:alunoId/emitir-certificado', TutorController.emitirCertificado);

module.exports = router;
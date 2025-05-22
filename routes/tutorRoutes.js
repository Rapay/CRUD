const express = require('express');
const router = express.Router();
const tutorController = require('../controllers/TutorController');
const authMiddleware = require('../middleware/authMiddleware');

// Rotas protegidas
router.use(authMiddleware);

// Consulta de disponibilidade
router.get('/:id/disponibilidade', tutorController.getDisponibilidade);

// CRUD routes
router.post('/', tutorController.create);
router.get('/', tutorController.findAll);
router.get('/:id', tutorController.findOne);
router.put('/:id', tutorController.update);
router.delete('/:id', tutorController.delete);

// Business logic routes
router.post('/aulas/:aulaId/validar', tutorController.validarAula);
router.post('/alunos/:alunoId/emitir-certificado', tutorController.emitirCertificado);

module.exports = router;
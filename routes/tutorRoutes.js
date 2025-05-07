const express = require('express');
const router = express.Router();
const tutorController = require('../controllers/TutorController');

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
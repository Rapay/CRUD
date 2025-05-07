const express = require('express');
const router = express.Router();
const alunoController = require('../controllers/AlunoController');

// CRUD routes
router.post('/', alunoController.create);
router.get('/', alunoController.findAll);
router.get('/:id', alunoController.findOne);
router.put('/:id', alunoController.update);
router.delete('/:id', alunoController.delete);

// Business logic routes
router.post('/:alunoId/agendar-aula', alunoController.agendarAula);
router.post('/:alunoId/solicitar-certificado', alunoController.solicitarCertificado);

module.exports = router;
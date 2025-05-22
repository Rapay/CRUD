const express = require('express');
const router = express.Router();
const AulaController = require('../controllers/AulaController');
const authMiddleware = require('../middleware/authMiddleware');

// Rotas protegidas
router.use(authMiddleware);

// Consulta de horários
router.get('/horarios-disponiveis', AulaController.getHorariosDisponiveis);

// CRUD básico
router.post('/', AulaController.create);
router.get('/', AulaController.findAll);
router.get('/:id', AulaController.findOne);
router.put('/:id', AulaController.update);
router.delete('/:id', AulaController.delete);

module.exports = router;
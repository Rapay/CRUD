const express = require('express');
const router = express.Router();
const AulaController = require('../controllers/AulaController');
const authMiddleware = require('../middleware/authMiddleware');

// Rotas protegidas
router.use(authMiddleware);

// Consulta de horários disponíveis
router.get('/horarios-disponiveis', AulaController.getHorariosDisponiveis);

// CRUD básico
router.post('/', AulaController.criar);
router.get('/', AulaController.listar);
router.get('/:id', AulaController.buscarPorId);
router.put('/:id', AulaController.atualizar);
router.delete('/:id', AulaController.cancelar);

module.exports = router;
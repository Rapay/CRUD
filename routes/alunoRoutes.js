const express = require('express');
const router = express.Router();
const AlunoController = require('../controllers/AlunoController');
const authMiddleware = require('../middleware/authMiddleware');

// Rotas públicas
router.post('/login', AlunoController.login);
router.post('/register', AlunoController.create);

// Rotas protegidas
router.use(authMiddleware);
router.get('/me', AlunoController.getProfile);
router.put('/me', AlunoController.updateProfile);
router.post('/aulas', AlunoController.agendarAula);
router.get('/aulas', AlunoController.listarAulas);
router.get('/aulas/sugestoes', AlunoController.obterSugestoesHorario);
router.post('/certificado', AlunoController.solicitarCertificado);

// Rotas administrativas (requerem autenticação adicional)
router.get('/', AlunoController.findAll);
router.get('/:id', AlunoController.findOne);
router.put('/:id', AlunoController.update);
router.delete('/:id', AlunoController.delete);

module.exports = router;
const express = require('express');
const router = express.Router();
const AlunoController = require('../controllers/AlunoController');
const authMiddleware = require('../middleware/authMiddleware');

// Public routes
router.post('/login', AlunoController.login);
router.post('/register', AlunoController.create);

// Protected routes
router.use(authMiddleware);
router.get('/me', AlunoController.getProfile);
router.put('/me', AlunoController.updateProfile);
router.post('/aulas', AlunoController.agendarAula);
router.get('/aulas', AlunoController.listarAulas);
router.get('/aulas/sugestoes', AlunoController.obterSugestoesHorario);
router.post('/certificado', AlunoController.solicitarCertificado);

// Administrative routes (require additional authentication)
router.get('/', AlunoController.findAll);
router.get('/:id', AlunoController.findOne);
router.put('/:id', AlunoController.update);
router.delete('/:id', AlunoController.delete);

module.exports = router;
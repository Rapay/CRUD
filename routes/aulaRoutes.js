const express = require('express');
const router = express.Router();
const aulaController = require('../controllers/AulaController');

// CRUD routes
router.post('/', aulaController.create);
router.get('/', aulaController.findAll);
router.get('/:id', aulaController.findOne);
router.put('/:id', aulaController.update);
router.delete('/:id', aulaController.delete);

// Status update route
router.patch('/:id/status', aulaController.updateStatus);

module.exports = router;
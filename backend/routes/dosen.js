const express = require('express');
const router = express.Router();
const dosenController = require('../controllers/dosenController');
const { authMiddleware, adminMiddleware } = require('../middleware/auth');

router.get('/', authMiddleware, dosenController.getAll);
router.get('/:id', authMiddleware, dosenController.getById);
router.post('/', authMiddleware, adminMiddleware, dosenController.create);
router.put('/:id', authMiddleware, adminMiddleware, dosenController.update);
router.delete('/:id', authMiddleware, adminMiddleware, dosenController.delete);

module.exports = router;
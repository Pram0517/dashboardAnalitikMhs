// backend/routes/kurikulum.js
const express = require('express');
const router = express.Router();
const kurikulumController = require('../controllers/kurikulumController');
const { authMiddleware, adminMiddleware } = require('../middleware/auth');

// ============ KURIKULUM ROUTES ============
// GET all kurikulum
router.get('/', authMiddleware, kurikulumController.getAllKurikulum);

// ============ SUMMARY - HARUS DI ATAS /:id ============
// GET summary kurikulum
router.get('/summary', authMiddleware, kurikulumController.getSummary);

// ============ MATA KULIAH ROUTES ============
// GET all mata kuliah with filters
router.get('/mata-kuliah', authMiddleware, kurikulumController.getAllMataKuliah);

// GET mata kuliah by ID
router.get('/mata-kuliah/:id', authMiddleware, kurikulumController.getMataKuliahById);

// POST create mata kuliah
router.post('/mata-kuliah', authMiddleware, adminMiddleware, kurikulumController.createMataKuliah);

// PUT update mata kuliah
router.put('/mata-kuliah/:id', authMiddleware, adminMiddleware, kurikulumController.updateMataKuliah);

// DELETE mata kuliah
router.delete('/mata-kuliah/:id', authMiddleware, adminMiddleware, kurikulumController.deleteMataKuliah);

// ============ MATA KULIAH BY KURIKULUM ============
// GET mata kuliah by kurikulum_id
router.get('/:kurikulum_id/mata-kuliah', authMiddleware, kurikulumController.getMataKuliahByKurikulum);

// ============ KURIKULUM BY ID - HARUS DI BAWAH ROUTE SPESIFIK ============
// GET kurikulum by ID
router.get('/:id', authMiddleware, kurikulumController.getKurikulumById);

// POST create kurikulum
router.post('/', authMiddleware, adminMiddleware, kurikulumController.createKurikulum);

// PUT update kurikulum
router.put('/:id', authMiddleware, adminMiddleware, kurikulumController.updateKurikulum);

// DELETE kurikulum
router.delete('/:id', authMiddleware, adminMiddleware, kurikulumController.deleteKurikulum);

module.exports = router;
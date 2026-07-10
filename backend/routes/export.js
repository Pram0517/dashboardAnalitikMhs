const express = require('express');
const router = express.Router();
const exportController = require('../controllers/exportController');
const { authMiddleware, kaprodiOrAdminMiddleware } = require('../middleware/auth');

// ============ EXPORT ROUTES ============
router.get('/mahasiswa', authMiddleware, kaprodiOrAdminMiddleware, exportController.exportMahasiswa);
router.get('/skripsi', authMiddleware, kaprodiOrAdminMiddleware, exportController.exportSkripsi);
router.get('/capstone', authMiddleware, kaprodiOrAdminMiddleware, exportController.exportCapstone);

// ============ DOWNLOAD ============
router.get('/download/:filename', authMiddleware, exportController.downloadFile);

module.exports = router;
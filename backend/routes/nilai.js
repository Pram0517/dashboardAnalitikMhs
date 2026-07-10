// backend/routes/nilai.js
const express = require('express');
const router = express.Router();
const nilaiController = require('../controllers/nilaiController');
const { authMiddleware } = require('../middleware/auth');

// Get konversi nilai
router.get('/konversi', nilaiController.getKonversiNilai);

router.get('/:nim/ips/:semester', authMiddleware, nilaiController.getIPS);
router.get('/:nim/ipk', authMiddleware, nilaiController.getIPK);
router.get('/:nim/nilai', authMiddleware, nilaiController.getNilaiMahasiswa);
router.get('/:nim/ips-all', authMiddleware, nilaiController.getIPSAllSemester);
router.get('/:nim/statistik', authMiddleware, nilaiController.getStatistikNilai);
router.post('/:nim/nilai', authMiddleware, nilaiController.upsertNilai);
router.delete('/:nim/nilai/:id', authMiddleware, nilaiController.deleteNilai);
router.get('/:nim/kurikulum-nilai', authMiddleware, nilaiController.getKurikulumWithNilai);

module.exports = router;
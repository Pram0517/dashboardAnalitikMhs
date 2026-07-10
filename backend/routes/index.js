// backend/routes/index.js
const express = require('express');
const router = express.Router();

// Import routes
const authRoutes = require('./auth');
const dashboardRoutes = require('./dashboard');
const mahasiswaRoutes = require('./mahasiswa');
const dosenRoutes = require('./dosen');
const skripsiRoutes = require('./skripsi');
const evaluasiRoutes = require('./evaluasi');
const kurikulumRoutes = require('./kurikulum');
const uploadRoutes = require('./upload');
const exportRoutes = require('./export');
const userRoutes = require('./user');
const notificationRoutes = require('./notification');
const capstoneRoutes = require('./capstone');

// Coba load nilaiRoutes dengan try-catch
let nilaiRoutes;
try {
    nilaiRoutes = require('./nilai');
    console.log('✅ Nilai routes loaded successfully');
} catch (err) {
    console.log('⚠️ Nilai routes not found, using fallback');
    // Fallback: buat route sederhana
    const express = require('express');
    const router = express.Router();
    router.get('/:nim/nilai', (req, res) => {
        res.json({ message: 'Nilai route fallback' });
    });
    nilaiRoutes = router;
}

router.get('/', (req, res) => {
    res.json({
        message: 'Dashboard Analitik API',
        version: '1.0.0',
        endpoints: {
            auth: '/api/auth',
            dashboard: '/api/dashboard',
            mahasiswa: '/api/mahasiswa',
            dosen: '/api/dosen',
            skripsi: '/api/skripsi',
            evaluasi: '/api/evaluasi',
            kurikulum: '/api/kurikulum',
            upload: '/api/upload',
            export: '/api/export',
            users: '/api/users',
            notifications: '/api/notifications',
            capstone: '/api/capstone',
            nilai: '/api/nilai'
        }
    });
});

// Use routes
router.use('/auth', authRoutes);
router.use('/dashboard', dashboardRoutes);
router.use('/mahasiswa', mahasiswaRoutes);
router.use('/dosen', dosenRoutes);
router.use('/skripsi', skripsiRoutes);
router.use('/evaluasi', evaluasiRoutes);
router.use('/kurikulum', kurikulumRoutes);
router.use('/upload', uploadRoutes);
router.use('/export', exportRoutes);
router.use('/users', userRoutes);
router.use('/notifications', notificationRoutes);
router.use('/capstone', capstoneRoutes);

// Coba gunakan nilaiRoutes
if (nilaiRoutes) {
    router.use('/nilai', nilaiRoutes);
    console.log('✅ /nilai route registered');
}

module.exports = router;
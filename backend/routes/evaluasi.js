// backend/routes/evaluasi.js
const express = require('express');
const router = express.Router();
const { authMiddleware, kaprodiOrAdminMiddleware } = require('../middleware/auth');
const evaluasiStudiController = require('../controllers/evaluasiStudiController');

// ============ GET ALL EVALUASI ============
router.get('/', authMiddleware, kaprodiOrAdminMiddleware, async(req, res) => {
    try {
        const pool = require('../config/database');

        // Hanya gunakan kolom yang ada di tabel mahasiswa
        const result = await pool.query(`
            SELECT 
                m.id,
                m.npm as nim,
                m.nama_lengkap,
                m.semester,
                m.gpa as ipk,
                m.status,
                m.created_at,
                m.updated_at
            FROM mahasiswa m
            ORDER BY m.created_at DESC
        `);

        res.json({
            status: 'Success',
            data: result.rows,
            pagination: {
                total: result.rows.length,
                page: 1,
                pages: 1
            }
        });
    } catch (error) {
        console.error('Error fetching evaluasi:', error);
        res.status(500).json({
            status: 'Error',
            message: error.message
        });
    }
});

// ============ GET EVALUASI SUMMARY ============
router.get('/summary', authMiddleware, kaprodiOrAdminMiddleware, async(req, res) => {
    try {
        const pool = require('../config/database');

        const totalResult = await pool.query('SELECT COUNT(*) as total FROM mahasiswa');
        const aktifResult = await pool.query("SELECT COUNT(*) as total FROM mahasiswa WHERE status = 'aktif'");

        const total = parseInt(totalResult.rows[0].total) || 0;
        const aktif = parseInt(aktifResult.rows[0].total) || 0;

        res.json({
            status: 'Success',
            data: {
                total: total,
                aktif: aktif,
                berisiko: 0,
                evaluasi: 0,
                lulus: 0
            }
        });
    } catch (error) {
        console.error('Error fetching evaluasi summary:', error);
        res.status(500).json({
            status: 'Error',
            message: error.message
        });
    }
});

// ============ GET EVALUASI BY NIM ============
router.get('/nim/:nim', authMiddleware, async(req, res) => {
    try {
        const pool = require('../config/database');
        const { nim } = req.params;

        const userRole = req.user.role;
        const userNim = req.user.nim;

        if (userRole === 'mahasiswa' && userNim !== nim) {
            return res.status(403).json({
                status: 'Error',
                message: 'Akses ditolak. Anda hanya bisa melihat data sendiri.'
            });
        }

        const result = await pool.query(`
            SELECT 
                m.id,
                m.npm as nim,
                m.nama_lengkap,
                m.semester,
                m.gpa as ipk,
                m.status,
                m.created_at,
                m.updated_at
            FROM mahasiswa m
            WHERE m.npm = $1
        `, [nim]);

        if (result.rows.length === 0) {
            return res.status(404).json({
                status: 'Error',
                message: 'Mahasiswa tidak ditemukan'
            });
        }

        res.json({
            status: 'Success',
            data: result.rows[0]
        });
    } catch (error) {
        console.error('Error fetching evaluasi by NIM:', error);
        res.status(500).json({
            status: 'Error',
            message: error.message
        });
    }
});

// ============ CREATE EVALUASI ============
router.post('/', authMiddleware, kaprodiOrAdminMiddleware, async(req, res) => {
    try {
        const pool = require('../config/database');
        const { nim, status } = req.body;

        if (!nim) {
            return res.status(400).json({
                status: 'Error',
                message: 'NIM wajib diisi'
            });
        }

        const result = await pool.query(`
            UPDATE mahasiswa 
            SET status = $1,
                updated_at = NOW()
            WHERE npm = $2
            RETURNING *
        `, [status, nim]);

        if (result.rows.length === 0) {
            return res.status(404).json({
                status: 'Error',
                message: 'Mahasiswa tidak ditemukan'
            });
        }

        res.json({
            status: 'Success',
            message: 'Evaluasi berhasil disimpan',
            data: result.rows[0]
        });
    } catch (error) {
        console.error('Error creating evaluasi:', error);
        res.status(500).json({
            status: 'Error',
            message: error.message
        });
    }
});

// ============ UPDATE EVALUASI ============
router.put('/:id', authMiddleware, kaprodiOrAdminMiddleware, async(req, res) => {
    try {
        const pool = require('../config/database');
        const { id } = req.params;
        const { status } = req.body;

        const result = await pool.query(`
            UPDATE mahasiswa 
            SET status = $1,
                updated_at = NOW()
            WHERE id = $2
            RETURNING *
        `, [status, id]);

        if (result.rows.length === 0) {
            return res.status(404).json({
                status: 'Error',
                message: 'Data evaluasi tidak ditemukan'
            });
        }

        res.json({
            status: 'Success',
            message: 'Evaluasi berhasil diupdate',
            data: result.rows[0]
        });
    } catch (error) {
        console.error('Error updating evaluasi:', error);
        res.status(500).json({
            status: 'Error',
            message: error.message
        });
    }
});

// ============ DELETE EVALUASI ============
router.delete('/:id', authMiddleware, async(req, res) => {
    try {
        const pool = require('../config/database');
        const { id } = req.params;

        if (req.user.role !== 'admin') {
            return res.status(403).json({
                status: 'Error',
                message: 'Akses ditolak. Hanya admin.'
            });
        }

        const result = await pool.query(`
            UPDATE mahasiswa 
            SET status = 'aktif',
                updated_at = NOW()
            WHERE id = $1
            RETURNING *
        `, [id]);

        if (result.rows.length === 0) {
            return res.status(404).json({
                status: 'Error',
                message: 'Data evaluasi tidak ditemukan'
            });
        }

        res.json({
            status: 'Success',
            message: 'Evaluasi berhasil dihapus'
        });
    } catch (error) {
        console.error('Error deleting evaluasi:', error);
        res.status(500).json({
            status: 'Error',
            message: error.message
        });
    }
});

// ============ RECALCULATE EVALUASI ============
router.post('/recalculate/:nim', authMiddleware, kaprodiOrAdminMiddleware, async(req, res) => {
    try {
        const pool = require('../config/database');
        const { nim } = req.params;

        const mahasiswaResult = await pool.query(`
            SELECT semester, gpa, status 
            FROM mahasiswa 
            WHERE npm = $1
        `, [nim]);

        if (mahasiswaResult.rows.length === 0) {
            return res.status(404).json({
                status: 'Error',
                message: 'Mahasiswa tidak ditemukan'
            });
        }

        const mhs = mahasiswaResult.rows[0];
        let status = 'aktif';

        if (mhs.semester > 6 && mhs.gpa < 2.5) {
            status = 'berisiko';
        } else if (mhs.semester > 8) {
            status = 'evaluasi';
        }

        await pool.query(`
            UPDATE mahasiswa 
            SET status = $1,
                updated_at = NOW()
            WHERE npm = $2
        `, [status, nim]);

        res.json({
            status: 'Success',
            message: 'Evaluasi berhasil di-recalculate',
            data: { status: status }
        });
    } catch (error) {
        console.error('Error recalculating evaluasi:', error);
        res.status(500).json({
            status: 'Error',
            message: error.message
        });
    }
});

// ============ EVALUASI STUDI (ES-1, ES-2, ES-3) ============

// Evaluasi lengkap untuk satu mahasiswa
router.get('/studi/:nim',
    authMiddleware,
    evaluasiStudiController.evaluasiMahasiswa
);

// Evaluasi semua mahasiswa (admin/kaprodi)
router.get('/studi/all',
    authMiddleware,
    evaluasiStudiController.evaluasiSemuaMahasiswa
);

// Summary evaluasi
router.get('/studi/summary',
    authMiddleware,
    evaluasiStudiController.getSummaryEvaluasi
);

module.exports = router;
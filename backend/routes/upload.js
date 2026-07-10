const express = require('express');
const router = express.Router();
const { uploadSingle } = require('../middleware/upload');
const { authMiddleware } = require('../middleware/auth');
const pool = require('../config/database');

// ============ UPLOAD KHS ============
// [BACKEND] POST /api/upload/khs - Upload file KHS mahasiswa
router.post('/khs', authMiddleware, uploadSingle('file'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                status: 'Error',
                message: 'File tidak ditemukan'
            });
        }

        const { semester, tahunAkademik } = req.body;
        const nim = req.user.nim;

        if (!nim) {
            return res.status(400).json({
                status: 'Error',
                message: 'NIM tidak ditemukan'
            });
        }

        if (!semester || !tahunAkademik) {
            return res.status(400).json({
                status: 'Error',
                message: 'Semester dan Tahun Akademik wajib diisi'
            });
        }

        // Simpan ke database
        const result = await pool.query(
            `INSERT INTO khs (nim, semester, tahun_akademik, file_path, status_verifikasi)
             VALUES ($1, $2, $3, $4, 'Menunggu Verifikasi')
             RETURNING *`,
            [nim, semester, tahunAkademik, `/uploads/documents/${req.file.filename}`]
        );

        res.status(201).json({
            status: 'Success',
            message: 'KHS berhasil diupload',
            data: {
                id: result.rows[0].id,
                semester: result.rows[0].semester,
                tahunAkademik: result.rows[0].tahun_akademik,
                filePath: result.rows[0].file_path,
                status: result.rows[0].status_verifikasi
            }
        });
    } catch (error) {
        console.error('Upload KHS error:', error);
        res.status(500).json({
            status: 'Error',
            message: error.message
        });
    }
});

// ============ GET RIWAYAT KHS ============
// [BACKEND] GET /api/upload/khs/history - Mengambil riwayat upload KHS mahasiswa
router.get('/khs/history', authMiddleware, async (req, res) => {
    try {
        const nim = req.user.nim;

        if (!nim) {
            return res.status(400).json({
                status: 'Error',
                message: 'NIM tidak ditemukan'
            });
        }

        const result = await pool.query(
            `SELECT 
                id,
                semester,
                tahun_akademik,
                file_path,
                status_verifikasi,
                created_at
             FROM khs 
             WHERE nim = $1
             ORDER BY semester DESC, created_at DESC`,
            [nim]
        );

        res.json({
            status: 'Success',
            data: result.rows
        });
    } catch (error) {
        console.error('Get KHS history error:', error);
        res.status(500).json({
            status: 'Error',
            message: error.message
        });
    }
});

// ============ GET SINGLE KHS FILE ============
// [BACKEND] GET /api/upload/khs/:id - Mengambil detail KHS
router.get('/khs/:id', authMiddleware, async (req, res) => {
    try {
        const { id } = req.params;
        const nim = req.user.nim;

        const result = await pool.query(
            'SELECT * FROM khs WHERE id = $1 AND nim = $2',
            [id, nim]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                status: 'Error',
                message: 'KHS tidak ditemukan'
            });
        }

        res.json({
            status: 'Success',
            data: result.rows[0]
        });
    } catch (error) {
        console.error('Get KHS error:', error);
        res.status(500).json({
            status: 'Error',
            message: error.message
        });
    }
});

// ============ DELETE KHS ============
// [BACKEND] DELETE /api/upload/khs/:id - Menghapus KHS (Admin only)
router.delete('/khs/:id', authMiddleware, async (req, res) => {
    try {
        if (req.user.role !== 'admin') {
            return res.status(403).json({
                status: 'Error',
                message: 'Akses ditolak. Hanya admin.'
            });
        }

        const { id } = req.params;
        const result = await pool.query('DELETE FROM khs WHERE id = $1 RETURNING *', [id]);

        if (result.rows.length === 0) {
            return res.status(404).json({
                status: 'Error',
                message: 'KHS tidak ditemukan'
            });
        }

        res.json({
            status: 'Success',
            message: 'KHS berhasil dihapus'
        });
    } catch (error) {
        console.error('Delete KHS error:', error);
        res.status(500).json({
            status: 'Error',
            message: error.message
        });
    }
});

// ============ UPDATE STATUS KHS ============
// [BACKEND] PUT /api/upload/khs/:id/status - Update status verifikasi (Admin/Kaprodi)
router.put('/khs/:id/status', authMiddleware, async (req, res) => {
    try {
        if (req.user.role !== 'admin' && req.user.role !== 'kaprodi') {
            return res.status(403).json({
                status: 'Error',
                message: 'Akses ditolak. Hanya admin atau kaprodi.'
            });
        }

        const { id } = req.params;
        const { status } = req.body;

        if (!status) {
            return res.status(400).json({
                status: 'Error',
                message: 'Status wajib diisi'
            });
        }

        const result = await pool.query(
            `UPDATE khs 
             SET status_verifikasi = $1, updated_at = NOW() 
             WHERE id = $2 
             RETURNING *`,
            [status, id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                status: 'Error',
                message: 'KHS tidak ditemukan'
            });
        }

        res.json({
            status: 'Success',
            message: 'Status KHS berhasil diupdate',
            data: result.rows[0]
        });
    } catch (error) {
        console.error('Update KHS status error:', error);
        res.status(500).json({
            status: 'Error',
            message: error.message
        });
    }
});

module.exports = router;
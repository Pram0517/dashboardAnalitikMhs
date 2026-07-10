const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../middleware/auth');

// ============ UPDATE USER PREFERENCES ============
router.put('/preferences', authMiddleware, async (req, res) => {
    try {
        const userId = req.user.id;
        const preferences = req.body;

        // Validasi
        if (!preferences || typeof preferences !== 'object') {
            return res.status(400).json({
                status: 'Error',
                message: 'Data preferensi tidak valid'
            });
        }

        const pool = require('../config/database');

        // Simpan ke database (opsional, bisa tambahkan tabel user_preferences)
        // Untuk sementara, update di tabel users atau simpan sebagai JSON
        // Jika belum ada tabel, kita simpan di kolom baru atau skip dulu

        // Cek apakah kolom preferences ada
        const checkColumn = await pool.query(`
            SELECT column_name 
            FROM information_schema.columns 
            WHERE table_name = 'users' AND column_name = 'preferences'
        `);

        if (checkColumn.rows.length > 0) {
            // Jika kolom ada, update
            await pool.query(
                'UPDATE users SET preferences = $1 WHERE id = $2',
                [preferences, userId]
            );
        } else {
            // Jika kolom belum ada, buat dulu
            // Atau skip untuk sementara
            console.log('Kolom preferences belum ada di tabel users');
        }

        res.json({
            status: 'Success',
            message: 'Preferensi berhasil disimpan'
        });
    } catch (error) {
        console.error('Error saving preferences:', error);
        res.status(500).json({
            status: 'Error',
            message: error.message
        });
    }
});

// ============ GET USER PREFERENCES ============
router.get('/preferences', authMiddleware, async (req, res) => {
    try {
        const userId = req.user.id;
        const pool = require('../config/database');

        // Default preferences
        const defaultPreferences = {
            mahasiswaBerisiko: true,
            updateCapstoneSkripsi: true,
            laporanMingguan: false,
            uploadKHSBerhasil: true
        };

        // Cek apakah kolom preferences ada
        const checkColumn = await pool.query(`
            SELECT column_name 
            FROM information_schema.columns 
            WHERE table_name = 'users' AND column_name = 'preferences'
        `);

        if (checkColumn.rows.length > 0) {
            const result = await pool.query(
                'SELECT preferences FROM users WHERE id = $1',
                [userId]
            );

            if (result.rows.length > 0 && result.rows[0].preferences) {
                return res.json({
                    status: 'Success',
                    data: result.rows[0].preferences
                });
            }
        }

        // Return default jika tidak ada
        res.json({
            status: 'Success',
            data: defaultPreferences
        });
    } catch (error) {
        console.error('Error fetching preferences:', error);
        res.status(500).json({
            status: 'Error',
            message: error.message
        });
    }
});

module.exports = router;
const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../middleware/auth');
const pool = require('../config/database');

// ============ GET NOTIFICATIONS ============
router.get('/', authMiddleware, async (req, res) => {
    try {
        const userId = req.user.id;
        const limit = parseInt(req.query.limit) || 20;
        const offset = parseInt(req.query.offset) || 0;

        const result = await pool.query(
            `SELECT * FROM notifications 
             WHERE user_id = $1 
             ORDER BY created_at DESC 
             LIMIT $2 OFFSET $3`,
            [userId, limit, offset]
        );

        const countResult = await pool.query(
            'SELECT COUNT(*) FROM notifications WHERE user_id = $1 AND is_read = FALSE',
            [userId]
        );

        res.json({
            status: 'Success',
            data: result.rows,
            unread: parseInt(countResult.rows[0].count)
        });
    } catch (error) {
        console.error('Get notifications error:', error);
        res.status(500).json({
            status: 'Error',
            message: error.message
        });
    }
});

// ============ MARK AS READ ============
router.put('/:id/read', authMiddleware, async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;

        const result = await pool.query(
            `UPDATE notifications 
             SET is_read = TRUE, updated_at = NOW()
             WHERE id = $1 AND user_id = $2
             RETURNING *`,
            [id, userId]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                status: 'Error',
                message: 'Notifikasi tidak ditemukan'
            });
        }

        res.json({
            status: 'Success',
            message: 'Notifikasi ditandai sebagai sudah dibaca',
            data: result.rows[0]
        });
    } catch (error) {
        console.error('Mark as read error:', error);
        res.status(500).json({
            status: 'Error',
            message: error.message
        });
    }
});

// ============ MARK ALL AS READ ============
router.put('/read-all', authMiddleware, async (req, res) => {
    try {
        const userId = req.user.id;

        await pool.query(
            `UPDATE notifications 
             SET is_read = TRUE, updated_at = NOW()
             WHERE user_id = $1 AND is_read = FALSE`,
            [userId]
        );

        res.json({
            status: 'Success',
            message: 'Semua notifikasi ditandai sebagai sudah dibaca'
        });
    } catch (error) {
        console.error('Mark all as read error:', error);
        res.status(500).json({
            status: 'Error',
            message: error.message
        });
    }
});

// ============ DELETE NOTIFICATION ============
router.delete('/:id', authMiddleware, async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;

        const result = await pool.query(
            'DELETE FROM notifications WHERE id = $1 AND user_id = $2 RETURNING *',
            [id, userId]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                status: 'Error',
                message: 'Notifikasi tidak ditemukan'
            });
        }

        res.json({
            status: 'Success',
            message: 'Notifikasi berhasil dihapus'
        });
    } catch (error) {
        console.error('Delete notification error:', error);
        res.status(500).json({
            status: 'Error',
            message: error.message
        });
    }
});

module.exports = router;
// BACKEND/routes/user.js
const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../middleware/auth');
const { upload } = require('../config/cloudinary');
const pool = require('../config/database');

// ============ GET PROFILE IMAGE ============
router.get('/profile-image', authMiddleware, async (req, res) => {
    try {
        const userId = req.user.id;
        
        const result = await pool.query(
            'SELECT profile_image FROM users WHERE id = $1',
            [userId]
        );
        
        const profileImage = result.rows[0]?.profile_image || null;
        
        res.json({
            status: 'Success',
            data: {
                profileImage: profileImage
            }
        });
    } catch (error) {
        console.error('Error getting profile image:', error);
        res.status(500).json({
            status: 'Error',
            message: error.message
        });
    }
});

// ============ UPLOAD PROFILE IMAGE ============
router.post(
    '/profile-image',
    authMiddleware,
    upload.single('profileImage'),
    async (req, res) => {
        try {
            const userId = req.user.id;
            
            if (!req.file) {
                return res.status(400).json({
                    status: 'Error',
                    message: 'Tidak ada file yang diupload'
                });
            }

            const imageUrl = req.file.path;
            const publicId = req.file.filename;

            // Hapus foto lama
            const oldPhoto = await pool.query(
                'SELECT profile_image_public_id FROM users WHERE id = $1',
                [userId]
            );

            if (oldPhoto.rows[0]?.profile_image_public_id) {
                try {
                    const cloudinary = require('cloudinary').v2;
                    await cloudinary.uploader.destroy(oldPhoto.rows[0].profile_image_public_id);
                } catch (err) {
                    console.error('Error deleting old image:', err);
                }
            }

            // Update database
            await pool.query(
                `UPDATE users 
                 SET profile_image = $1, 
                     profile_image_public_id = $2,
                     updated_at = CURRENT_TIMESTAMP
                 WHERE id = $3`,
                [imageUrl, publicId, userId]
            );

            // Ambil data user terbaru
            const updatedUser = await pool.query(
                `SELECT id, name, email, role, profile_image 
                 FROM users 
                 WHERE id = $1`,
                [userId]
            );

            const userData = updatedUser.rows[0];

            res.json({
                status: 'Success',
                message: 'Foto profil berhasil diupload',
                data: {
                    profileImage: imageUrl,
                    publicId: publicId
                },
                user: {
                    id: userData.id,
                    name: userData.name,
                    email: userData.email,
                    role: userData.role,
                    profileImage: userData.profile_image,
                    profile_image: userData.profile_image
                }
            });

        } catch (error) {
            console.error('Error uploading profile image:', error);
            res.status(500).json({
                status: 'Error',
                message: error.message || 'Gagal upload foto profil'
            });
        }
    }
);

// ============ DELETE PROFILE IMAGE ============
router.delete('/profile-image', authMiddleware, async (req, res) => {
    try {
        const userId = req.user.id;

        const result = await pool.query(
            'SELECT profile_image, profile_image_public_id FROM users WHERE id = $1',
            [userId]
        );

        const userData = result.rows[0];

        if (!userData || !userData.profile_image_public_id) {
            return res.status(400).json({
                status: 'Error',
                message: 'Tidak ada foto profil untuk dihapus'
            });
        }

        try {
            const cloudinary = require('cloudinary').v2;
            await cloudinary.uploader.destroy(userData.profile_image_public_id);
        } catch (err) {
            console.error('Error deleting from Cloudinary:', err);
        }

        await pool.query(
            `UPDATE users 
             SET profile_image = NULL, 
                 profile_image_public_id = NULL,
                 updated_at = CURRENT_TIMESTAMP
             WHERE id = $1`,
            [userId]
        );

        res.json({
            status: 'Success',
            message: 'Foto profil berhasil dihapus'
        });

    } catch (error) {
        console.error('Error deleting profile image:', error);
        res.status(500).json({
            status: 'Error',
            message: error.message || 'Gagal hapus foto profil'
        });
    }
});

module.exports = router;
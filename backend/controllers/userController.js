// BACKEND/controllers/userController.js
const userService = require('../services/userService');
const { formatResponse, formatPaginationResponse } = require('../utils/formatters');
const { HTTP_STATUS } = require('../utils/constants');
const { cloudinary } = require('../config/cloudinary');
const pool = require('../config/database');

// ============ GET ALL USERS ============
const getAll = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const offset = (page - 1) * limit;

        const result = await userService.getAllUsers(limit, offset);

        res.status(HTTP_STATUS.OK).json(
            formatPaginationResponse(
                'Success',
                'Data users berhasil diambil',
                result.data,
                page,
                limit,
                result.total
            )
        );
    } catch (error) {
        res.status(HTTP_STATUS.INTERNAL_ERROR).json(
            formatResponse('Error', error.message)
        );
    }
};

// ============ GET USER BY ID ============
const getById = async (req, res) => {
    try {
        const { id } = req.params;
        const user = await userService.getUserById(id);

        res.status(HTTP_STATUS.OK).json(
            formatResponse('Success', 'Data user berhasil diambil', user)
        );
    } catch (error) {
        res.status(HTTP_STATUS.NOT_FOUND).json(
            formatResponse('Error', error.message)
        );
    }
};

// ============ UPDATE USER ============
const update = async (req, res) => {
    try {
        const { id } = req.params;
        const user = await userService.updateUser(id, req.body);

        res.status(HTTP_STATUS.OK).json(
            formatResponse('Success', 'Data user berhasil diupdate', user)
        );
    } catch (error) {
        res.status(HTTP_STATUS.INTERNAL_ERROR).json(
            formatResponse('Error', error.message)
        );
    }
};

// ============ DELETE USER ============
const deleteUser = async (req, res) => {
    try {
        const { id } = req.params;
        await userService.deleteUser(id);

        res.status(HTTP_STATUS.OK).json(
            formatResponse('Success', 'Data user berhasil dihapus')
        );
    } catch (error) {
        res.status(HTTP_STATUS.NOT_FOUND).json(
            formatResponse('Error', error.message)
        );
    }
};

// ============ UPDATE ROLE ============
const updateRole = async (req, res) => {
    try {
        const { id } = req.params;
        const { role } = req.body;

        if (!role) {
            return res.status(HTTP_STATUS.BAD_REQUEST).json(
                formatResponse('Error', 'Role wajib diisi')
            );
        }

        const user = await userService.updateUserRole(id, role);

        res.status(HTTP_STATUS.OK).json(
            formatResponse('Success', 'Role user berhasil diupdate', user)
        );
    } catch (error) {
        res.status(HTTP_STATUS.INTERNAL_ERROR).json(
            formatResponse('Error', error.message)
        );
    }
};

// ============ UPDATE STATUS ============
const updateStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { isActive } = req.body;

        const user = await userService.updateUserStatus(id, isActive);

        res.status(HTTP_STATUS.OK).json(
            formatResponse('Success', 'Status user berhasil diupdate', user)
        );
    } catch (error) {
        res.status(HTTP_STATUS.INTERNAL_ERROR).json(
            formatResponse('Error', error.message)
        );
    }
};

// ============ UPLOAD PROFILE IMAGE ============
const uploadProfileImage = async (req, res) => {
    try {
        const userId = req.user.id;
        
        if (!req.file) {
            return res.status(HTTP_STATUS.BAD_REQUEST).json(
                formatResponse('Error', 'Tidak ada file yang diupload')
            );
        }

        // URL file dari Cloudinary
        const imageUrl = req.file.path;
        const publicId = req.file.filename;

        // Dapatkan foto lama dari database
        const oldPhoto = await pool.query(
            'SELECT profile_image, profile_image_public_id FROM users WHERE id = $1',
            [userId]
        );

        // Hapus foto lama dari Cloudinary jika ada
        if (oldPhoto.rows[0]?.profile_image_public_id) {
            try {
                await cloudinary.uploader.destroy(oldPhoto.rows[0].profile_image_public_id);
                console.log('✅ Old image deleted:', oldPhoto.rows[0].profile_image_public_id);
            } catch (err) {
                console.error('Error deleting old image:', err);
                // Lanjutkan meskipun gagal hapus
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

        // Ambil data user yang sudah diupdate
        const updatedUser = await pool.query(
            'SELECT id, name, email, role, profile_image FROM users WHERE id = $1',
            [userId]
        );

        res.json({
            status: 'Success',
            message: 'Foto profil berhasil diupload',
            data: {
                profileImage: imageUrl,
                publicId: publicId
            },
            user: updatedUser.rows[0]
        });

    } catch (error) {
        console.error('Error uploading profile image:', error);
        res.status(HTTP_STATUS.INTERNAL_ERROR).json(
            formatResponse('Error', error.message || 'Gagal upload foto profil')
        );
    }
};

// ============ DELETE PROFILE IMAGE ============
const deleteProfileImage = async (req, res) => {
    try {
        const userId = req.user.id;

        // Dapatkan foto dari database
        const result = await pool.query(
            'SELECT profile_image, profile_image_public_id FROM users WHERE id = $1',
            [userId]
        );

        const userData = result.rows[0];

        if (!userData || !userData.profile_image_public_id) {
            return res.status(HTTP_STATUS.BAD_REQUEST).json(
                formatResponse('Error', 'Tidak ada foto profil untuk dihapus')
            );
        }

        // Hapus dari Cloudinary
        try {
            await cloudinary.uploader.destroy(userData.profile_image_public_id);
            console.log('✅ Image deleted:', userData.profile_image_public_id);
        } catch (err) {
            console.error('Error deleting from Cloudinary:', err);
        }

        // Update database
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
        res.status(HTTP_STATUS.INTERNAL_ERROR).json(
            formatResponse('Error', error.message || 'Gagal hapus foto profil')
        );
    }
};

// ============ GET USER PREFERENCES ============
const getPreferences = async (req, res) => {
    try {
        const userId = req.user.id;

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
        res.status(HTTP_STATUS.INTERNAL_ERROR).json(
            formatResponse('Error', error.message)
        );
    }
};

// ============ UPDATE USER PREFERENCES ============
const updatePreferences = async (req, res) => {
    try {
        const userId = req.user.id;
        const preferences = req.body;

        // Validasi
        if (!preferences || typeof preferences !== 'object') {
            return res.status(HTTP_STATUS.BAD_REQUEST).json(
                formatResponse('Error', 'Data preferensi tidak valid')
            );
        }

        // Cek apakah kolom preferences ada
        const checkColumn = await pool.query(`
            SELECT column_name 
            FROM information_schema.columns 
            WHERE table_name = 'users' AND column_name = 'preferences'
        `);

        if (checkColumn.rows.length > 0) {
            await pool.query(
                'UPDATE users SET preferences = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
                [preferences, userId]
            );
        } else {
            // Jika kolom belum ada, buat dulu
            await pool.query(`
                ALTER TABLE users 
                ADD COLUMN IF NOT EXISTS preferences JSONB DEFAULT '{
                    "mahasiswaBerisiko": true,
                    "updateCapstoneSkripsi": true,
                    "laporanMingguan": false,
                    "uploadKHSBerhasil": true
                }'
            `);
            
            await pool.query(
                'UPDATE users SET preferences = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
                [preferences, userId]
            );
        }

        res.json({
            status: 'Success',
            message: 'Preferensi berhasil disimpan',
            data: preferences
        });
    } catch (error) {
        console.error('Error saving preferences:', error);
        res.status(HTTP_STATUS.INTERNAL_ERROR).json(
            formatResponse('Error', error.message)
        );
    }
};

module.exports = {
    getAll,
    getById,
    update,
    delete: deleteUser,
    updateRole,
    updateStatus,
    uploadProfileImage,
    deleteProfileImage,
    getPreferences,
    updatePreferences
};
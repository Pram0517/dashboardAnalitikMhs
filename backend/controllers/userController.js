// BACKEND/controllers/userController.js
const pool = require('../config/database');
const { formatResponse, formatPaginationResponse } = require('../utils/formatters');
const { HTTP_STATUS } = require('../utils/constants');
const { cloudinary } = require('../config/cloudinary');

// ============ GET ALL USERS ============
const getAll = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const offset = (page - 1) * limit;

        // Get total count
        const countResult = await pool.query('SELECT COUNT(*) FROM users');
        const total = parseInt(countResult.rows[0].count);

        // Get users
        const result = await pool.query(
            `SELECT id, name, email, role, nim, profile_image, is_active, created_at, updated_at
             FROM users 
             ORDER BY created_at DESC 
             LIMIT $1 OFFSET $2`,
            [limit, offset]
        );

        res.status(HTTP_STATUS.OK).json(
            formatPaginationResponse(
                'Success',
                'Data users berhasil diambil',
                result.rows,
                page,
                limit,
                total
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
        
        const result = await pool.query(
            `SELECT id, name, email, role, nim, profile_image, is_active, created_at, updated_at
             FROM users 
             WHERE id = $1`,
            [id]
        );

        if (result.rows.length === 0) {
            return res.status(HTTP_STATUS.NOT_FOUND).json(
                formatResponse('Error', 'User tidak ditemukan')
            );
        }

        res.status(HTTP_STATUS.OK).json(
            formatResponse('Success', 'Data user berhasil diambil', result.rows[0])
        );
    } catch (error) {
        res.status(HTTP_STATUS.INTERNAL_ERROR).json(
            formatResponse('Error', error.message)
        );
    }
};

// ============ UPDATE USER ============
const update = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, email, role, is_active } = req.body;

        // Cek apakah user ada
        const checkUser = await pool.query('SELECT id FROM users WHERE id = $1', [id]);
        if (checkUser.rows.length === 0) {
            return res.status(HTTP_STATUS.NOT_FOUND).json(
                formatResponse('Error', 'User tidak ditemukan')
            );
        }

        // Build update query
        let updateFields = [];
        let values = [];
        let paramCount = 1;

        if (name !== undefined) {
            updateFields.push(`name = $${paramCount}`);
            values.push(name);
            paramCount++;
        }
        if (email !== undefined) {
            updateFields.push(`email = $${paramCount}`);
            values.push(email);
            paramCount++;
        }
        if (role !== undefined) {
            updateFields.push(`role = $${paramCount}`);
            values.push(role);
            paramCount++;
        }
        if (is_active !== undefined) {
            updateFields.push(`is_active = $${paramCount}`);
            values.push(is_active);
            paramCount++;
        }

        if (updateFields.length === 0) {
            return res.status(HTTP_STATUS.BAD_REQUEST).json(
                formatResponse('Error', 'Tidak ada data yang diupdate')
            );
        }

        updateFields.push(`updated_at = CURRENT_TIMESTAMP`);
        values.push(id);

        const query = `
            UPDATE users 
            SET ${updateFields.join(', ')}
            WHERE id = $${paramCount}
            RETURNING id, name, email, role, nim, profile_image, is_active, created_at, updated_at
        `;

        const result = await pool.query(query, values);

        res.status(HTTP_STATUS.OK).json(
            formatResponse('Success', 'Data user berhasil diupdate', result.rows[0])
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

        const result = await pool.query(
            'DELETE FROM users WHERE id = $1 RETURNING id',
            [id]
        );

        if (result.rows.length === 0) {
            return res.status(HTTP_STATUS.NOT_FOUND).json(
                formatResponse('Error', 'User tidak ditemukan')
            );
        }

        res.status(HTTP_STATUS.OK).json(
            formatResponse('Success', 'Data user berhasil dihapus')
        );
    } catch (error) {
        res.status(HTTP_STATUS.INTERNAL_ERROR).json(
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

        // Validasi role
        const validRoles = ['admin', 'kaprodi', 'dosen', 'mahasiswa'];
        if (!validRoles.includes(role)) {
            return res.status(HTTP_STATUS.BAD_REQUEST).json(
                formatResponse('Error', 'Role tidak valid')
            );
        }

        const result = await pool.query(
            `UPDATE users 
             SET role = $1, updated_at = CURRENT_TIMESTAMP
             WHERE id = $2
             RETURNING id, name, email, role, nim, profile_image, is_active`,
            [role, id]
        );

        if (result.rows.length === 0) {
            return res.status(HTTP_STATUS.NOT_FOUND).json(
                formatResponse('Error', 'User tidak ditemukan')
            );
        }

        res.status(HTTP_STATUS.OK).json(
            formatResponse('Success', 'Role user berhasil diupdate', result.rows[0])
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

        const result = await pool.query(
            `UPDATE users 
             SET is_active = $1, updated_at = CURRENT_TIMESTAMP
             WHERE id = $2
             RETURNING id, name, email, role, nim, profile_image, is_active`,
            [isActive, id]
        );

        if (result.rows.length === 0) {
            return res.status(HTTP_STATUS.NOT_FOUND).json(
                formatResponse('Error', 'User tidak ditemukan')
            );
        }

        res.status(HTTP_STATUS.OK).json(
            formatResponse('Success', 'Status user berhasil diupdate', result.rows[0])
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

        const imageUrl = req.file.path;
        const publicId = req.file.filename;

        // Dapatkan foto lama
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
            // Buat kolom jika belum ada
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
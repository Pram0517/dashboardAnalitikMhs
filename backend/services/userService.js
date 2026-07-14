// BACKEND/services/userService.js
const pool = require('../config/database');
const bcrypt = require('bcryptjs');

// ============ GET ALL USERS ============
const getAllUsers = async (limit, offset) => {
    try {
        const countResult = await pool.query('SELECT COUNT(*) FROM users');
        const total = parseInt(countResult.rows[0].count);

        const result = await pool.query(
            `SELECT id, name, email, role, nim, profile_image, is_active, created_at, updated_at
             FROM users 
             ORDER BY created_at DESC 
             LIMIT $1 OFFSET $2`,
            [limit, offset]
        );

        return {
            data: result.rows,
            total: total
        };
    } catch (error) {
        throw new Error(`Error getting users: ${error.message}`);
    }
};

// ============ GET USER BY ID ============
const getUserById = async (id) => {
    try {
        const result = await pool.query(
            `SELECT id, name, email, role, nim, profile_image, is_active, created_at, updated_at
             FROM users 
             WHERE id = $1`,
            [id]
        );

        if (result.rows.length === 0) {
            throw new Error('User tidak ditemukan');
        }

        return result.rows[0];
    } catch (error) {
        throw new Error(`Error getting user: ${error.message}`);
    }
};

// ============ UPDATE USER ============
const updateUser = async (id, data) => {
    try {
        const { name, email, role, is_active } = data;
        
        // Cek apakah user ada
        const checkUser = await pool.query('SELECT id FROM users WHERE id = $1', [id]);
        if (checkUser.rows.length === 0) {
            throw new Error('User tidak ditemukan');
        }

        // Build update query dinamis
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
            throw new Error('Tidak ada data yang diupdate');
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

        return result.rows[0];
    } catch (error) {
        throw new Error(`Error updating user: ${error.message}`);
    }
};

// ============ DELETE USER ============
const deleteUser = async (id) => {
    try {
        const result = await pool.query(
            'DELETE FROM users WHERE id = $1 RETURNING id',
            [id]
        );

        if (result.rows.length === 0) {
            throw new Error('User tidak ditemukan');
        }

        return result.rows[0];
    } catch (error) {
        throw new Error(`Error deleting user: ${error.message}`);
    }
};

// ============ UPDATE USER ROLE ============
const updateUserRole = async (id, role) => {
    try {
        // Validasi role
        const validRoles = ['admin', 'kaprodi', 'dosen', 'mahasiswa'];
        if (!validRoles.includes(role)) {
            throw new Error('Role tidak valid');
        }

        const result = await pool.query(
            `UPDATE users 
             SET role = $1, updated_at = CURRENT_TIMESTAMP
             WHERE id = $2
             RETURNING id, name, email, role, nim, profile_image, is_active`,
            [role, id]
        );

        if (result.rows.length === 0) {
            throw new Error('User tidak ditemukan');
        }

        return result.rows[0];
    } catch (error) {
        throw new Error(`Error updating user role: ${error.message}`);
    }
};

// ============ UPDATE USER STATUS ============
const updateUserStatus = async (id, isActive) => {
    try {
        const result = await pool.query(
            `UPDATE users 
             SET is_active = $1, updated_at = CURRENT_TIMESTAMP
             WHERE id = $2
             RETURNING id, name, email, role, nim, profile_image, is_active`,
            [isActive, id]
        );

        if (result.rows.length === 0) {
            throw new Error('User tidak ditemukan');
        }

        return result.rows[0];
    } catch (error) {
        throw new Error(`Error updating user status: ${error.message}`);
    }
};

module.exports = {
    getAllUsers,
    getUserById,
    updateUser,
    deleteUser,
    updateUserRole,
    updateUserStatus
};
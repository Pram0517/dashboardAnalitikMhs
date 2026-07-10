const pool = require('../config/database');

class User {
    // Find user by email
    static async findByEmail(email) {
        const result = await pool.query(
            'SELECT * FROM users WHERE email = $1',
            [email]
        );
        return result.rows[0];
    }

    // Find user by id
    static async findById(id) {
        const result = await pool.query(
            'SELECT id, name, email, role, nim, is_active, created_at, updated_at FROM users WHERE id = $1',
            [id]
        );
        return result.rows[0];
    }

    // Find user by nim
    static async findByNim(nim) {
        const result = await pool.query(
            'SELECT * FROM users WHERE nim = $1',
            [nim]
        );
        return result.rows[0];
    }

    // Create new user
    static async create(data) {
        const { name, email, password, role, nim } = data;
        const result = await pool.query(
            `INSERT INTO users (name, email, password, role, nim)
             VALUES ($1, $2, $3, $4, $5)
             RETURNING id, name, email, role, nim, created_at`,
            [name, email, password, role, nim || null]
        );
        return result.rows[0];
    }

    // Update user
    static async update(id, data) {
        const { name, email, role, nim, isActive } = data;
        const result = await pool.query(
            `UPDATE users 
             SET name = COALESCE($1, name),
                 email = COALESCE($2, email),
                 role = COALESCE($3, role),
                 nim = COALESCE($4, nim),
                 is_active = COALESCE($5, is_active),
                 updated_at = NOW()
             WHERE id = $6
             RETURNING id, name, email, role, nim, is_active, updated_at`,
            [name, email, role, nim, isActive, id]
        );
        return result.rows[0];
    }

    // Delete user
    static async delete(id) {
        const result = await pool.query(
            'DELETE FROM users WHERE id = $1 RETURNING id',
            [id]
        );
        return result.rows[0];
    }

    // Get all users with pagination
    static async findAll(limit = 10, offset = 0) {
        const result = await pool.query(
            `SELECT id, name, email, role, nim, is_active, created_at, updated_at
             FROM users
             ORDER BY created_at DESC
             LIMIT $1 OFFSET $2`,
            [limit, offset]
        );
        return result.rows;
    }

    // Count total users
    static async count() {
        const result = await pool.query('SELECT COUNT(*) FROM users');
        return parseInt(result.rows[0].count);
    }
}

module.exports = User;
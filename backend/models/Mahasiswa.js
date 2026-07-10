const pool = require('../config/database');

class Mahasiswa {
    // Find mahasiswa by npm
    static async findByNpm(npm) {
        const result = await pool.query(
            `SELECT m.*, u.name, u.email 
             FROM mahasiswa m
             JOIN users u ON m.user_id = u.id
             WHERE m.npm = $1`,
            [npm]
        );
        return result.rows[0];
    }

    // Find mahasiswa by id
    static async findById(id) {
        const result = await pool.query(
            `SELECT m.*, u.name, u.email 
             FROM mahasiswa m
             JOIN users u ON m.user_id = u.id
             WHERE m.id = $1`,
            [id]
        );
        return result.rows[0];
    }

    // Find mahasiswa by user_id
    static async findByUserId(userId) {
        const result = await pool.query(
            `SELECT * FROM mahasiswa WHERE user_id = $1`,
            [userId]
        );
        return result.rows[0];
    }

    // Create mahasiswa
    static async create(data) {
        const {
            user_id, npm, nama_lengkap, email, no_hp, alamat,
            tanggal_lahir, jenis_kelamin, semester, status
        } = data;
        const result = await pool.query(
            `INSERT INTO mahasiswa (user_id, npm, nama_lengkap, email, no_hp, alamat,
             tanggal_lahir, jenis_kelamin, semester, status)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
             RETURNING *`,
            [user_id, npm, nama_lengkap, email, no_hp, alamat,
             tanggal_lahir, jenis_kelamin, semester || 1, status || 'aktif']
        );
        return result.rows[0];
    }

    // Update mahasiswa
    static async update(id, data) {
        const fields = Object.keys(data);
        const values = Object.values(data);
        
        if (fields.length === 0) {
            throw new Error('Tidak ada data untuk diupdate');
        }

        const setClause = fields.map((field, index) => `${field} = $${index + 1}`).join(', ');
        const query = `UPDATE mahasiswa SET ${setClause}, updated_at = NOW() WHERE id = $${fields.length + 1} RETURNING *`;

        const result = await pool.query(query, [...values, id]);
        return result.rows[0];
    }

    // Delete mahasiswa
    static async delete(id) {
        const result = await pool.query(
            'DELETE FROM mahasiswa WHERE id = $1 RETURNING id',
            [id]
        );
        return result.rows[0];
    }

    // Get all mahasiswa with pagination
    static async findAll(limit = 10, offset = 0) {
        const result = await pool.query(
            `SELECT m.*, u.name, u.email 
             FROM mahasiswa m
             JOIN users u ON m.user_id = u.id
             ORDER BY m.created_at DESC
             LIMIT $1 OFFSET $2`,
            [limit, offset]
        );
        return result.rows;
    }

    // Count total mahasiswa
    static async count() {
        const result = await pool.query('SELECT COUNT(*) FROM mahasiswa');
        return parseInt(result.rows[0].count);
    }
}

module.exports = Mahasiswa;
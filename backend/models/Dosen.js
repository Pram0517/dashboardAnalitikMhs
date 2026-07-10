const pool = require('../config/database');

class Dosen {
    static async findByNip(nip) {
        const result = await pool.query(
            `SELECT d.*, u.name, u.email 
             FROM dosen d
             JOIN users u ON d.user_id = u.id
             WHERE d.nip = $1`,
            [nip]
        );
        return result.rows[0];
    }

    static async findById(id) {
        const result = await pool.query(
            `SELECT d.*, u.name, u.email 
             FROM dosen d
             JOIN users u ON d.user_id = u.id
             WHERE d.id = $1`,
            [id]
        );
        return result.rows[0];
    }

    static async create(data) {
        const { user_id, nip, nama_lengkap, email, no_hp, bidang_keahlian, gelar, kuota } = data;
        const result = await pool.query(
            `INSERT INTO dosen (user_id, nip, nama_lengkap, email, no_hp, bidang_keahlian, gelar, kuota)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
             RETURNING *`,
            [user_id || null, nip, nama_lengkap, email, no_hp, bidang_keahlian, gelar, kuota || 10]
        );
        return result.rows[0];
    }

    static async update(id, data) {
        const fields = Object.keys(data);
        const values = Object.values(data);
        
        if (fields.length === 0) {
            throw new Error('Tidak ada data untuk diupdate');
        }

        const setClause = fields.map((field, index) => `${field} = $${index + 1}`).join(', ');
        const query = `UPDATE dosen SET ${setClause}, updated_at = NOW() WHERE id = $${fields.length + 1} RETURNING *`;

        const result = await pool.query(query, [...values, id]);
        return result.rows[0];
    }

    static async delete(id) {
        const result = await pool.query(
            'DELETE FROM dosen WHERE id = $1 RETURNING id',
            [id]
        );
        return result.rows[0];
    }

    static async findAll(limit = 10, offset = 0) {
        const result = await pool.query(
            `SELECT d.*, u.name, u.email 
             FROM dosen d
             JOIN users u ON d.user_id = u.id
             ORDER BY d.created_at DESC
             LIMIT $1 OFFSET $2`,
            [limit, offset]
        );
        return result.rows;
    }

    static async count() {
        const result = await pool.query('SELECT COUNT(*) FROM dosen');
        return parseInt(result.rows[0].count);
    }
}

module.exports = Dosen;
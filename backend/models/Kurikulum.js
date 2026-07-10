const pool = require('../config/database');

class Kurikulum {
    static async findById(id) {
        const result = await pool.query(
            'SELECT * FROM kurikulum WHERE id = $1',
            [id]
        );
        return result.rows[0];
    }

    static async create(data) {
        const { nama_kurikulum, tahun_berlaku, deskripsi, is_active } = data;
        const result = await pool.query(
            `INSERT INTO kurikulum (nama_kurikulum, tahun_berlaku, deskripsi, is_active)
             VALUES ($1, $2, $3, $4)
             RETURNING *`,
            [nama_kurikulum, tahun_berlaku, deskripsi, is_active !== undefined ? is_active : true]
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
        const query = `UPDATE kurikulum SET ${setClause}, updated_at = NOW() WHERE id = $${fields.length + 1} RETURNING *`;

        const result = await pool.query(query, [...values, id]);
        return result.rows[0];
    }

    static async delete(id) {
        const result = await pool.query(
            'DELETE FROM kurikulum WHERE id = $1 RETURNING id',
            [id]
        );
        return result.rows[0];
    }

    static async findAll(limit = 10, offset = 0) {
        const result = await pool.query(
            'SELECT * FROM kurikulum ORDER BY created_at DESC LIMIT $1 OFFSET $2',
            [limit, offset]
        );
        return result.rows;
    }

    static async count() {
        const result = await pool.query('SELECT COUNT(*) FROM kurikulum');
        return parseInt(result.rows[0].count);
    }

    static async findActive() {
        const result = await pool.query(
            'SELECT * FROM kurikulum WHERE is_active = true ORDER BY tahun_berlaku DESC LIMIT 1'
        );
        return result.rows[0];
    }
}

module.exports = Kurikulum;
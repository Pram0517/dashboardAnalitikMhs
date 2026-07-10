const pool = require('../config/database');

class Skripsi {
    static async findById(id) {
        const result = await pool.query(
            `SELECT s.*, 
                    m.nama_lengkap as mahasiswa_nama,
                    d1.nama_lengkap as pembimbing_1_nama,
                    d2.nama_lengkap as pembimbing_2_nama
             FROM skripsi s
             JOIN mahasiswa m ON s.mahasiswa_id = m.id
             LEFT JOIN dosen d1 ON s.pembimbing_1_id = d1.id
             LEFT JOIN dosen d2 ON s.pembimbing_2_id = d2.id
             WHERE s.id = $1`,
            [id]
        );
        return result.rows[0];
    }

    static async findByMahasiswaId(mahasiswaId) {
        const result = await pool.query(
            `SELECT s.*, 
                    m.nama_lengkap as mahasiswa_nama,
                    d1.nama_lengkap as pembimbing_1_nama,
                    d2.nama_lengkap as pembimbing_2_nama
             FROM skripsi s
             JOIN mahasiswa m ON s.mahasiswa_id = m.id
             LEFT JOIN dosen d1 ON s.pembimbing_1_id = d1.id
             LEFT JOIN dosen d2 ON s.pembimbing_2_id = d2.id
             WHERE s.mahasiswa_id = $1`,
            [mahasiswaId]
        );
        return result.rows[0];
    }

    static async create(data) {
        const { mahasiswa_id, judul, abstrak, status, pembimbing_1_id, pembimbing_2_id } = data;
        const result = await pool.query(
            `INSERT INTO skripsi (mahasiswa_id, judul, abstrak, status, pembimbing_1_id, pembimbing_2_id)
             VALUES ($1, $2, $3, $4, $5, $6)
             RETURNING *`,
            [mahasiswa_id, judul, abstrak, status || 'draft', pembimbing_1_id, pembimbing_2_id]
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
        const query = `UPDATE skripsi SET ${setClause}, updated_at = NOW() WHERE id = $${fields.length + 1} RETURNING *`;

        const result = await pool.query(query, [...values, id]);
        return result.rows[0];
    }

    static async delete(id) {
        const result = await pool.query(
            'DELETE FROM skripsi WHERE id = $1 RETURNING id',
            [id]
        );
        return result.rows[0];
    }

    static async findAll(limit = 10, offset = 0) {
        const result = await pool.query(
            `SELECT s.*, 
                    m.nama_lengkap as mahasiswa_nama,
                    d1.nama_lengkap as pembimbing_1_nama,
                    d2.nama_lengkap as pembimbing_2_nama
             FROM skripsi s
             JOIN mahasiswa m ON s.mahasiswa_id = m.id
             LEFT JOIN dosen d1 ON s.pembimbing_1_id = d1.id
             LEFT JOIN dosen d2 ON s.pembimbing_2_id = d2.id
             ORDER BY s.created_at DESC
             LIMIT $1 OFFSET $2`,
            [limit, offset]
        );
        return result.rows;
    }

    static async count() {
        const result = await pool.query('SELECT COUNT(*) FROM skripsi');
        return parseInt(result.rows[0].count);
    }
}

module.exports = Skripsi;
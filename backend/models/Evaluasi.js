const pool = require('../config/database');

class Evaluasi {
    static async findById(id) {
        const result = await pool.query(
            `SELECT e.*, 
                    m.nama_lengkap as mahasiswa_nama,
                    d.nama_lengkap as pengevaluasi_nama
             FROM evaluasi e
             JOIN mahasiswa m ON e.mahasiswa_id = m.id
             LEFT JOIN dosen d ON e.pengevaluasi_id = d.id
             WHERE e.id = $1`,
            [id]
        );
        return result.rows[0];
    }

    static async findByMahasiswaId(mahasiswaId) {
        const result = await pool.query(
            `SELECT e.*, 
                    m.nama_lengkap as mahasiswa_nama,
                    d.nama_lengkap as pengevaluasi_nama
             FROM evaluasi e
             JOIN mahasiswa m ON e.mahasiswa_id = m.id
             LEFT JOIN dosen d ON e.pengevaluasi_id = d.id
             WHERE e.mahasiswa_id = $1
             ORDER BY e.created_at DESC`,
            [mahasiswaId]
        );
        return result.rows;
    }

    static async create(data) {
        const { mahasiswa_id, skripsi_id, pengevaluasi_id, nilai_huruf, nilai_angka, catatan, status } = data;
        const result = await pool.query(
            `INSERT INTO evaluasi (mahasiswa_id, skripsi_id, pengevaluasi_id, nilai_huruf, nilai_angka, catatan, status)
             VALUES ($1, $2, $3, $4, $5, $6, $7)
             RETURNING *`,
            [mahasiswa_id, skripsi_id, pengevaluasi_id, nilai_huruf, nilai_angka, catatan, status || 'pending']
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
        const query = `UPDATE evaluasi SET ${setClause}, updated_at = NOW() WHERE id = $${fields.length + 1} RETURNING *`;

        const result = await pool.query(query, [...values, id]);
        return result.rows[0];
    }

    static async delete(id) {
        const result = await pool.query(
            'DELETE FROM evaluasi WHERE id = $1 RETURNING id',
            [id]
        );
        return result.rows[0];
    }

    static async findAll(limit = 10, offset = 0) {
        const result = await pool.query(
            `SELECT e.*, 
                    m.nama_lengkap as mahasiswa_nama,
                    d.nama_lengkap as pengevaluasi_nama
             FROM evaluasi e
             JOIN mahasiswa m ON e.mahasiswa_id = m.id
             LEFT JOIN dosen d ON e.pengevaluasi_id = d.id
             ORDER BY e.created_at DESC
             LIMIT $1 OFFSET $2`,
            [limit, offset]
        );
        return result.rows;
    }

    static async count() {
        const result = await pool.query('SELECT COUNT(*) FROM evaluasi');
        return parseInt(result.rows[0].count);
    }
}

module.exports = Evaluasi;
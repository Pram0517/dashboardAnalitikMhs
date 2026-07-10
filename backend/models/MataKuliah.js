const pool = require('../config/database');

class MataKuliah {
    static async findById(id) {
        const result = await pool.query(
            `SELECT m.*, k.nama_kurikulum, k.tahun_berlaku
             FROM mata_kuliah m
             JOIN kurikulum k ON m.kurikulum_id = k.id
             WHERE m.id = $1`,
            [id]
        );
        return result.rows[0];
    }

    static async findByKode(kode) {
        const result = await pool.query(
            `SELECT m.*, k.nama_kurikulum, k.tahun_berlaku
             FROM mata_kuliah m
             JOIN kurikulum k ON m.kurikulum_id = k.id
             WHERE m.kode_mk = $1`,
            [kode]
        );
        return result.rows[0];
    }

    static async create(data) {
        const { 
            kurikulum_id, 
            nama_mata_kuliah, 
            kode_mk, 
            sks, 
            semester, 
            deskripsi,
            sifat,
            praktikum,
            praktik_lapangan
        } = data;
        
        const result = await pool.query(
            `INSERT INTO mata_kuliah 
             (kurikulum_id, nama_mata_kuliah, kode_mk, sks, semester, deskripsi, sifat, praktikum, praktik_lapangan)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
             RETURNING *`,
            [
                kurikulum_id, 
                nama_mata_kuliah, 
                kode_mk, 
                sks, 
                semester || 1, 
                deskripsi || '',
                sifat || 'Wajib',
                praktikum || 0,
                praktik_lapangan || 0
            ]
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
        const query = `UPDATE mata_kuliah SET ${setClause}, updated_at = NOW() WHERE id = $${fields.length + 1} RETURNING *`;

        const result = await pool.query(query, [...values, id]);
        return result.rows[0];
    }

    static async delete(id) {
        const result = await pool.query(
            'DELETE FROM mata_kuliah WHERE id = $1 RETURNING id',
            [id]
        );
        return result.rows[0];
    }

    static async findAll(limit = 10, offset = 0) {
        const result = await pool.query(
            `SELECT m.*, k.nama_kurikulum, k.tahun_berlaku
             FROM mata_kuliah m
             JOIN kurikulum k ON m.kurikulum_id = k.id
             ORDER BY m.semester ASC, m.kode_mk ASC
             LIMIT $1 OFFSET $2`,
            [limit, offset]
        );
        return result.rows;
    }

    static async count() {
        const result = await pool.query('SELECT COUNT(*) FROM mata_kuliah');
        return parseInt(result.rows[0].count);
    }

    static async findBySemester(semester) {
        const result = await pool.query(
            `SELECT m.*, k.nama_kurikulum, k.tahun_berlaku
             FROM mata_kuliah m
             JOIN kurikulum k ON m.kurikulum_id = k.id
             WHERE m.semester = $1
             ORDER BY m.kode_mk ASC`,
            [semester]
        );
        return result.rows;
    }
}

module.exports = MataKuliah;
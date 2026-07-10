const pool = require('../config/database');

// ============ GET ALL SKRIPSI ============
const getAllSkripsi = async (limit = 10, offset = 0) => {
    const result = await pool.query(`
        SELECT s.*, 
               m.nama_lengkap as mahasiswa_nama,
               d1.nama_lengkap as dosen_pembimbing_1,
               d2.nama_lengkap as dosen_pembimbing_2
        FROM skripsi s
        JOIN mahasiswa m ON s.mahasiswa_id = m.id
        LEFT JOIN dosen d1 ON s.pembimbing_1_id = d1.id
        LEFT JOIN dosen d2 ON s.pembimbing_2_id = d2.id
        ORDER BY s.created_at DESC
        LIMIT $1 OFFSET $2
    `, [limit, offset]);

    const countResult = await pool.query('SELECT COUNT(*) FROM skripsi');

    return {
        data: result.rows,
        total: parseInt(countResult.rows[0].count)
    };
};

// ============ GET SKRIPSI BY NIM ============
const getSkripsiByNim = async (nim, limit = 10, offset = 0) => {
    const result = await pool.query(`
        SELECT s.*, 
               m.nama_lengkap as mahasiswa_nama,
               d1.nama_lengkap as dosen_pembimbing_1,
               d2.nama_lengkap as dosen_pembimbing_2
        FROM skripsi s
        JOIN mahasiswa m ON s.mahasiswa_id = m.id
        LEFT JOIN dosen d1 ON s.pembimbing_1_id = d1.id
        LEFT JOIN dosen d2 ON s.pembimbing_2_id = d2.id
        WHERE m.npm = $1
        ORDER BY s.created_at DESC
        LIMIT $2 OFFSET $3
    `, [nim, limit, offset]);

    const countResult = await pool.query(
        'SELECT COUNT(*) FROM skripsi s JOIN mahasiswa m ON s.mahasiswa_id = m.id WHERE m.npm = $1',
        [nim]
    );

    return {
        data: result.rows,
        total: parseInt(countResult.rows[0].count)
    };
};

// ============ GET SKRIPSI BY MAHASISWA ID ============
const getSkripsiByMahasiswaId = async (mahasiswaId) => {
    const result = await pool.query(`
        SELECT s.*, 
               m.nama_lengkap as mahasiswa_nama,
               d1.nama_lengkap as dosen_pembimbing_1,
               d2.nama_lengkap as dosen_pembimbing_2
        FROM skripsi s
        JOIN mahasiswa m ON s.mahasiswa_id = m.id
        LEFT JOIN dosen d1 ON s.pembimbing_1_id = d1.id
        LEFT JOIN dosen d2 ON s.pembimbing_2_id = d2.id
        WHERE s.mahasiswa_id = $1
    `, [mahasiswaId]);

    return result.rows[0] || null;
};

// ============ GET SKRIPSI BY ID ============
const getSkripsiById = async (id) => {
    const result = await pool.query(`
        SELECT s.*, 
               m.nama_lengkap as mahasiswa_nama,
               d1.nama_lengkap as dosen_pembimbing_1,
               d2.nama_lengkap as dosen_pembimbing_2
        FROM skripsi s
        JOIN mahasiswa m ON s.mahasiswa_id = m.id
        LEFT JOIN dosen d1 ON s.pembimbing_1_id = d1.id
        LEFT JOIN dosen d2 ON s.pembimbing_2_id = d2.id
        WHERE s.id = $1
    `, [id]);

    if (result.rows.length === 0) {
        throw new Error('Skripsi tidak ditemukan');
    }

    return result.rows[0];
};

// ============ CREATE SKRIPSI ============
const createSkripsi = async (data) => {
    const { mahasiswa_id, judul, abstrak, status, pembimbing_1_id, pembimbing_2_id } = data;

    const result = await pool.query(`
        INSERT INTO skripsi (mahasiswa_id, judul, abstrak, status, pembimbing_1_id, pembimbing_2_id)
        VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING *
    `, [mahasiswa_id, judul, abstrak, status || 'draft', pembimbing_1_id, pembimbing_2_id]);

    return result.rows[0];
};

// ============ UPDATE SKRIPSI ============
const updateSkripsi = async (id, data) => {
    const fields = Object.keys(data);
    const values = Object.values(data);

    if (fields.length === 0) {
        throw new Error('Tidak ada data untuk diupdate');
    }

    const setClause = fields.map((field, index) => `${field} = $${index + 1}`).join(', ');
    const query = `UPDATE skripsi SET ${setClause}, updated_at = NOW() WHERE id = $${fields.length + 1} RETURNING *`;

    const result = await pool.query(query, [...values, id]);

    if (result.rows.length === 0) {
        throw new Error('Skripsi tidak ditemukan');
    }

    return result.rows[0];
};

// ============ DELETE SKRIPSI ============
const deleteSkripsi = async (id) => {
    const result = await pool.query('DELETE FROM skripsi WHERE id = $1 RETURNING *', [id]);

    if (result.rows.length === 0) {
        throw new Error('Skripsi tidak ditemukan');
    }

    return result.rows[0];
};

// ============ GET SKRIPSI BY PRODI ============
const getSkripsiByProdi = async (prodi, limit = 10, offset = 0) => {
    const result = await pool.query(`
        SELECT s.*, 
               m.nama_lengkap as mahasiswa_nama,
               d1.nama_lengkap as dosen_pembimbing_1,
               d2.nama_lengkap as dosen_pembimbing_2
        FROM skripsi s
        JOIN mahasiswa m ON s.mahasiswa_id = m.id
        LEFT JOIN dosen d1 ON s.pembimbing_1_id = d1.id
        LEFT JOIN dosen d2 ON s.pembimbing_2_id = d2.id
        WHERE m.prodi = $1
        ORDER BY s.created_at DESC
        LIMIT $2 OFFSET $3
    `, [prodi, limit, offset]);

    const countResult = await pool.query(
        'SELECT COUNT(*) FROM skripsi s JOIN mahasiswa m ON s.mahasiswa_id = m.id WHERE m.prodi = $1',
        [prodi]
    );

    return {
        data: result.rows,
        total: parseInt(countResult.rows[0].count)
    };
};

module.exports = {
    getAllSkripsi,
    getSkripsiByNim,
    getSkripsiByMahasiswaId,
    getSkripsiById,
    createSkripsi,
    updateSkripsi,
    deleteSkripsi,
    getSkripsiByProdi
};
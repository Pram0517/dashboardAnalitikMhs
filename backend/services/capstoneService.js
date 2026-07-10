const pool = require('../config/database');

// Get all capstone
const getAllCapstone = async (limit = 10, offset = 0) => {
  const result = await pool.query(
    `SELECT c.*, 
            m.nama_lengkap as mahasiswa_nama,
            d.nama as dosen_pembimbing_nama
     FROM capstone c
     LEFT JOIN mahasiswa m ON c.nim = m.npm
     LEFT JOIN dosen d ON c.dosen_pembimbing_id = d.id
     ORDER BY c.created_at DESC
     LIMIT $1 OFFSET $2`,
    [limit, offset]
  );

  const countResult = await pool.query('SELECT COUNT(*) FROM capstone');

  return {
    data: result.rows,
    total: parseInt(countResult.rows[0].count)
  };
};

// Get capstone by prodi (untuk kaprodi)
const getCapstoneByProdi = async (prodi, limit = 10, offset = 0) => {
  const result = await pool.query(
    `SELECT c.*, 
            m.nama_lengkap as mahasiswa_nama,
            d.nama as dosen_pembimbing_nama
     FROM capstone c
     LEFT JOIN mahasiswa m ON c.nim = m.npm
     LEFT JOIN dosen d ON c.dosen_pembimbing_id = d.id
     WHERE m.prodi = $1
     ORDER BY c.created_at DESC
     LIMIT $2 OFFSET $3`,
    [prodi, limit, offset]
  );

  const countResult = await pool.query(
    'SELECT COUNT(*) FROM capstone c LEFT JOIN mahasiswa m ON c.nim = m.npm WHERE m.prodi = $1',
    [prodi]
  );

  return {
    data: result.rows,
    total: parseInt(countResult.rows[0].count)
  };
};

// Get capstone by NIM (untuk mahasiswa)
const getCapstoneByNim = async (nim, limit = 10, offset = 0) => {
  const result = await pool.query(
    `SELECT c.*, 
            m.nama_lengkap as mahasiswa_nama,
            d.nama as dosen_pembimbing_nama
     FROM capstone c
     LEFT JOIN mahasiswa m ON c.nim = m.npm
     LEFT JOIN dosen d ON c.dosen_pembimbing_id = d.id
     WHERE c.nim = $1
     ORDER BY c.created_at DESC
     LIMIT $2 OFFSET $3`,
    [nim, limit, offset]
  );

  const countResult = await pool.query(
    'SELECT COUNT(*) FROM capstone WHERE nim = $1',
    [nim]
  );

  return {
    data: result.rows,
    total: parseInt(countResult.rows[0].count)
  };
};

// Get capstone by ID
const getCapstoneById = async (id) => {
  const result = await pool.query(
    `SELECT c.*, 
            m.nama_lengkap as mahasiswa_nama,
            d.nama as dosen_pembimbing_nama
     FROM capstone c
     LEFT JOIN mahasiswa m ON c.nim = m.npm
     LEFT JOIN dosen d ON c.dosen_pembimbing_id = d.id
     WHERE c.id = $1`,
    [id]
  );

  if (result.rows.length === 0) {
    throw new Error('Capstone tidak ditemukan');
  }

  return result.rows[0];
};

// Create capstone
const createCapstone = async (data) => {
  const {
    nim,
    judul,
    deskripsi,
    dosen_pembimbing_id,
    status = 'Belum Mulai'
  } = data;

  const result = await pool.query(
    `INSERT INTO capstone (nim, judul, deskripsi, dosen_pembimbing_id, status)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING *`,
    [nim, judul, deskripsi, dosen_pembimbing_id, status]
  );

  return result.rows[0];
};

// Update capstone
const updateCapstone = async (id, data) => {
  const fields = Object.keys(data);
  const values = Object.values(data);

  if (fields.length === 0) {
    throw new Error('Tidak ada data untuk diupdate');
  }

  const setClause = fields.map((field, index) => `${field} = $${index + 1}`).join(', ');
  const query = `UPDATE capstone SET ${setClause}, updated_at = NOW() WHERE id = $${fields.length + 1} RETURNING *`;

  const result = await pool.query(query, [...values, id]);

  if (result.rows.length === 0) {
    throw new Error('Capstone tidak ditemukan');
  }

  return result.rows[0];
};

// Delete capstone
const deleteCapstone = async (id) => {
  const result = await pool.query(
    'DELETE FROM capstone WHERE id = $1 RETURNING *',
    [id]
  );

  if (result.rows.length === 0) {
    throw new Error('Capstone tidak ditemukan');
  }

  return result.rows[0];
};

module.exports = {
  getAllCapstone,
  getCapstoneByProdi,
  getCapstoneByNim,
  getCapstoneById,
  createCapstone,
  updateCapstone,
  deleteCapstone
};
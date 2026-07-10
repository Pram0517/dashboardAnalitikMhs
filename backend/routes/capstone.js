const express = require('express');
const router = express.Router();
const { authMiddleware, adminMiddleware } = require('../middleware/auth');

// GET all capstone
router.get('/', authMiddleware, async (req, res) => {
  try {
    const pool = require('../config/database');
    const result = await pool.query(`
      SELECT c.*, m.nama_lengkap as mahasiswa_nama 
      FROM capstone c
      LEFT JOIN mahasiswa m ON c.nim = m.npm
      ORDER BY c.created_at DESC
    `);
    
    res.json({
      status: 'Success',
      data: result.rows,
      pagination: { total: result.rows.length, page: 1, pages: 1 }
    });
  } catch (error) {
    res.status(500).json({ status: 'Error', message: error.message });
  }
});

// GET capstone by NIM
router.get('/nim/:nim', authMiddleware, async (req, res) => {
  try {
    const pool = require('../config/database');
    const { nim } = req.params;
    const result = await pool.query(`
      SELECT c.*, m.nama_lengkap as mahasiswa_nama 
      FROM capstone c
      LEFT JOIN mahasiswa m ON c.nim = m.npm
      WHERE c.nim = $1
    `, [nim]);
    
    res.json({
      status: 'Success',
      data: result.rows
    });
  } catch (error) {
    res.status(500).json({ status: 'Error', message: error.message });
  }
});

// GET capstone by ID
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const pool = require('../config/database');
    const { id } = req.params;
    const result = await pool.query(`
      SELECT c.*, m.nama_lengkap as mahasiswa_nama 
      FROM capstone c
      LEFT JOIN mahasiswa m ON c.nim = m.npm
      WHERE c.id = $1
    `, [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ status: 'Error', message: 'Capstone tidak ditemukan' });
    }
    
    res.json({
      status: 'Success',
      data: result.rows[0]
    });
  } catch (error) {
    res.status(500).json({ status: 'Error', message: error.message });
  }
});

// POST create capstone
router.post('/', authMiddleware, async (req, res) => {
  try {
    const pool = require('../config/database');
    const { nim, judul, deskripsi, status = 'Belum Mulai' } = req.body;
    
    const result = await pool.query(
      `INSERT INTO capstone (nim, judul, deskripsi, status) 
       VALUES ($1, $2, $3, $4) RETURNING *`,
      [nim, judul, deskripsi, status]
    );
    
    res.status(201).json({
      status: 'Success',
      data: result.rows[0]
    });
  } catch (error) {
    res.status(500).json({ status: 'Error', message: error.message });
  }
});

// PUT update capstone
router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const pool = require('../config/database');
    const { id } = req.params;
    const { judul, deskripsi, status } = req.body;
    
    const result = await pool.query(
      `UPDATE capstone SET judul = $1, deskripsi = $2, status = $3, updated_at = NOW() 
       WHERE id = $4 RETURNING *`,
      [judul, deskripsi, status, id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ status: 'Error', message: 'Capstone tidak ditemukan' });
    }
    
    res.json({
      status: 'Success',
      data: result.rows[0]
    });
  } catch (error) {
    res.status(500).json({ status: 'Error', message: error.message });
  }
});

// DELETE capstone
router.delete('/:id', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const pool = require('../config/database');
    const { id } = req.params;
    
    const result = await pool.query('DELETE FROM capstone WHERE id = $1 RETURNING *', [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ status: 'Error', message: 'Capstone tidak ditemukan' });
    }
    
    res.json({
      status: 'Success',
      message: 'Capstone berhasil dihapus'
    });
  } catch (error) {
    res.status(500).json({ status: 'Error', message: error.message });
  }
});

module.exports = router;
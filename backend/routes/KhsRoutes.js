// backend/routes/khsRoutes.js
const express = require('express');
const router = express.Router();
const khsService = require('../services/khsService'); // ← Path harus benar
const { authMiddleware } = require('../middleware/auth');

// ============ GET ALL MAHASISWA ============
router.get('/mahasiswa', authMiddleware, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const status = req.query.status || 'Semua';
    const angkatan = req.query.angkatan || 'Semua Angkatan';
    const search = req.query.search || '';

    const filters = { status, angkatan, search };
    const result = await khsService.getAllMahasiswa(page, limit, filters);

    if (result.success) {
      res.json({
        status: 'Success',
        data: result.data,
        pagination: result.pagination
      });
    } else {
      res.status(500).json({
        status: 'Error',
        message: result.message
      });
    }
  } catch (error) {
    console.error('❌ Error in GET /khs/mahasiswa:', error);
    res.status(500).json({
      status: 'Error',
      message: error.message
    });
  }
});

// ============ GET MAHASISWA BY NIM ============
router.get('/mahasiswa/:nim', authMiddleware, async (req, res) => {
  try {
    const { nim } = req.params;
    const result = await khsService.getMahasiswaByNim(nim);

    if (result.success) {
      res.json({
        status: 'Success',
        data: result.data
      });
    } else {
      res.status(404).json({
        status: 'Error',
        message: result.message
      });
    }
  } catch (error) {
    console.error('❌ Error in GET /khs/mahasiswa/:nim:', error);
    res.status(500).json({
      status: 'Error',
      message: error.message
    });
  }
});

// ============ GET MATA KULIAH MAHASISWA ============
router.get('/:nim/mata-kuliah', authMiddleware, async (req, res) => {
  try {
    const { nim } = req.params;
    const { semester } = req.query;

    const result = await khsService.getMataKuliahByNim(nim, semester);

    if (result.success) {
      res.json({
        status: 'Success',
        data: result.data
      });
    } else {
      res.status(500).json({
        status: 'Error',
        message: result.message
      });
    }
  } catch (error) {
    console.error('❌ Error in GET /khs/:nim/mata-kuliah:', error);
    res.status(500).json({
      status: 'Error',
      message: error.message
    });
  }
});

// ============ GET SUMMARY ============
router.get('/summary', authMiddleware, async (req, res) => {
  try {
    const result = await khsService.getSummary();

    if (result.success) {
      res.json({
        status: 'Success',
        data: result.data
      });
    } else {
      res.status(500).json({
        status: 'Error',
        message: result.message
      });
    }
  } catch (error) {
    console.error('❌ Error in GET /khs/summary:', error);
    res.status(500).json({
      status: 'Error',
      message: error.message
    });
  }
});

// ============ SEARCH MAHASISWA ============
router.get('/search', authMiddleware, async (req, res) => {
  try {
    const { q } = req.query;
    if (!q || q.trim() === '') {
      return res.json({
        status: 'Success',
        data: []
      });
    }

    const result = await khsService.searchMahasiswa(q);

    if (result.success) {
      res.json({
        status: 'Success',
        data: result.data
      });
    } else {
      res.status(500).json({
        status: 'Error',
        message: result.message
      });
    }
  } catch (error) {
    console.error('❌ Error in GET /khs/search:', error);
    res.status(500).json({
      status: 'Error',
      message: error.message
    });
  }
});

// ============ DEBUG: GET TABLE STRUCTURE ============
router.get('/debug/structure', authMiddleware, async (req, res) => {
  try {
    const { supabaseKhs } = require('../config/supabase');
    const { data, error } = await supabaseKhs
      .from('mhs_khs')
      .select('*')
      .limit(1);

    if (error) throw error;

    const columns = data && data.length > 0 ? Object.keys(data[0]) : [];
    
    res.json({
      status: 'Success',
      data: {
        columns: columns,
        sample: data && data.length > 0 ? data[0] : null,
        message: `Table has ${columns.length} columns: ${columns.join(', ')}`
      }
    });
  } catch (error) {
    console.error('❌ Error fetching table structure:', error);
    res.status(500).json({
      status: 'Error',
      message: error.message
    });
  }
});

module.exports = router;
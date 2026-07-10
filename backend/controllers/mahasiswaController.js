const mahasiswaService = require('../services/mahasiswaService');
const { formatResponse, formatPaginationResponse } = require('../utils/formatters');
const { HTTP_STATUS } = require('../utils/constants');

// ============ GET ALL ============
const getAll = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    const userRole = req.user.role;
    const userProdi = req.user.prodi;

    let result;

    if (userRole === 'admin') {
      result = await mahasiswaService.getAllMahasiswa(limit, offset);
    } else if (userRole === 'kaprodi') {
      result = await mahasiswaService.getMahasiswaByProdi(userProdi, limit, offset);
    } else {
      return res.status(HTTP_STATUS.FORBIDDEN).json(
        formatResponse('Error', 'Akses ditolak')
      );
    }

    res.status(HTTP_STATUS.OK).json(
      formatPaginationResponse(
        'Success',
        'Data mahasiswa berhasil diambil',
        result.data,
        page,
        limit,
        result.total
      )
    );
  } catch (error) {
    res.status(HTTP_STATUS.INTERNAL_ERROR).json(
      formatResponse('Error', error.message)
    );
  }
};

// ============ GET BY NPM/NIM ============
const getById = async (req, res) => {
  try {
    const { nim } = req.params;
    const mahasiswa = await mahasiswaService.getMahasiswaByNPM(nim);

    res.status(HTTP_STATUS.OK).json(
      formatResponse('Success', 'Data mahasiswa berhasil diambil', mahasiswa)
    );
  } catch (error) {
    res.status(HTTP_STATUS.NOT_FOUND).json(
      formatResponse('Error', error.message)
    );
  }
};

// ============ CREATE ============
const create = async (req, res) => {
  try {
    const mahasiswa = await mahasiswaService.createMahasiswa(req.body);

    res.status(HTTP_STATUS.CREATED).json(
      formatResponse('Success', 'Data mahasiswa berhasil dibuat', mahasiswa)
    );
  } catch (error) {
    if (error.code === '23505') {
      return res.status(HTTP_STATUS.CONFLICT).json(
        formatResponse('Error', 'NPM sudah terdaftar')
      );
    }
    res.status(HTTP_STATUS.INTERNAL_ERROR).json(
      formatResponse('Error', error.message)
    );
  }
};

// ============ UPDATE ============
const update = async (req, res) => {
  try {
    const { nim } = req.params;
    const userRole = req.user.role;
    const userNim = req.user.nim;

    // Mahasiswa hanya bisa update data sendiri
    if (userRole === 'mahasiswa' && userNim !== nim) {
      return res.status(HTTP_STATUS.FORBIDDEN).json(
        formatResponse('Error', 'Anda hanya bisa mengupdate data sendiri')
      );
    }

    const mahasiswa = await mahasiswaService.updateMahasiswaByNpm(nim, req.body);

    res.status(HTTP_STATUS.OK).json(
      formatResponse('Success', 'Data mahasiswa berhasil diupdate', mahasiswa)
    );
  } catch (error) {
    res.status(HTTP_STATUS.INTERNAL_ERROR).json(
      formatResponse('Error', error.message)
    );
  }
};

// ============ DELETE ============
const deleteMahasiswa = async (req, res) => {
  try {
    const { nim } = req.params;
    await mahasiswaService.deleteMahasiswaByNpm(nim);

    res.status(HTTP_STATUS.OK).json(
      formatResponse('Success', 'Data mahasiswa berhasil dihapus')
    );
  } catch (error) {
    res.status(HTTP_STATUS.NOT_FOUND).json(
      formatResponse('Error', error.message)
    );
  }
};

const pool = require('../config/database');

// ============ GET ALL MAHASISWA WITH DETAILS ============
const getAllWithDetails = async (req, res) => {
    try {
        const { page = 1, limit = 10, search = '', filterStatus = '' } = req.query;
        const offset = (parseInt(page) - 1) * parseInt(limit);

        let whereClause = '1=1';
        const params = [];
        let paramIndex = 1;

        if (search) {
            whereClause += ` AND (m.npm ILIKE $${paramIndex} OR m.nama_lengkap ILIKE $${paramIndex})`;
            params.push(`%${search}%`);
            paramIndex++;
        }

        if (filterStatus && filterStatus !== 'Semua') {
            whereClause += ` AND m.status = $${paramIndex}`;
            params.push(filterStatus);
            paramIndex++;
        }

        // ✅ QUERY DENGAN IPK DAN TOTAL_SKS
        const query = `
            SELECT 
                m.id,
                m.npm,
                m.nama_lengkap,
                m.angkatan,
                m.ipk,
                m.gpa,
                m.semester,
                m.total_sks,
                m.status,
                u.email,
                u.name as user_name
            FROM mahasiswa m
            LEFT JOIN users u ON m.user_id = u.id
            WHERE ${whereClause}
            ORDER BY m.npm
            LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
        `;

        const countQuery = `
            SELECT COUNT(*) as total
            FROM mahasiswa m
            WHERE ${whereClause}
        `;

        params.push(parseInt(limit), offset);

        const [result, countResult] = await Promise.all([
            pool.query(query, params),
            pool.query(countQuery, params.slice(0, -2))
        ]);

        res.status(200).json({
            status: 'Success',
            data: result.rows,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total: parseInt(countResult.rows[0].total),
                pages: Math.ceil(countResult.rows[0].total / parseInt(limit))
            }
        });

    } catch (error) {
        console.error('❌ Error in getAllWithDetails:', error);
        res.status(500).json({
            status: 'Error',
            message: error.message || 'Gagal mengambil data mahasiswa'
        });
    }
};

// ============ GET MAHASISWA BY NIM WITH DETAILS ============
const getByNimWithDetails = async (req, res) => {
    try {
        const { nim } = req.params;

        // ✅ QUERY DENGAN IPK DAN TOTAL_SKS
        const query = `
            SELECT 
                m.id,
                m.npm,
                m.nama_lengkap,
                m.angkatan,
                m.ipk,
                m.gpa,
                m.semester,
                m.total_sks,
                m.status,
                u.email,
                u.name as user_name
            FROM mahasiswa m
            LEFT JOIN users u ON m.user_id = u.id
            WHERE m.npm = $1
        `;

        const result = await pool.query(query, [nim]);

        if (result.rows.length === 0) {
            return res.status(404).json({
                status: 'Error',
                message: 'Mahasiswa tidak ditemukan'
            });
        }

        res.status(200).json({
            status: 'Success',
            data: result.rows[0]
        });

    } catch (error) {
        console.error('❌ Error in getByNimWithDetails:', error);
        res.status(500).json({
            status: 'Error',
            message: error.message || 'Gagal mengambil data mahasiswa'
        });
    }
};


module.exports = {
  getAll,
  getById,
  create,
  update,
  delete: deleteMahasiswa,
  getAllWithDetails,
  getByNimWithDetails
};
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

// ============ GET ALL MAHASISWA WITH DETAILS (FIXED) ============
const getAllWithDetails = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;
    const search = req.query.search || '';
    const filterStatus = req.query.filterStatus || '';

    const result = await mahasiswaService.getAllMahasiswaWithDetails(
      limit,
      offset,
      search,
      filterStatus
    );

    // ✅ Format data agar sesuai dengan frontend
    const formattedData = result.data.map(item => ({
      id: item.id,
      npm: item.npm,
      nim: item.nim || item.npm,
      nama_lengkap: item.nama_lengkap,
      nama: item.nama_lengkap,
      angkatan: item.angkatan,
      ipk: parseFloat(item.ipk) || 0,
      semester: item.semester || 1,
      status: item.status || 'aktif',
      total_sks: parseInt(item.total_sks) || 0,
      total_mk: parseInt(item.total_mk) || 0,
      email: item.email,
      user_name: item.user_name
    }));

    res.status(HTTP_STATUS.OK).json({
      status: 'Success',
      data: formattedData,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: result.total,
        pages: Math.ceil(result.total / limit)
      }
    });
  } catch (error) {
    console.error('❌ Error in getAllWithDetails:', error);
    res.status(HTTP_STATUS.INTERNAL_ERROR).json({
      status: 'Error',
      message: error.message || 'Gagal mengambil data mahasiswa'
    });
  }
};

// ============ GET MAHASISWA BY NIM WITH DETAILS (FIXED) ============
const getByNimWithDetails = async (req, res) => {
  try {
    const { nim } = req.params;

    const mahasiswa = await mahasiswaService.getMahasiswaByNimWithDetails(nim);

    if (!mahasiswa) {
      return res.status(HTTP_STATUS.NOT_FOUND).json(
        formatResponse('Error', 'Mahasiswa tidak ditemukan')
      );
    }

    // ✅ Format data
    const formattedData = {
      id: mahasiswa.id,
      npm: mahasiswa.npm,
      nim: mahasiswa.nim || mahasiswa.npm,
      nama_lengkap: mahasiswa.nama_lengkap,
      nama: mahasiswa.nama_lengkap,
      angkatan: mahasiswa.angkatan,
      ipk: parseFloat(mahasiswa.ipk) || 0,
      semester: mahasiswa.semester || 1,
      status: mahasiswa.status || 'aktif',
      total_sks: parseInt(mahasiswa.total_sks) || 0,
      total_mk: parseInt(mahasiswa.total_mk) || 0,
      nilai: mahasiswa.nilai || []
    };

    res.status(HTTP_STATUS.OK).json(
      formatResponse('Success', 'Data mahasiswa berhasil diambil', formattedData)
    );
  } catch (error) {
    console.error('❌ Error in getByNimWithDetails:', error);
    res.status(HTTP_STATUS.INTERNAL_ERROR).json(
      formatResponse('Error', error.message)
    );
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
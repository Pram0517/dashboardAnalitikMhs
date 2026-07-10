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

// ============ GET ALL MAHASISWA WITH DETAILS ============
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

// ============ GET MAHASISWA BY NIM WITH DETAILS ============
const getByNimWithDetails = async (req, res) => {
  try {
    const { nim } = req.params;
    
    const mahasiswa = await mahasiswaService.getMahasiswaByNimWithDetails(nim);
    
    if (!mahasiswa) {
      return res.status(HTTP_STATUS.NOT_FOUND).json(
        formatResponse('Error', 'Mahasiswa tidak ditemukan')
      );
    }

    res.status(HTTP_STATUS.OK).json(
      formatResponse('Success', 'Data mahasiswa berhasil diambil', mahasiswa)
    );
  } catch (error) {
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
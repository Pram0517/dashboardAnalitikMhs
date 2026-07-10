const capstoneService = require('../services/capstoneService');
const { formatResponse, formatPaginationResponse } = require('../utils/formatters');
const { HTTP_STATUS } = require('../utils/constants');

// Get all capstone
const getAll = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    const userRole = req.user.role;
    const userProdi = req.user.prodi;
    const userNim = req.user.nim;

    let result;

    if (userRole === 'admin') {
      result = await capstoneService.getAllCapstone(limit, offset);
    } else if (userRole === 'kaprodi') {
      result = await capstoneService.getCapstoneByProdi(userProdi, limit, offset);
    } else if (userRole === 'mahasiswa') {
      result = await capstoneService.getCapstoneByNim(userNim, limit, offset);
    } else {
      return res.status(HTTP_STATUS.FORBIDDEN).json(
        formatResponse('Error', 'Akses ditolak')
      );
    }

    res.status(HTTP_STATUS.OK).json(
      formatPaginationResponse(
        'Success',
        'Data capstone berhasil diambil',
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

// Get capstone by NIM
const getByNim = async (req, res) => {
  try {
    const { nim } = req.params;
    const capstone = await capstoneService.getCapstoneByNim(nim);

    res.status(HTTP_STATUS.OK).json(
      formatResponse('Success', 'Data capstone berhasil diambil', capstone)
    );
  } catch (error) {
    res.status(HTTP_STATUS.NOT_FOUND).json(
      formatResponse('Error', error.message)
    );
  }
};

// Get capstone by ID
const getById = async (req, res) => {
  try {
    const { id } = req.params;
    const capstone = await capstoneService.getCapstoneById(id);

    res.status(HTTP_STATUS.OK).json(
      formatResponse('Success', 'Data capstone berhasil diambil', capstone)
    );
  } catch (error) {
    res.status(HTTP_STATUS.NOT_FOUND).json(
      formatResponse('Error', error.message)
    );
  }
};

// Create capstone
const create = async (req, res) => {
  try {
    const userRole = req.user.role;
    const userNim = req.user.nim;

    // Mahasiswa hanya bisa membuat capstone untuk dirinya sendiri
    if (userRole === 'mahasiswa' && req.body.nim !== userNim) {
      return res.status(HTTP_STATUS.FORBIDDEN).json(
        formatResponse('Error', 'Anda hanya bisa membuat capstone untuk diri sendiri')
      );
    }

    const capstone = await capstoneService.createCapstone(req.body);

    res.status(HTTP_STATUS.CREATED).json(
      formatResponse('Success', 'Data capstone berhasil dibuat', capstone)
    );
  } catch (error) {
    res.status(HTTP_STATUS.INTERNAL_ERROR).json(
      formatResponse('Error', error.message)
    );
  }
};

// Update capstone
const update = async (req, res) => {
  try {
    const { id } = req.params;
    const userRole = req.user.role;
    const userNim = req.user.nim;

    // Mahasiswa hanya bisa update capstonenya sendiri
    if (userRole === 'mahasiswa') {
      const capstone = await capstoneService.getCapstoneById(id);
      if (capstone.nim !== userNim) {
        return res.status(HTTP_STATUS.FORBIDDEN).json(
          formatResponse('Error', 'Anda hanya bisa mengupdate capstone sendiri')
        );
      }
    }

    const capstone = await capstoneService.updateCapstone(id, req.body);

    res.status(HTTP_STATUS.OK).json(
      formatResponse('Success', 'Data capstone berhasil diupdate', capstone)
    );
  } catch (error) {
    res.status(HTTP_STATUS.INTERNAL_ERROR).json(
      formatResponse('Error', error.message)
    );
  }
};

// Delete capstone
const deleteCapstone = async (req, res) => {
  try {
    const { id } = req.params;
    await capstoneService.deleteCapstone(id);

    res.status(HTTP_STATUS.OK).json(
      formatResponse('Success', 'Data capstone berhasil dihapus')
    );
  } catch (error) {
    res.status(HTTP_STATUS.NOT_FOUND).json(
      formatResponse('Error', error.message)
    );
  }
};

module.exports = {
  getAll,
  getByNim,
  getById,
  create,
  update,
  delete: deleteCapstone
};
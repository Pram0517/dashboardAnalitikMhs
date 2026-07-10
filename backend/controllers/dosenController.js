const dosenService = require('../services/dosenService');
const { formatResponse, formatPaginationResponse } = require('../utils/formatters');
const { HTTP_STATUS } = require('../utils/constants');

const getAll = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    const result = await dosenService.getAllDosen(limit, offset);

    res.status(HTTP_STATUS.OK).json(
      formatPaginationResponse(
        'Success',
        'Data dosen berhasil diambil',
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

const getById = async (req, res) => {
  try {
    const { id } = req.params;
    const dosen = await dosenService.getDosenById(id);

    res.status(HTTP_STATUS.OK).json(
      formatResponse('Success', 'Data dosen berhasil diambil', dosen)
    );
  } catch (error) {
    res.status(HTTP_STATUS.NOT_FOUND).json(
      formatResponse('Error', error.message)
    );
  }
};

const create = async (req, res) => {
  try {
    const dosen = await dosenService.createDosen(req.body);

    res.status(HTTP_STATUS.CREATED).json(
      formatResponse('Success', 'Data dosen berhasil dibuat', dosen)
    );
  } catch (error) {
    if (error.code === '23505') {
      return res.status(HTTP_STATUS.CONFLICT).json(
        formatResponse('Error', 'NIP sudah terdaftar')
      );
    }

    res.status(HTTP_STATUS.INTERNAL_ERROR).json(
      formatResponse('Error', error.message)
    );
  }
};

const update = async (req, res) => {
  try {
    const { id } = req.params;
    const dosen = await dosenService.updateDosen(id, req.body);

    res.status(HTTP_STATUS.OK).json(
      formatResponse('Success', 'Data dosen berhasil diupdate', dosen)
    );
  } catch (error) {
    res.status(HTTP_STATUS.INTERNAL_ERROR).json(
      formatResponse('Error', error.message)
    );
  }
};

const delete_ = async (req, res) => {
  try {
    const { id } = req.params;
    await dosenService.deleteDosen(id);

    res.status(HTTP_STATUS.OK).json(
      formatResponse('Success', 'Data dosen berhasil dihapus')
    );
  } catch (error) {
    res.status(HTTP_STATUS.NOT_FOUND).json(
      formatResponse('Error', error.message)
    );
  }
};

module.exports = {
  getAll,
  getById,
  create,
  update,
  delete: delete_
};
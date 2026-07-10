const { formatResponse } = require('../utils/formatters');
const { HTTP_STATUS } = require('../utils/constants');

const errorHandler = (error, req, res, next) => {
  console.error('Error:', error);

  if (error.code === '23505') {
    // Unique constraint violation
    return res.status(HTTP_STATUS.CONFLICT).json(
      formatResponse('Error', 'Data sudah terdaftar')
    );
  }

  if (error.code === '23503') {
    // Foreign key violation
    return res.status(HTTP_STATUS.BAD_REQUEST).json(
      formatResponse('Error', 'Referensi data tidak valid')
    );
  }

  res.status(HTTP_STATUS.INTERNAL_ERROR).json(
    formatResponse('Error', 'Terjadi kesalahan server', error.message)
  );
};

module.exports = errorHandler;
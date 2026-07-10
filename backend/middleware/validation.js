const { validationResult } = require('express-validator');
const { formatResponse } = require('../utils/formatters');
const { HTTP_STATUS } = require('../utils/constants');

const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(HTTP_STATUS.BAD_REQUEST).json(
      formatResponse('Error', 'Validasi gagal', {
        errors: errors.array()
      })
    );
  }

  next();
};

module.exports = {
  handleValidationErrors
};
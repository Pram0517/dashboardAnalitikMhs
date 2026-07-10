const formatDate = (date) => {
  return new Date(date).toISOString().split('T')[0];
};

const formatResponse = (status, message, data = null) => {
  return {
    status,
    message,
    data,
    timestamp: new Date().toISOString()
  };
};

const formatPaginationResponse = (status, message, data, page, limit, total) => {
  return {
    status,
    message,
    data,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit)
    },
    timestamp: new Date().toISOString()
  };
};

module.exports = {
  formatDate,
  formatResponse,
  formatPaginationResponse
};
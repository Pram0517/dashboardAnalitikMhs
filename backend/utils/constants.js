const USER_ROLES = {
  ADMIN: 'admin',
  DOSEN: 'dosen',
  MAHASISWA: 'mahasiswa'
};

const MAHASISWA_STATUS = {
  AKTIF: 'aktif',
  LULUS: 'lulus',
  NONAKTIF: 'nonaktif',
  CUTI: 'cuti'
};

const SKRIPSI_STATUS = {
  DRAFT: 'draft',
  SUBMITTED: 'submitted',
  UNDER_REVIEW: 'under_review',
  APPROVED: 'approved',
  REJECTED: 'rejected',
  COMPLETED: 'completed'
};

const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  INTERNAL_ERROR: 500
};

module.exports = {
  USER_ROLES,
  MAHASISWA_STATUS,
  SKRIPSI_STATUS,
  HTTP_STATUS
};
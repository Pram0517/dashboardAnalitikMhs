// BACKEND/middleware/auth.js
const { verifyToken } = require('../utils/jwt');
const { formatResponse } = require('../utils/formatters');
const { HTTP_STATUS } = require('../utils/constants');

const authMiddleware = (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
      return res.status(HTTP_STATUS.UNAUTHORIZED).json(
        formatResponse('Error', 'Token tidak ditemukan')
      );
    }

    const decoded = verifyToken(token);

    if (!decoded) {
      return res.status(HTTP_STATUS.UNAUTHORIZED).json(
        formatResponse('Error', 'Token tidak valid atau expired')
      );
    }

    req.user = decoded;
    next();
  } catch (error) {
    res.status(HTTP_STATUS.INTERNAL_ERROR).json(
      formatResponse('Error', 'Autentikasi gagal', error.message)
    );
  }
};

const adminMiddleware = (req, res, next) => {
  if (req.user?.role !== 'admin') {
    return res.status(HTTP_STATUS.FORBIDDEN).json(
      formatResponse('Error', 'Akses ditolak - hanya admin')
    );
  }
  next();
};

// ============ MIDDLEWARE UNTUK KAPRODI ATAU ADMIN ============
const kaprodiOrAdminMiddleware = (req, res, next) => {
  if (req.user?.role !== 'admin' && req.user?.role !== 'kaprodi') {
    return res.status(HTTP_STATUS.FORBIDDEN).json(
      formatResponse('Error', 'Akses ditolak - hanya admin atau kaprodi')
    );
  }
  next();
};

// ============ MIDDLEWARE UNTUK PEMILIK DATA ============
const ownerOrAdminOrKaprodiMiddleware = (req, res, next) => {
  const { nim, id } = req.params;
  const userRole = req.user?.role;
  const userNim = req.user?.nim;
  const userId = req.user?.id;

  // Admin dan Kaprodi bisa akses semua
  if (userRole === 'admin' || userRole === 'kaprodi') {
    return next();
  }

  // Mahasiswa hanya bisa akses datanya sendiri
  if (userRole === 'mahasiswa') {
    // Cek berdasarkan NIM atau ID
    if (userNim === nim || userNim === id || userId === parseInt(id)) {
      return next();
    }
  }

  return res.status(HTTP_STATUS.FORBIDDEN).json(
    formatResponse('Error', 'Akses ditolak - bukan data Anda')
  );
};

// ============ MIDDLEWARE UNTUK MAHASISWA ============
const mahasiswaMiddleware = (req, res, next) => {
  if (req.user?.role !== 'mahasiswa') {
    return res.status(HTTP_STATUS.FORBIDDEN).json(
      formatResponse('Error', 'Akses ditolak - hanya mahasiswa')
    );
  }
  next();
};

module.exports = {
  authMiddleware,
  adminMiddleware,
  kaprodiOrAdminMiddleware,
  ownerOrAdminOrKaprodiMiddleware,
  mahasiswaMiddleware
};
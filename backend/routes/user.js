// BACKEND/routes/user.js
const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../middleware/auth');
const { upload } = require('../config/cloudinary');
const {
    uploadProfileImage,
    deleteProfileImage,
    getPreferences,
    updatePreferences
} = require('../controllers/userController');

// ============ PROFILE IMAGE ROUTES ============

// Upload foto profil
router.post(
    '/profile-image',
    authMiddleware,
    upload.single('profileImage'),
    uploadProfileImage
);

// Hapus foto profil
router.delete(
    '/profile-image',
    authMiddleware,
    deleteProfileImage
);

// ============ PREFERENCES ROUTES ============

// Get user preferences
router.get('/preferences', authMiddleware, getPreferences);

// Update user preferences
router.put('/preferences', authMiddleware, updatePreferences);

module.exports = router;
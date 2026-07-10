// BACKEND/routes/auth.js
const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { authMiddleware } = require('../middleware/auth');

// Public routes
router.post('/register', authController.register);
router.post('/login', authController.login);
router.post('/reset-password', authController.requestResetPassword);
router.get('/reset-password/:token', authController.verifyResetToken);
router.post('/reset-password/confirm', authController.resetPassword);

// Protected routes (require authentication)
router.get('/profile', authMiddleware, authController.getProfile);
router.put('/profile', authMiddleware, authController.updateProfile);
router.post('/logout', authMiddleware, authController.logout);
router.put('/change-password', authMiddleware, authController.changePassword);

module.exports = router;
    const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboardController');
const { authMiddleware, kaprodiOrAdminMiddleware } = require('../middleware/auth');

// Semua route dashboard hanya bisa diakses admin dan kaprodi
router.get('/stats', authMiddleware, kaprodiOrAdminMiddleware, dashboardController.getStats);
router.get('/charts', authMiddleware, kaprodiOrAdminMiddleware, dashboardController.getCharts);
router.get('/mahasiswa', authMiddleware, kaprodiOrAdminMiddleware, dashboardController.getMahasiswaSummary);

// ============ NEW ENDPOINTS FOR DASHBOARD CHARTS ============
// GPA Trend
router.get('/gpa-trend', authMiddleware, kaprodiOrAdminMiddleware, dashboardController.getGpaTrend);

// Graduation Status
router.get('/grad-status', authMiddleware, kaprodiOrAdminMiddleware, dashboardController.getGraduationStatus);

// Problematic Courses
router.get('/problematic-courses', authMiddleware, kaprodiOrAdminMiddleware, dashboardController.getProblematicCourses);

// ============ ANGKATAN FILTER ENDPOINTS ============
// Get available angkatan for filter
router.get('/available-angkatan', 
    authMiddleware, 
    kaprodiOrAdminMiddleware, 
    dashboardController.getAvailableAngkatan
);

// Get angkatan counts for filter badges
router.get('/angkatan-counts', 
    authMiddleware, 
    kaprodiOrAdminMiddleware, 
    dashboardController.getAngkatanCounts
);

module.exports = router;
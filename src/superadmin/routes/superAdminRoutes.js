const express = require('express');
const router = express.Router();
const superAdminController = require('../controllers/superAdminController');

// Ensure you use your actual authentication middleware here
// const { verifyToken } = require('../../middlewares/authMiddleware'); 

// Dashboard Routes
router.get('/dashboard-stats', superAdminController.getDashboardStats);
router.get('/institutes', superAdminController.getInstitutes);

module.exports = router;
const express = require('express');
const router = express.Router();
const settingController = require('../controllers/settingController');
const { verifyToken } = require('../middlewares/authMiddleware');

// Get Profile Data
router.get('/profile', verifyToken, settingController.getProfile);

// Update Profile Data
router.put('/profile', verifyToken, settingController.updateProfile);

// Update Password
router.put('/password', verifyToken, settingController.updatePassword);

module.exports = router;
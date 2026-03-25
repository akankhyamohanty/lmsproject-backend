const express = require('express');
const router = express.Router();
const profileController = require('../controllers/profileController');
const { verifyFaculty } = require('../Middlewares/authMiddleware');

// This handles GET http://localhost:5000/api/faculty/profile
router.get('/', verifyFaculty, profileController.getProfile); 

// This handles GET http://localhost:5000/api/faculty/profile/me (Backup for your React call)
router.get('/me', verifyFaculty, profileController.getProfile); 

// This handles PUT http://localhost:5000/api/faculty/profile/update
router.put('/update', verifyFaculty, profileController.updateProfile);

// This handles PUT http://localhost:5000/api/faculty/profile/change-password
router.put('/change-password', verifyFaculty, profileController.changePassword);

module.exports = router;
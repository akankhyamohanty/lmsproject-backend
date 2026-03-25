const express = require('express');
const router = express.Router();
const attendanceController = require('../controllers/attendanceController');


const { verifyFaculty } = require('../Middlewares/authMiddleware'); 

// The routes now use the correct function name
router.get('/today', verifyFaculty, attendanceController.getTodayRecord);
router.get('/history', verifyFaculty, attendanceController.getAttendanceHistory);
router.post('/punch', verifyFaculty, attendanceController.handlePunch);

module.exports = router; 
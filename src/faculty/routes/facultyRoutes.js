const express = require('express');
const router = express.Router();
const multer = require('multer'); // 🎯 Added for file uploads

// 1. IMPORT CONTROLLERS
const dashboardController = require('../controllers/dashboardController');
const attendanceController = require('../controllers/attendanceController');
const profileController = require('../controllers/profileController');
const courseController = require('../controllers/courseController'); 
const assignmentController = require('../controllers/assignmentController');
const examController = require('../controllers/examController');
const salaryController = require('../controllers/salaryController');

// 2. IMPORT MIDDLEWARE
const { verifyFaculty } = require('../Middlewares/authMiddleware'); 

// 3. CONFIGURE FILE UPLOADS
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/assignments/'); // Make sure this folder exists!
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname);
  }
});
const upload = multer({ storage });

// --- DASHBOARD ---
router.get('/dashboard', verifyFaculty, dashboardController.getDashboardData);

// --- ATTENDANCE ---
router.get('/attendance/today', verifyFaculty, attendanceController.getTodayRecord);
router.post('/attendance/punch', verifyFaculty, attendanceController.handlePunch);
router.get('/attendance/history', verifyFaculty, attendanceController.getAttendanceHistory);

// --- PROFILE ---
router.get('/profile', verifyFaculty, profileController.getProfile);

// --- COURSE MANAGEMENT ---
//  Basic Course CRUD
router.get('/courses', verifyFaculty, courseController.getMyCourses);           // List all
router.get('/courses/:id', verifyFaculty, courseController.getCourseById);      // View details
router.post('/courses', verifyFaculty, courseController.createCourse);          // Create new
router.delete('/courses/:id', verifyFaculty, courseController.deleteCourse);    // Remove course

//  Course Content (Modules & Items)
router.get('/courses/:courseId/modules', verifyFaculty, courseController.getModules);   // Load modules
router.post('/courses/:courseId/modules', verifyFaculty, courseController.saveModules); // Sync modules

// ---  ASSIGNMENTS (The missing piece!) ---
router.get('/assignments', verifyFaculty, assignmentController.getAssignments);
router.post('/assignments', verifyFaculty, upload.single('file'), assignmentController.createAssignment);

router.post('/exams', verifyFaculty, examController.createExam);
router.get('/salary', verifyFaculty, salaryController.getSalaryData);

module.exports = router;
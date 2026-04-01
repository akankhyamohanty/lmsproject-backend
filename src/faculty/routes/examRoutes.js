const express = require('express');
const router = express.Router();
const examController = require('../controllers/examController');
const { verifyFaculty } = require('../Middlewares/authMiddleware');

//  Fetch all exams (Dropdown)
router.get('/', verifyFaculty, examController.getFacultyExams);

//  Create a new exam
router.post('/', verifyFaculty, examController.createExam);

//  NEW: Fetch students for a specific exam
router.get('/:id/students', verifyFaculty, examController.getExamStudents);

//  NEW: Submit marks for an exam
router.post('/:id/marks', verifyFaculty, examController.submitMarks);

module.exports = router;
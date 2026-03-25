
const express = require('express');
const router = express.Router();
const academicController = require('../controllers/academicController');
const { verifyToken } = require('../middlewares/authMiddleware');

router.get('/departments', verifyToken, academicController.getDepartments);
router.post('/departments', verifyToken, academicController.addDepartment);

router.get('/courses', verifyToken, academicController.getCourses);
router.post('/courses', verifyToken, academicController.addCourse);

router.get('/syllabi', verifyToken, academicController.getSyllabi);
router.post('/syllabi', verifyToken, academicController.addSyllabus);

module.exports = router;
const express = require('express');
const router = express.Router();
const facultyController = require('../controllers/facultyController');
const { verifyToken } = require('../middlewares/authMiddleware');

// GET request to fetch the list
router.get('/', verifyToken, facultyController.getAllFaculty);

// POST request to add a new faculty member
router.post('/', verifyToken, facultyController.addFaculty);

module.exports = router;
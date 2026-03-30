const StudentModel = require('../models/studentModel');
const bcrypt = require('bcryptjs'); // 🌟 REQUIRED: Import bcrypt to encrypt the password

// Fetch existing students
exports.getAllStudents = async (req, res) => {
  try {
    const instituteCode = req.user.code; 
    const students = await StudentModel.getStudentsByInstitute(instituteCode);
    
    res.status(200).json({ success: true, students });
  } catch (err) {
    console.error("Fetch Students Error:", err);
    res.status(500).json({ success: false, message: 'Server error fetching students' });
  }
};

// Add new student
exports.addStudent = async (req, res) => {
  try {
    // 🌟 1. Extract the 'password' from the frontend request
    const { name, email, phone, rollNo, password } = req.body;
    
    const instituteCode = req.user.code; 
    
    const nameParts = name ? name.split(' ') : ['Unknown'];
    const first_name = nameParts[0];
    const last_name = nameParts.slice(1).join(' ');

    // 🌟 2. Validate that a password was provided
    if (!password) {
      return res.status(400).json({ 
        success: false, 
        message: "A default password is required to create a student account." 
      });
    }

    // 🌟 3. Encrypt (Hash) the password securely
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // 🌟 4. Pass the hashed password down to your Model
    await StudentModel.createStudent({
      instituteCode, 
      rollNo,
      first_name,
      last_name,
      email,
      phone,
      password_hash: hashedPassword // Pass the secure hash, NOT the plain text
    });

    res.status(201).json({ success: true, message: "Student added successfully!" });
  } catch (err) {
    console.error("Add Student Error:", err);
    if (err.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({ success: false, message: "Email or Student Code already exists in database." });
    }
    res.status(500).json({ success: false, message: "Error adding student" });
  }
};
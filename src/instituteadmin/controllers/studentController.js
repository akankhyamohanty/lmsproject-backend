const StudentModel = require('../models/studentModel');

// Fetch existing students
exports.getAllStudents = async (req, res) => {
  try {
    // 👈 We now grab the logged-in admin's institute code
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
    const { name, email, phone, rollNo } = req.body;
    
    // 👈 Grab the institute code from the logged-in user's token
    const instituteCode = req.user.code; 
    
    const nameParts = name ? name.split(' ') : ['Unknown'];
    const first_name = nameParts[0];
    const last_name = nameParts.slice(1).join(' ');

    await StudentModel.createStudent({
      instituteCode, 
      rollNo,
      first_name,
      last_name,
      email,
      phone
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
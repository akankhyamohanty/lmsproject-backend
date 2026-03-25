const FacultyModel = require('../models/facultyModel');
const bcrypt = require('bcryptjs'); // 👈 Required for secure password hashing

// Fetch existing faculty
exports.getAllFaculty = async (req, res) => {
  try {
    const instituteCode = req.user.code; 
    const faculty = await FacultyModel.getFacultyByInstitute(instituteCode);

    res.status(200).json({
      success: true,
      faculty: faculty
    });
  } catch (err) {
    console.error("Fetch Faculty Error:", err);
    res.status(500).json({ success: false, message: 'Server error fetching faculty' });
  }
};

// Add new faculty
exports.addFaculty = async (req, res) => {
  try {
    // 🧩 FIXED: Extract both 'email' AND 'password' from the frontend request
    const { empId, name, email, password, designation, dept } = req.body;
    const instituteCode = req.user.code;

    // 🧩 FIXED: Ensure all fields are provided
    if (!empId || !name || !email || !password || !designation || !dept) {
      return res.status(400).json({ success: false, message: "All fields, including email and password, are required" });
    }

    // 🔒 SECURE: Hash the password before sending it to the database
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    await FacultyModel.createFaculty({
      institute_code: instituteCode,
      empId,
      name,
      email,
      password: hashedPassword, // 🧩 FIXED: Pass the scrambled password down to the Model
      designation,
      dept
    });

    res.status(201).json({ success: true, message: "Faculty added successfully!" });
  } catch (err) {
    console.error("Add Faculty Error:", err);
    
    // Handle MySQL Duplicate Entry error (if emp_id OR email already exists)
    if (err.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({ success: false, message: "Employee ID or Email already exists in the system." });
    }
    res.status(500).json({ success: false, message: "Error adding faculty member" });
  }
};
const db = require('../../config/db');

const StudentModel = {
  // Fetch existing students from the complex table
  async getStudentsByInstitute(instituteCode) {
    const [rows] = await db.query(
      `SELECT 
        id, 
        student_code as rollNo, 
        first_name as firstName, 
        last_name as lastName, 
        CONCAT(first_name, ' ', COALESCE(last_name, '')) as name, 
        email, 
        phone, 
        status,
        type,
        course,
        standard_name as standard,
        section,
        academic_year as year,
        dob,
        gender,
        aadhar,
        pan,
        documents,
        address
       FROM students
       WHERE institute_id = (SELECT id FROM institutes WHERE institute_code = ?)`,
      [instituteCode]
    );
    return rows;
  },

  // Add a new student to the complex table
  async createStudent(data) {
    const query = `
      INSERT INTO students (
        institute_id, student_code, first_name, last_name, 
        email, phone, documents, address, password_hash, status
      ) VALUES (
        (SELECT id FROM institutes WHERE institute_code = ?), 
        ?, ?, ?, ?, ?, ?, ?, ?, ?
      )
    `;
    
    const values = [
      data.instituteCode, 
      data.rollNo, 
      data.first_name, 
      data.last_name, 
      data.email, 
      data.phone,
      '{}', 
      '{}', 
      data.password_hash, // 🌟 FIXED: Now it saves the secure hash from the controller!
      'Active' 
    ];
    
    const [result] = await db.query(query, values);
    return result;
  }
};

module.exports = StudentModel;
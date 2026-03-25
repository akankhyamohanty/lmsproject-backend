const db = require('../../config/db');

const FacultyModel = {
  // 1. Fetch existing faculty 
  async getFacultyByInstitute(institute_code) {
    const [rows] = await db.query(
      `SELECT id, emp_id as empId, name, email, designation, dept, status, created_at 
       FROM faculty 
       WHERE institute_code = ?`, 
      [institute_code]
    );
    return rows;
  },

  // 2. Add a new faculty member
  async createFaculty(data) {
    // 🧩 FIXED: Added 'password' to the SQL query string
    // Notice there are now 7 question marks for 7 values!
    const query = `
      INSERT INTO faculty (institute_code, emp_id, name, email, password, designation, dept) 
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `;
    
    const values = [
      data.institute_code,
      data.empId,
      data.name,
      data.email,      
      data.password,  
      data.designation,
      data.dept
    ];
    
    const [result] = await db.query(query, values);
    return result;
  }
};

module.exports = FacultyModel;
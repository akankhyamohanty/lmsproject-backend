const db = require('../../config/db');

const ExamModel = {
  async getExams(instituteCode) {
    const [rows] = await db.query(
      `SELECT 
        id, title, subject, exam_type as examType, semester, batch, year, 
        exam_date as examDate, start_time as startTime, duration, 
        total_marks as totalMarks, passing_marks as passingMarks,
        question_paper_path -- 👈 Added this so the frontend knows if a PDF exists
       FROM exams 
       WHERE institute_code = ? 
       ORDER BY exam_date ASC, start_time ASC`,
      [instituteCode]
    );
    return rows;
  },

  // 🚀 NEW: Fetch a single exam (used for downloading)
  async getExamById(id, instituteCode) {
    const [rows] = await db.query(
      `SELECT * FROM exams WHERE id = ? AND institute_code = ?`,
      [id, instituteCode]
    );
    return rows[0];
  },

 async addExam(data) {
    const query = `
      INSERT INTO exams (
        institute_code, title, subject, exam_type, semester, batch, 
        year, exam_date, start_time, duration, total_marks, passing_marks, venue, question_paper_path
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    const values = [
      data.instituteCode, data.title, data.subject, data.examType, data.semester, 
      data.batch, data.year, data.examDate, data.startTime, data.duration, 
      data.totalMarks, data.passingMarks, data.venue, data.question_paper_path 
    ];
    const [result] = await db.query(query, values);
    return result.insertId;
},

  async deleteExam(id, instituteCode) {
    const [result] = await db.query(
      `DELETE FROM exams WHERE id = ? AND institute_code = ?`,
      [id, instituteCode]
    );
    return result.affectedRows;
  }
};

module.exports = ExamModel;
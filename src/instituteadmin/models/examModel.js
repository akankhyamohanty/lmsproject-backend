const db = require('../../config/db');

const ExamModel = {
  // 🎯 Updated to use instituteId so it matches Dashboard logic
  async getExams(instituteId, instituteCode) {
    const [rows] = await db.query(
      `SELECT 
        id, title, subject, exam_type as examType, semester, batch, year, 
        exam_date as examDate, start_time as startTime, duration, 
        total_marks as totalMarks, passing_marks as passingMarks,
        question_paper_path 
       FROM exams 
       WHERE institute_id = ? OR institute_code = ? 
       ORDER BY exam_date ASC, start_time ASC`,
      [instituteId, instituteCode]
    );
    return rows;
  },

  // 🎯 Updated to verify by numeric ID
  async getExamById(id, instituteId) {
    const [rows] = await db.query(
      `SELECT * FROM exams WHERE id = ? AND institute_id = ?`,
      [id, instituteId]
    );
    return rows[0];
  },

  async addExam(data) {
    const query = `
      INSERT INTO exams (
        institute_id, institute_code, title, subject, exam_type, semester, batch, 
        year, exam_date, start_time, duration, total_marks, passing_marks, venue, question_paper_path
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    const values = [
      data.instituteId, // 🚀 THE FIX: Now saving the ID (4)
      data.instituteCode, 
      data.title, 
      data.subject, 
      data.examType, 
      data.semester, 
      data.batch, 
      data.year, 
      data.examDate, 
      data.startTime, 
      data.duration, 
      data.totalMarks, 
      data.passingMarks, 
      data.venue, 
      data.question_paper_path 
    ];
    const [result] = await db.query(query, values);
    return result.insertId;
  },

  async deleteExam(id, instituteId) {
    const [result] = await db.query(
      `DELETE FROM exams WHERE id = ? AND institute_id = ?`,
      [id, instituteId]
    );
    return result.affectedRows;
  }
};

module.exports = ExamModel;
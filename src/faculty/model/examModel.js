const db = require('../../config/db'); // Double check this path points to your database config

const Exam = {
  create: (examData) => {
    return new Promise((resolve, reject) => {
      // 🎯 ADDED: question_paper_file and the 14th '?'
      const query = `
        INSERT INTO exams 
        (institute_code, title, subject, exam_type, semester, batch, year, exam_date, start_time, duration, total_marks, passing_marks, venue, question_paper_file) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `;
      db.query(query, examData, (err, result) => {
        if (err) return reject(err);
        resolve(result);
      });
    });
  },

  createQuestions: (questionsData) => {
    return new Promise((resolve, reject) => {
      const query = `
        INSERT INTO exam_questions 
        (exam_id, question_text, question_type, marks, options, correct_answer) 
        VALUES ?
      `;
      db.query(query, [questionsData], (err, result) => {
        if (err) return reject(err);
        resolve(result);
      });
    });
  }
};

module.exports = Exam;
const ExamModel = require('../models/examModel');
const path = require('path');
const fs = require('fs');

exports.getExams = async (req, res) => {
  try {
    const instituteCode = req.user.code;
    const exams = await ExamModel.getExams(instituteCode);
    res.status(200).json({ success: true, exams });
  } catch (err) {
    console.error("Get Exams Error:", err);
    res.status(500).json({ success: false, message: "Error fetching exams" });
  }
};

exports.addExam = async (req, res) => {
  try {
    const instituteCode = req.user.code;
    
    const { title, subject, examDate, startTime } = req.body;
    if (!title || !subject || !examDate || !startTime) {
      return res.status(400).json({ success: false, message: "Missing required exam details." });
    }

    // 🚀 Grab the filename if Multer successfully saved a PDF
    const filePath = req.file ? req.file.filename : null;

    // Pass the filePath to the model
    const id = await ExamModel.addExam({ 
      instituteCode, 
      ...req.body,
      question_paper_path: filePath 
    });
    
    res.status(201).json({ success: true, id, message: "Exam scheduled successfully!" });
  } catch (err) {
    console.error("Add Exam Error:", err);
    res.status(500).json({ success: false, message: "Error adding exam" });
  }
};

exports.deleteExam = async (req, res) => {
  try {
    const instituteCode = req.user.code;
    const examId = req.params.id; 

    // Optional: You could also delete the physical PDF file from the server here
    // before deleting the database record, to save hard drive space!

    const deleted = await ExamModel.deleteExam(examId, instituteCode);
    
    if (!deleted) {
      return res.status(404).json({ success: false, message: "Exam not found or unauthorized." });
    }

    res.status(200).json({ success: true, message: "Exam deleted successfully." });
  } catch (err) {
    console.error("Delete Exam Error:", err);
    res.status(500).json({ success: false, message: "Error deleting exam" });
  }
};

// 🚀 NEW: Download Paper Logic
exports.downloadPaper = async (req, res) => {
  try {
    const instituteCode = req.user.code;
    const examId = req.params.id;

    // 1. Fetch the exam from the DB to get the filename
    const exam = await ExamModel.getExamById(examId, instituteCode);
    
    if (!exam || !exam.question_paper_path) {
      return res.status(404).json({ success: false, message: "PDF not found for this exam." });
    }

    // 2. Find the physical file on the server
    const filePath = path.join(__dirname, '../../../../uploads/question_papers', exam.question_paper_path);

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ success: false, message: "File physically missing from server." });
    }

    // 3. Send it to the user's browser as a download!
    res.download(filePath); 
  } catch (err) {
    console.error("Download Error:", err);
    res.status(500).json({ success: false, message: "Error downloading file" });
  }
};
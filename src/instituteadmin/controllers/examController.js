const ExamModel = require('../models/examModel');
const path = require('path');
const fs = require('fs');

exports.getExams = async (req, res) => {
  try {
    // 🎯 Using both ID and Code for maximum query safety
    const instituteId = req.user.id; 
    const instituteCode = req.user.code;
    
    const exams = await ExamModel.getExams(instituteId, instituteCode);
    res.status(200).json({ success: true, exams });
  } catch (err) {
    console.error("Get Exams Error:", err);
    res.status(500).json({ success: false, message: "Error fetching exams" });
  }
};

exports.addExam = async (req, res) => {
  try {
    // 🚀 THE FIX: Extracting the numeric ID (4) and the string Code (KII...)
    const instituteId = req.user.id; 
    const instituteCode = req.user.code;
    
    const { title, subject, examDate, startTime } = req.body;
    
    if (!title || !subject || !examDate || !startTime) {
      return res.status(400).json({ success: false, message: "Missing required exam details." });
    }

    // Path handling for the PDF upload
    const filePath = req.file ? `/uploads/exams/${req.file.filename}` : null;

    // 🎯 Passing the ID to the model so it's no longer NULL in MySQL
    const id = await ExamModel.addExam({ 
      instituteId,       // Added this
      instituteCode, 
      title,             // Explicitly passing fields to avoid req.body pollution
      subject,
      examDate,
      startTime,
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
    const instituteId = req.user.id;
    const examId = req.params.id; 

    // Retrieve exam to get file path before deletion
    const exam = await ExamModel.getExamById(examId, instituteId);
    
    if (exam && exam.question_paper_path) {
      // Logic to delete the physical PDF from the server
      const fullPath = path.join(__dirname, '../../../../', exam.question_paper_path);
      if (fs.existsSync(fullPath)) {
        fs.unlinkSync(fullPath); 
      }
    }

    const deleted = await ExamModel.deleteExam(examId, instituteId);
    
    if (!deleted) {
      return res.status(404).json({ success: false, message: "Exam not found or unauthorized." });
    }

    res.status(200).json({ success: true, message: "Exam deleted successfully." });
  } catch (err) {
    console.error("Delete Exam Error:", err);
    res.status(500).json({ success: false, message: "Error deleting exam" });
  }
};

exports.downloadPaper = async (req, res) => {
  try {
    const instituteId = req.user.id;
    const examId = req.params.id;

    const exam = await ExamModel.getExamById(examId, instituteId);
    
    if (!exam || !exam.question_paper_path) {
      return res.status(404).json({ success: false, message: "PDF not found for this exam." });
    }

    const filePath = path.join(__dirname, '../../../../', exam.question_paper_path);

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ success: false, message: "File physically missing from server." });
    }

    res.download(filePath); 
  } catch (err) {
    console.error("Download Error:", err);
    res.status(500).json({ success: false, message: "Error downloading file" });
  }
};
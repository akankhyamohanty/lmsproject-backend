const Exam = require('../model/examModel'); 
const db = require('../../config/db'); 

// ---------------------------------------------------------
// 1. CREATE EXAM (With Question Builder)
// ---------------------------------------------------------
exports.createExam = async (req, res) => {
  try {
    const { examDetails, questions } = req.body;

    // 🛑 SAFETY CHECK: Did React actually send examDetails?
    if (!examDetails) {
      console.error("❌ CRASH PREVENTED: React did not send 'examDetails' in req.body!");
      return res.status(400).json({ success: false, message: "Missing exam details payload" });
    }

    console.log("\n--- NEW FACULTY EXAM SUBMISSION ---");
    console.log("👉 Exam Title:", examDetails.examTitle);

    const instituteCode = req.user?.institute_code || 'INST001'; 
    const semesterInt = parseInt((examDetails.semester || '').replace(/\D/g, '')) || 1; 
    
    let durationInt = 0;
    if (examDetails.duration && examDetails.duration.includes('min')) {
      durationInt = parseInt(examDetails.duration);
    } else if (examDetails.duration && examDetails.duration.includes('hour')) {
      durationInt = parseFloat(examDetails.duration) * 60;
    }

    const subjectValue = (examDetails.courseId || examDetails.subject || '').toString();

    const examValues = [
      instituteCode,
      examDetails.examTitle,
      subjectValue,
      examDetails.examType,
      semesterInt,
      examDetails.batch,
      examDetails.year,
      examDetails.date,
      examDetails.time,
      durationInt,
      parseInt(examDetails.totalMarks) || 0,
      parseInt(examDetails.passingMarks) || 0,
      examDetails.venue || '',
      null 
    ];

    // 🎯 CHOKE POINT 1: Creating Exam Header
    const examResult = await Exam.create(examValues);
    const newExamId = examResult.insertId;

    console.log("✅ Step 1: Exam Header Saved. ID is:", newExamId);

    if (questions && questions.length > 0) {
      const qValues = questions.map(q => [
        newExamId,
        q.text || q.question || '', 
        q.type || 'MCQ',
        parseInt(q.marks) || 0,
        JSON.stringify(q.options || []), 
        q.answer || ''
      ]);

      // 🎯 CHOKE POINT 2: Creating Questions
      await Exam.createQuestions(qValues);
      
      console.log("✅ Step 2: Questions Successfully inserted into DB!");
      return res.status(201).json({ success: true, message: "Exam and questions scheduled successfully!" });
    }

    return res.status(201).json({ success: true, message: "Exam scheduled successfully (No questions attached)." });

  } catch (error) {
    // 📢 LOUD ERROR LOGGING
    console.error("\n❌ ======================================");
    console.error("❌ CRITICAL DATABASE ERROR IN createExam!");
    console.error("❌ ERROR CODE:", error.code);
    console.error("❌ ERROR MESSAGE:", error.message);
    console.error("❌ FULL DETAILS:", error);
    console.error("❌ ======================================\n");
    res.status(500).json({ success: false, message: "Internal server error", error: error.message });
  }
};

// ---------------------------------------------------------
// 2. GET FACULTY EXAMS (For the Marks Entry Dropdown)
// ---------------------------------------------------------
exports.getFacultyExams = async (req, res) => {
  try {
    const instituteCode = req.user?.institute_code || 'INST001'; 
    
    // 🎯 CHOKE POINT 3: Fetching data
    const query = `
      SELECT id, title, batch, subject 
      FROM exams 
      WHERE institute_code = ? 
      ORDER BY id DESC
    `;
    
    db.query(query, [instituteCode], (err, results) => {
      if (err) {
        // 📢 LOUD ERROR LOGGING
        console.error("\n❌ ======================================");
        console.error("❌ CRITICAL DATABASE ERROR IN getFacultyExams!");
        console.error("❌ SQL QUERY:", query);
        console.error("❌ ERROR MESSAGE:", err.message);
        console.error("❌ ======================================\n");
        return res.status(500).json({ success: false, message: "Database error", error: err.message });
      }
      res.status(200).json({ success: true, data: results });
    });
  } catch (error) {
    console.error("❌ Server Error fetching exams:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// ---------------------------------------------------------
// 3. GET EXAM STUDENTS (For the Marks Entry Table)
// ---------------------------------------------------------
exports.getExamStudents = async (req, res) => {
  try {
    const examId = req.params.id;
    const instituteCode = req.user?.institute_code || 'INST001'; 
    
    // NOTE: You will need to join this with your actual students table based on the exam's batch.
    // For now, this prevents the 404 crash and returns an empty array to React.
    const query = `SELECT * FROM exam_marks WHERE exam_id = ?`;
    
    db.query(query, [examId], (err, results) => {
      if (err) return res.status(500).json({ success: false, message: "Database error" });
      res.status(200).json({ success: true, data: results });
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// ---------------------------------------------------------
// 4. SUBMIT MARKS
// ---------------------------------------------------------
exports.submitMarks = async (req, res) => {
  try {
    const examId = req.params.id;
    const { students } = req.body; // Array of students with marks

    console.log(`Saving marks for Exam ${examId}...`, students.length, "students.");
    
    // Insert DB Logic here to save `students` array to your marks table.

    res.status(200).json({ success: true, message: "Marks submitted successfully!" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error" });
  }
};
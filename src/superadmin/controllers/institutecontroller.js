const InstituteModel = require('../model/instituteModel'); 
const bcrypt = require('bcrypt');
const db = require('../../config/db'); // 🚀 ADDED: Needed for the deep-dive multi-table queries

exports.getAllInstitutes = async (req, res) => {
  try {
    const institutes = await InstituteModel.getAll();
    res.status(200).json({ success: true, count: institutes.length, data: institutes });
  } catch (err) {
    console.error('[InstituteController] getAllInstitutes:', err.message);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.getInstituteById = async (req, res) => {
  try {
    const institute = await InstituteModel.findById(req.params.id);
    if (!institute) return res.status(404).json({ success: false, message: 'Institute not found' });
    res.status(200).json({ success: true, data: institute });
  } catch (err) {
    console.error('[InstituteController] getInstituteById:', err.message);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.addInstitute = async (req, res) => {
  try {
    const { organisation, directors, legal, branches } = req.body;

    if (!organisation || !organisation.name || !organisation.email) {
      return res.status(400).json({ success: false, message: 'Organisation name and email are required' });
    }

    if (await InstituteModel.emailExists(organisation.email)) {
      return res.status(409).json({ success: false, message: 'Institute with this email already exists' });
    }

    const instituteCode = (organisation.name.substring(0, 3).toUpperCase()) + (organisation.pin || '000');

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash("password123", salt);

    const id = await InstituteModel.create({ 
      organisation, 
      directors, 
      legal, 
      branches, 
      institute_code: instituteCode,
      admin_email: organisation.email,
      password_hash: passwordHash
    });

    const doc = await InstituteModel.findById(id);

    res.status(201).json({ 
      success: true, 
      message: 'Institute added successfully', 
      data: doc 
    });
  } catch (err) {
    console.error('[InstituteController] addInstitute:', err.message);
    res.status(500).json({ success: false, message: 'Server error: ' + err.message });
  }
};

exports.updateInstitute = async (req, res) => {
  try {
    const { id } = req.params;
    if (!await InstituteModel.findById(id)) {
      return res.status(404).json({ success: false, message: 'Institute not found' });
    }
    
    const { organisation, directors, legal, branches } = req.body;
    res.status(200).json({ success: true, message: 'Institute updated successfully (Placeholder)' });
  } catch (err) {
    console.error('[InstituteController] updateInstitute:', err.message);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.toggleStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { is_active } = req.body; 
    
    if (is_active === undefined) {
      return res.status(400).json({ success: false, message: 'is_active is required' });
    }
    if (!await InstituteModel.findById(id)) {
      return res.status(404).json({ success: false, message: 'Institute not found' });
    }
    
    await InstituteModel.toggleStatus(id, is_active);
    res.status(200).json({ success: true, message: `Institute ${is_active ? 'activated' : 'deactivated'}` });
  } catch (err) {
    console.error('[InstituteController] toggleStatus:', err.message);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.deleteInstitute = async (req, res) => {
  try {
    if (!await InstituteModel.findById(req.params.id)) {
      return res.status(404).json({ success: false, message: 'Institute not found' });
    }
    await InstituteModel.delete(req.params.id);
    res.status(200).json({ success: true, message: 'Institute deleted successfully' });
  } catch (err) {
    console.error('[InstituteController] deleteInstitute:', err.message);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// ============================================================================
// 🚀 NEW: Get Full Institute Details (For Super Admin Dashboard Mini-View)
// ============================================================================
exports.getFullInstituteDetails = async (req, res) => {
  const instId = req.params.id;

  try {
    // 1. Fetch the base institute record using your existing model logic 
    // (This handles parsing the JSON columns like organisation, directors, etc.)
    const baseInstitute = await InstituteModel.findById(instId);
    
    if (!baseInstitute) {
      return res.status(404).json({ success: false, message: "Institute not found" });
    }

    // 2. Fetch all related data simultaneously for maximum speed
    // Note: Adjust table/column names if they differ slightly in your MySQL database
    const [
      [students],
      [faculty],
      [batches],
      [exams],
      [expensesAgg],
      [feesAgg]
    ] = await Promise.all([
      db.query(`SELECT id, name, roll_no AS roll, batch, status FROM students WHERE institute_id = ? LIMIT 15`, [instId]),
      db.query(`SELECT id, name, designation, dept AS subject, status FROM faculty WHERE institute_id = ? LIMIT 15`, [instId]),
      db.query(`
        SELECT id, name, course, status, 
        (SELECT COUNT(*) FROM students WHERE batch = batches.name AND institute_id = ?) AS studentCount 
        FROM batches WHERE institute_id = ? LIMIT 15
      `, [instId, instId]),
      db.query(`SELECT id, title, exam_date AS date, batch, subject, status FROM exams WHERE institute_id = ? ORDER BY exam_date DESC LIMIT 10`, [instId]),
      db.query(`SELECT SUM(amount) AS totalExpenses FROM expenses WHERE institute_id = ?`, [instId]),
      db.query(`SELECT SUM(paid_amount) AS totalRevenue FROM fee_payments WHERE institute_id = ?`, [instId]) // Assuming your table is fee_payments
    ]);

    // 3. Mold the data into the exact format the React UI expects
    const fullDetails = {
      ...baseInstitute, // Spreads organisation, directors, etc.
      name: baseInstitute.organisation?.name || baseInstitute.name, // Safely extract name from JSON if needed
      city: baseInstitute.organisation?.city || "",
      
      // Lists for the tables
      studentsList: students,
      facultyList: faculty,
      batchesList: batches,
      examsList: exams,
      
      // Stats for the top row pills
      totalStudents: students.length, 
      totalFaculty: faculty.length,
      totalBatches: batches.length,
      
      // Financials
      totalExpenses: expensesAgg[0]?.totalExpenses || 0,
      revenueCollected: feesAgg[0]?.totalRevenue || 0,
    };

    // 4. Send it to the React Dashboard
    res.json({
      success: true,
      data: fullDetails
    });

  } catch (error) {
    console.error("[InstituteController] getFullInstituteDetails:", error);
    res.status(500).json({ success: false, message: "Failed to load complete institute details." });
  }
};
const Attendance = require('../model/attendanceModel');
const db = require('../../config/db'); 

/**
 * Helper to get local date string (YYYY-MM-DD)
 * This prevents the UTC "yesterday" bug
 */
const getLocalDate = () => {
    const now = new Date();
    const offset = now.getTimezoneOffset() * 60000;
    return new Date(now - offset).toISOString().split('T')[0];
};

/**
 * 1. Get today's attendance status
 */
exports.getTodayRecord = async (req, res) => {
  try {
    const today = getLocalDate();
    const userId = req.user.id;
    
    // Ensure we check for 'faculty' type specifically
    const record = await Attendance.findByUserAndDate(userId, 'faculty', today);
    
    res.json({ success: true, data: record || null });
  } catch (err) {
    console.error("Fetch Today Error:", err.message);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

/**
 * 2. Handle Punch In/Out
 */
exports.handlePunch = async (req, res) => {
  try {
    const { type, time } = req.body; 
    const today = getLocalDate();
    const userId = req.user.id;

    console.log(`--- PUNCH REQUEST: User ${userId} | Type: ${type} | Date: ${today} ---`);

    // ==========================================
    // STEP 1: GET FACULTY'S NUMERIC INSTITUTE ID
    // ==========================================
    const [facultyRows] = await db.query(
      `SELECT f.institute_id, f.institute_code, i.id AS actual_id 
       FROM faculty f
       LEFT JOIN institutes i ON f.institute_code = i.institute_code
       WHERE f.id = ?`, 
      [userId]
    );

    if (facultyRows.length === 0) {
      return res.status(404).json({ success: false, message: "Faculty profile not found." });
    }

    // Use actual_id from the join first, fallback to f.institute_id
    const instituteId = facultyRows[0].actual_id || facultyRows[0].institute_id;

    console.log(`Linking punch to Institute ID: ${instituteId}`);

    if (!instituteId) {
      return res.status(403).json({ 
        success: false, 
        message: "Your profile is not linked to an institute. Please contact Admin." 
      });
    }

    // ==========================================
    // STEP 2: PROCESS THE PUNCH
    // ==========================================
    const record = await Attendance.findByUserAndDate(userId, 'faculty', today);

    // --- PUNCH IN ---
    if (type === 'in') {
      if (record && record.punchIn) {
        return res.status(400).json({ success: false, message: "Already punched in for today." });
      }

      const initialStatus = "Pending";

      if (!record) {
        // Insert new record
        await db.query(
          `INSERT INTO attendance (user_id, user_type, institute_id, date, punch_in, status) 
           VALUES (?, 'faculty', ?, ?, ?, ?)`,
          [userId, instituteId, today, time, initialStatus]
        );
      } else {
        // Update existing record
        await db.query(
          `UPDATE attendance SET punch_in = ?, status = ?, institute_id = ? 
           WHERE user_id = ? AND user_type = 'faculty' AND date = ?`,
          [time, initialStatus, instituteId, userId, today]
        );
      }

      console.log(`✅ Punch-in saved as PENDING for user ${userId}`);
      return res.json({ success: true, message: "Punch-in requested. Waiting for Admin approval." });
    } 

    // --- PUNCH OUT ---
    if (type === 'out') {
      if (!record || !record.punchIn) {
        return res.status(400).json({ success: false, message: "Cannot punch out without punching in first." });
      }
      
      if (record.status === 'Pending') {
        return res.status(403).json({ success: false, message: "Wait for Admin to approve your punch-in." });
      }

      if (record.punchOut) {
        return res.status(400).json({ success: false, message: "Already punched out for today." });
      }

      await db.query(
        `UPDATE attendance SET punch_out = ? WHERE user_id = ? AND user_type = 'faculty' AND date = ?`,
        [time, userId, today]
      );
      
      console.log(`✅ Punch-out saved for user ${userId}`);
      return res.json({ success: true, message: "Punched out successfully" });
    }

    return res.status(400).json({ success: false, message: "Invalid action." });

  } catch (err) {
    console.error("Punch Error Detail:", err);
    res.status(500).json({ success: false, message: "Database Error: " + err.message });
  }
};

/**
 * 3. Fetch History
 */
exports.getAttendanceHistory = async (req, res) => {
  try {
    const data = await Attendance.getHistory(req.user.id, 'faculty');
    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, message: "Error fetching history" });
  }
};
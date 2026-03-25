const SuperAdmin = require('../model/superAdminModel');

exports.getInstitutes = async (req, res) => {
  try {
    const rawRows = await SuperAdmin.getAllInstitutes();

    const formattedInstitutes = rawRows.map(row => {
      // 1. Bulletproof JSON Parsing
      let org = {};
      if (row.organisation) {
        try {
          org = typeof row.organisation === 'string' ? JSON.parse(row.organisation) : row.organisation;
        } catch (e) {
          console.error("Error parsing organisation JSON for ID", row.id);
        }
      }

      return {
        id: row.id,
        institute_code: row.institute_code,
        // 2. Extract exactly what your database uses
        name: org?.name || "N/A", 
        type: org?.type || "Institute", 
        city: org?.city || "N/A",
        state: org?.state || "N/A",
        address: org?.address1 || "No Address Provided",
        
        status: row.status || "Active",
        plan: row.plan || "Premium",
        email: org?.email || row.admin_email || "N/A",
        phone: org?.phone || row.admin_phone || "N/A",
        joined: row.joinedDate || "-",
        
        // UI Placeholders for the detail view
        students: 0,
        teachers: 0,
        revenue: "$0/mo",
        subscriptionEnds: "TBD",
        rating: 0,
        attendance: 0,
        feeCollected: 0,
        feeStructure: [],
        faculty: [],
        studentAttendance: []
      };
    });

    res.json({ success: true, data: formattedInstitutes });
  } catch (err) {
    console.error("Format Error:", err.message);
    res.status(500).json({ success: false, message: "Error parsing institute data." });
  }
};

exports.getDashboardStats = async (req, res) => {
  try {
    const stats = await SuperAdmin.getDashboardStats();
    res.json({ 
      success: true, 
      data: { ...stats, monthlyRevenue: 0, expiringSubscriptions: 0 } 
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
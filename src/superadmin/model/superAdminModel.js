const db = require('../../config/db');

const SuperAdmin = {
  // 1. Fetch Aggregated Stats
  getDashboardStats: async () => {
    try {
      const queries = [
        db.query(`SELECT COUNT(*) as count FROM institutes`),
        db.query(`SELECT COUNT(*) as count FROM institutes WHERE status = 'Active'`),
        db.query(`SELECT COUNT(*) as count FROM institutes WHERE status = 'Suspended'`),
        db.query(`SELECT COUNT(*) as count FROM faculty`), 
        db.query(`SELECT COUNT(*) as count FROM students`)
      ];

      const results = await Promise.all(queries);

      return {
        totalInstitutes: results[0][0][0].count || 0,
        activeInstitutes: results[1][0][0].count || 0,
        suspendedInstitutes: results[2][0][0].count || 0,
        totalTeachers: results[3][0][0].count || 0,
        totalStudents: results[4][0][0].count || 0,
      };
    } catch (err) {
      throw new Error("Database Stats Error: " + err.message);
    }
  },

  // 2. Fetch All Institutes (Selecting JSON columns)
  getAllInstitutes: async () => {
    try {
      const [rows] = await db.query(
        `SELECT 
          id, 
          organisation, 
          status, 
          plan, 
          institute_code, 
          admin_email, 
          admin_phone,
          DATE_FORMAT(created_at, '%b %Y') as joinedDate
         FROM institutes 
         ORDER BY created_at DESC`
      );
      return rows;
    } catch (err) {
      throw new Error("Database Institute Fetch Error: " + err.message);
    }
  }
};

module.exports = SuperAdmin;
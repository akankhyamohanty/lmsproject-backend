const db = require('../../config/db');

const SettingModel = {
  // Fetch profile details
  async getProfile(instituteId) {
    const [rows] = await db.query(
      `SELECT id, admin_name AS name, admin_email AS email, admin_phone AS phone 
       FROM institutes WHERE id = ?`,
      [instituteId]
    );
    return rows[0];
  },

  // Update profile details
  async updateProfile(instituteId, data) {
    const [result] = await db.query(
      `UPDATE institutes 
       SET admin_name = ?, admin_email = ?, admin_phone = ? 
       WHERE id = ?`,
      [data.name, data.email, data.phone, instituteId]
    );
    return result.affectedRows;
  },

  // Fetch full user record (needed to verify current password)
  async getAuthDetails(instituteId) {
    const [rows] = await db.query(
      `SELECT admin_password_hash AS password 
       FROM institutes WHERE id = ?`,
      [instituteId]
    );
    return rows[0];
  },

  // Update password
  async updatePassword(instituteId, hashedPassword) {
    const [result] = await db.query(
      `UPDATE institutes 
       SET admin_password_hash = ? 
       WHERE id = ?`,
      [hashedPassword, instituteId]
    );
    return result.affectedRows;
  }
};

module.exports = SettingModel;
const SettingModel = require('../models/settingModel');
const bcrypt = require('bcryptjs'); // Make sure you have this installed

exports.getProfile = async (req, res) => {
  try {
    const instituteId = req.user.id || req.user.instituteId;
    const profile = await SettingModel.getProfile(instituteId);
    
    if (!profile) {
      return res.status(404).json({ success: false, message: "Profile not found" });
    }
    
    res.json({ success: true, profile });
  } catch (err) {
    console.error("SQL ERROR in getProfile:", err.message);
    res.status(500).json({ success: false, message: "Failed to fetch profile" });
  }
};

exports.updateProfile = async (req, res) => {
  try {
    const instituteId = req.user.id || req.user.instituteId;
    const { name, email, phone } = req.body;

    await SettingModel.updateProfile(instituteId, { name, email, phone });
    res.json({ success: true, message: "Profile updated successfully" });
  } catch (err) {
    console.error("SQL ERROR in updateProfile:", err.message);
    res.status(500).json({ success: false, message: "Failed to update profile" });
  }
};

exports.updatePassword = async (req, res) => {
  try {
    const instituteId = req.user.id || req.user.instituteId;
    const { currentPassword, newPassword } = req.body;

    // 1. Fetch current password hash from DB
    const user = await SettingModel.getAuthDetails(instituteId);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    // 2. Verify current password
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ success: false, message: "Incorrect current password" });
    }

    // 3. Hash the new password and save
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    await SettingModel.updatePassword(instituteId, hashedPassword);
    res.json({ success: true, message: "Password updated successfully" });

  } catch (err) {
    console.error("SQL ERROR in updatePassword:", err.message);
    res.status(500).json({ success: false, message: "Failed to update password" });
  }
};
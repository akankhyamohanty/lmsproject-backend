const SettingModel = require('../models/settingModel');
const bcrypt = require('bcryptjs');

/**
 * 🚀 GET INSTITUTE PROFILE
 * Fetches data and parses JSON columns for the frontend
 */
exports.getProfile = async (req, res) => {
  try {
    // 1. Identify the institute (supporting different token payload styles)
    const instituteId = req.user.id || req.user.instituteId;
    
    // 2. Fetch the row from the Model
    const rawProfile = await SettingModel.getProfile(instituteId);
    
    if (!rawProfile) {
      return res.status(404).json({ success: false, message: "Profile not found" });
    }

    // 3. Helper to parse JSON columns safely 
    // (Handles cases where DB driver returns a string instead of an object)
    const parseData = (data) => {
      if (!data) return null;
      if (typeof data === 'string') return JSON.parse(data);
      return data;
    };

    // 4. Map the data to the structure required by Institute.jsx
    const formattedInstitute = {
      id: rawProfile.institute_code || "N/A",
      status: rawProfile.status || "Active",
      plan: rawProfile.plan || "Premium",
      createdAt: rawProfile.created_at,
      
      // Pulling from JSON columns
      organisation: parseData(rawProfile.organisation) || {},
      directors: parseData(rawProfile.directors) || [],
      legal: parseData(rawProfile.legal) || {},
      branches: parseData(rawProfile.branches) || []
    };

    // 🚀 CRITICAL SYNC: Ensure the Institute Name is visible
    // If the JSON 'organisation' object is empty, we use admin fields as a fallback
    if (!formattedInstitute.organisation.name) {
      formattedInstitute.organisation.name = rawProfile.admin_name || "Unnamed Institute";
    }
    if (!formattedInstitute.organisation.email) {
      formattedInstitute.organisation.email = rawProfile.admin_email;
    }

    // React specifically looks for 'institute' in the response
    res.json({ success: true, institute: formattedInstitute });

  } catch (err) {
    console.error("Controller Error (getProfile):", err);
    res.status(500).json({ success: false, message: "Failed to fetch institute data" });
  }
};

/**
 * 📝 UPDATE ADMIN PROFILE
 * Updates the flat columns for the account manager
 */
exports.updateProfile = async (req, res) => {
  try {
    const instituteId = req.user.id || req.user.instituteId;
    
    // Using the exact names from your DB columns: admin_name, admin_email, admin_phone
    const { admin_name, admin_email, admin_phone } = req.body;

    if (!admin_name || !admin_email) {
      return res.status(400).json({ success: false, message: "Name and Email are required" });
    }

    await SettingModel.updateProfile(instituteId, { admin_name, admin_email, admin_phone });
    
    res.json({ success: true, message: "Admin profile updated successfully" });
  } catch (err) {
    console.error("Controller Error (updateProfile):", err);
    res.status(500).json({ success: false, message: "Failed to update profile" });
  }
};

/**
 * 🔐 UPDATE PASSWORD
 */
exports.updatePassword = async (req, res) => {
  try {
    const instituteId = req.user.id || req.user.instituteId;
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ success: false, message: "All fields are required" });
    }

    // 1. Get current hash
    const user = await SettingModel.getAuthDetails(instituteId);
    if (!user || !user.password) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    // 2. Verify
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ success: false, message: "Incorrect current password" });
    }

    // 3. Hash & Save
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);
    
    await SettingModel.updatePassword(instituteId, hashedPassword);
    
    res.json({ success: true, message: "Password updated successfully" });
  } catch (err) {
    console.error("Controller Error (updatePassword):", err);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};
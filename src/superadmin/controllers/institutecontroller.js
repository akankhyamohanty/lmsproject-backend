const InstituteModel = require('../model/instituteModel'); // Make sure this path is correct
const bcrypt = require('bcrypt'); // Needed to hash the default password

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
    // 1. We now expect the nested JSON objects from your React form
    const { organisation, directors, legal, branches } = req.body;

    // 2. Validate that at least the basic organisation info exists
    if (!organisation || !organisation.name || !organisation.email) {
      return res.status(400).json({ success: false, message: 'Organisation name and email are required' });
    }

    // 3. Check if email already exists
    if (await InstituteModel.emailExists(organisation.email)) {
      return res.status(409).json({ success: false, message: 'Institute with this email already exists' });
    }

    // 4. Generate Institute Code (First 3 letters of name + PIN code)
    const instituteCode = (organisation.name.substring(0, 3).toUpperCase()) + (organisation.pin || '000');

    // 5. Generate default password hash ('password123') for the Institute Admin
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash("password123", salt);

    // 6. Save everything to the database
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
    
    // We expect the nested JSON objects here too
    const { organisation, directors, legal, branches } = req.body;

    // We skip email existence check here for simplicity, but you can add it back if needed
    // You will need an update method in your InstituteModel to handle the JSON updates
    
    // NOTE: If you haven't written the `update` method in InstituteModel yet to handle JSON,
    // this route will need that model update to function.
    res.status(200).json({ success: true, message: 'Institute updated successfully (Placeholder)' });
  } catch (err) {
    console.error('[InstituteController] updateInstitute:', err.message);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.toggleStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { is_active } = req.body; // Frontend sends boolean true/false
    
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
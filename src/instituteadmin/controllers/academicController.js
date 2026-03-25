const AcademicModel = require('../models/academicModel');

exports.getDepartments = async (req, res) => {
  try { res.json({ success: true, departments: await AcademicModel.getDepartments(req.user.code) }); } 
  catch (err) { console.error("Get Dept Error:", err); res.status(500).json({ success: false }); }
};

exports.addDepartment = async (req, res) => {
  try { 
    const id = await AcademicModel.addDepartment({ instituteCode: req.user.code, ...req.body });
    res.status(201).json({ success: true, id }); 
  } catch (err) { 
    console.error("Add Dept Error:", err); 
    res.status(500).json({ success: false, message: err.message }); 
  }
};

exports.getCourses = async (req, res) => {
  try { res.json({ success: true, courses: await AcademicModel.getCourses(req.user.code) }); } 
  catch (err) { console.error("Get Course Error:", err); res.status(500).json({ success: false }); }
};

exports.addCourse = async (req, res) => {
  try { 
    const id = await AcademicModel.addCourse({ instituteCode: req.user.code, ...req.body });
    res.status(201).json({ success: true, id }); 
  } catch (err) { 
    console.error("Add Course Error:", err.sqlMessage || err); 
    res.status(500).json({ success: false, message: err.sqlMessage }); 
  }
};

exports.getSyllabi = async (req, res) => {
  try { res.json({ success: true, syllabi: await AcademicModel.getSyllabi(req.user.code) }); } 
  catch (err) { console.error("Get Syllabi Error:", err); res.status(500).json({ success: false }); }
};

exports.addSyllabus = async (req, res) => {
  try { 
    const id = await AcademicModel.addSyllabus({ instituteCode: req.user.code, ...req.body });
    res.status(201).json({ success: true, id }); 
  } catch (err) { 
    console.error("Add Syllabus Error:", err.sqlMessage || err); 
    res.status(500).json({ success: false, message: err.sqlMessage }); 
  }
};
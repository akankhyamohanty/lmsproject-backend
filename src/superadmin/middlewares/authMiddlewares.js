const jwt = require('jsonwebtoken');
const AdminModel = require('../model/adminModel');

const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Not authorized — no token provided',
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const admin   = await AdminModel.findById(decoded.id);

    if (!admin || !admin.is_active) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized — admin not found or inactive',
      });
    }

    req.admin = { id: admin.id, role: admin.role };
    next();

  } catch (err) {
    return res.status(401).json({
      success: false,
      message: 'Not authorized — token invalid or expired',
    });
  }
};

module.exports = protect;
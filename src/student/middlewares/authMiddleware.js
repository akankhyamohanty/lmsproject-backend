const jwt = require('jsonwebtoken');

const verifyStudent = (req, res, next) => {
  // 1. Get token from the Authorization header (Format: Bearer <token>)
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.statu (401).json({ 
      success: false, 
      message: 'Access Denied. No token provided.' 
    });
  }

  try {
    // 2. Verify the token using your Secret Key
    const verified = jwt.verify(token, process.env.JWT_SECRET || 'your_super_secret_key');
    
    // 3. Ensure the user is actually a student
    if (verified.role !== 'student') {
      return res.status(403).json({ 
        success: false, 
        message: 'Access Denied. Unauthorized role.' 
      });
    }

    // 4. Attach the user data to the request object
    req.user = verified;
    next(); // Move to the next function (the Controller)
  } catch (error) {
    res.status(403).json({ 
      success: false, 
      message: 'Invalid or expired token.' 
    });
  }
};

module.exports = { verifyStudent };
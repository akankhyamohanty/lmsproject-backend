const jwt = require('jsonwebtoken');

/**
 * Middleware to verify JWT Token
 * This protects your routes from unauthorized access
 */
const verifyToken = (req, res, next) => {
  // 1. Get the token from the 'Authorization' header
  // It usually looks like: "Bearer <token_string>"
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  // 2. If there is no token, deny access
  if (!token) {
    return res.status(401).json({ 
      success: false, 
      message: 'Access denied. No token provided.' 
    });
  }

  try {
    // 3. Verify the token using your Secret Key
    // Make sure 'JWT_SECRET' is defined in your .env file!
    const secret = process.env.JWT_SECRET || 'fallback_secret_key';
    const decoded = jwt.verify(token, secret);

    // 4. Attach the user data to the request object (req.user)
    // This is how the controller knows the admin's ID and Institute Code
    req.user = decoded;

    // 5. Move to the next function (the Controller)
    next();
  } catch (err) {
    console.error("JWT Verification Error:", err.message);
    return res.status(403).json({ 
      success: false, 
      message: 'Invalid or expired token.' 
    });
  }
};

// CRITICAL: Export it exactly like this so the Routes can find it
module.exports = { verifyToken };
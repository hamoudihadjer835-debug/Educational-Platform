const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Protect routes
const protect = async (req, res, next) => {
  let token;
  console.log('Auth middleware - checking authorization');
  console.log('Headers:', req.headers);

  // Check if token exists in headers
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      // Get token from header
      token = req.headers.authorization.split(' ')[1];
      console.log('Token found:', token ? (token.substring(0, 10) + '...') : 'null');

      if (!token) {
        console.error('Token is empty');
        return res.status(401).json({ success: false, message: 'Not authorized, empty token' });
      }

      // Verify token
      let decoded;
      try {
        decoded = jwt.verify(token, process.env.JWT_SECRET);
        console.log('Token verified, decoded:', decoded);
      } catch (jwtError) {
        console.error('JWT verification failed:', jwtError.message);
        return res.status(401).json({ success: false, message: 'Token verification failed: ' + jwtError.message });
      }

      if (!decoded || !decoded.id) {
        console.error('Invalid token payload, missing ID');
        return res.status(401).json({ success: false, message: 'Invalid token payload' });
      }

      // Get user from token
      const user = await User.findById(decoded.id).select('-password');
      if (!user) {
        console.error('User not found for token ID:', decoded.id);
        return res.status(401).json({ success: false, message: 'User not found' });
      }

      console.log('User found:', user.firstName, user.lastName, '- Role:', user.role);
      req.user = user;

      next();
    } catch (error) {
      console.error('Auth middleware error:', error.message);
      return res.status(401).json({ success: false, message: 'Authentication error: ' + error.message });
    }
  } else {
    console.error('No authorization header or Bearer token');
    return res.status(401).json({ success: false, message: 'Not authorized, no token' });
  }
};

module.exports = { protect };

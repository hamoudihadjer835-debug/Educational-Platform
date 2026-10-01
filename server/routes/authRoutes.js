const express = require('express');
const {
  register,
  login,
  getMe,
  updateProfile,
  changePassword,
  getSecurityQuestions,
  resetPasswordWithSecurity,
  setSecurityQuestions
} = require('../controllers/authController');
const { protect } = require('../middlewares/authMiddleware');

const router = express.Router();

// Public routes
router.post('/register', register);
router.post('/login', login);
router.get('/security-questions/:username', getSecurityQuestions);
router.post('/reset-password-with-security', resetPasswordWithSecurity);

// Special route for setting security questions during registration
// This route checks for email in the request body instead of using the auth middleware
router.put('/register-security-questions', setSecurityQuestions);

// Protected routes
router.get('/me', protect, getMe);
router.put('/profile', protect, updateProfile);
router.put('/password', protect, changePassword);
router.put('/security-questions', protect, setSecurityQuestions);

module.exports = router;

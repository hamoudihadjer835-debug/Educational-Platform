// Role-based access control middleware
const authorize = (...roles) => {
  return (req, res, next) => {
    console.log('Role middleware - checking authorization for roles:', roles);

    if (!req.user) {
      console.error('Role middleware - No user in request');
      return res.status(401).json({
        success: false,
        message: 'User not authenticated'
      });
    }

    console.log('Role middleware - User role:', req.user.role);

    if (!roles.includes(req.user.role)) {
      console.error(`Role middleware - User role ${req.user.role} not in allowed roles:`, roles);
      return res.status(403).json({
        success: false,
        message: `User role ${req.user.role} is not authorized to access this route`
      });
    }

    // Check if user is approved (for teachers and students)
    if ((req.user.role === 'teacher' || req.user.role === 'student') && !req.user.isApproved) {
      console.error('Role middleware - User not approved');
      return res.status(403).json({
        success: false,
        message: 'Your account is pending approval by an administrator'
      });
    }

    console.log('Role middleware - Authorization successful');
    next();
  };
};

module.exports = { authorize };

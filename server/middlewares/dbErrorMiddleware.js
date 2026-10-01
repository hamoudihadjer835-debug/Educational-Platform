// Middleware to handle database connection errors
const dbErrorMiddleware = (req, res, next) => {
  // Check if database is connected
  if (!global.dbConnected) {
    // Database connection is required for all API routes
    return res.status(503).json({
      success: false,
      error: 'Database Connection Error',
      message: 'The server cannot connect to the database. Please check your connection and try again.',
      details: 'The application requires a working database connection to function properly.'
    });
  }

  // If database is connected, proceed to the actual handler
  next();
};

module.exports = dbErrorMiddleware;

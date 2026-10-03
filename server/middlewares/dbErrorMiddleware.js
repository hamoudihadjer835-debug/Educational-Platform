const dbErrorMiddleware = async (req, res, next) => {
  if (global.dbConnected) {
    return next();
  }

  if (global.dbConnectionPromise) {
    try {
      await global.dbConnectionPromise;

      if (global.dbConnected) {
        return next();
      }
    } catch (error) {
      console.error('Database connection failed in middleware:', error.message);
    }
  }

  return res.status(503).json({
    success: false,
    error: 'Database Connection Error',
    message: 'The server cannot connect to the database. Please check your connection and try again.',
    details: 'The application requires a working database connection to function properly.'
  });
};

module.exports = dbErrorMiddleware;v
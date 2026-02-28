/**
 * errorHandler.js — Global Express error handling middleware.
 * Must be registered LAST with app.use().
 */
function errorHandler(err, req, res, next) {
  console.error(`[${new Date().toISOString()}] Error on ${req.method} ${req.path}:`, err.message);

  const statusCode = err.statusCode || err.status || 500;

  res.status(statusCode).json({
    success: false,
    error: process.env.NODE_ENV === 'production'
      ? 'An internal server error occurred.'
      : err.message,
  });
}

module.exports = errorHandler;
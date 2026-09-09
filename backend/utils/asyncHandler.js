// Wraps async route handlers so rejected promises are passed to the
// error-handling middleware automatically.
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

module.exports = asyncHandler;

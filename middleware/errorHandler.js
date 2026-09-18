const errorHandler = (err, req, res, next) => {
  console.error(err);

  if (err.name === "ValidationError") {
    const errors = Object.values(err.errors).map((e) => ({ field: e.path, message: e.message }));
    return res.status(400).json({ success: false, message: "Validation failed", errors });
  }

  if (err.code === 11000) {
    const field = Object.keys(err.keyPattern || {})[0] || "field";
    return res.status(409).json({ success: false, message: `${field} already exists` });
  }

  if (err.name === "CastError") {
    return res.status(400).json({ success: false, message: "Invalid resource ID" });
  }

  const status = err.statusCode || err.status || 500;
  res.status(status).json({
    success: false,
    message: status === 500 ? "Internal server error" : err.message,
  });
};

module.exports = errorHandler;

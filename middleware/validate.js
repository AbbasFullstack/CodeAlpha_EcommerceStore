const validate = (schema) => (req, res, next) => {
  const errors = [];

  for (const [field, rules] of Object.entries(schema)) {
    const value = req.body?.[field];

    if (rules.required && (value === undefined || value === null || value === "")) {
      errors.push({ field, message: rules.message || `${field} is required` });
      continue;
    }

    if (value === undefined || value === null) continue;

    if (rules.type && typeof value !== rules.type) {
      errors.push({ field, message: `${field} must be a ${rules.type}` });
      continue;
    }

    if (rules.minLength && value.length < rules.minLength) {
      errors.push({ field, message: `${field} must be at least ${rules.minLength} characters` });
    }

    if (rules.maxLength && value.length > rules.maxLength) {
      errors.push({ field, message: `${field} cannot exceed ${rules.maxLength} characters` });
    }

    if (rules.min !== undefined && Number(value) < rules.min) {
      errors.push({ field, message: `${field} cannot be less than ${rules.min}` });
    }

    if (rules.integer && (!Number.isInteger(value) || value < 1)) {
      errors.push({ field, message: `${field} must be a positive integer` });
    }

    if (rules.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
      errors.push({ field, message: "Please provide a valid email address" });
    }
  }

  if (errors.length) return res.status(400).json({ success: false, message: "Validation failed", errors });
  next();
};

module.exports = validate;

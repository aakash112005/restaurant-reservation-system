const { validationResult } = require('express-validator');

// Runs after an express-validator chain; converts validation failures into
// a single, consistently-shaped 400 response instead of letting bad data
// reach the controller.
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400);
    const message = errors
      .array()
      .map((e) => e.msg)
      .join(' ');
    return next(new Error(message));
  }
  next();
};

module.exports = validate;

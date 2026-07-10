const express = require('express');
const { body } = require('express-validator');
const validate = require('../middleware/validate');
const { protect } = require('../middleware/auth');
const { signup, login, adminLogin, getMe } = require('../controllers/authController');

const router = express.Router();

const signupRules = [
  body('name').trim().notEmpty().withMessage('Name is required.'),
  body('email').isEmail().withMessage('A valid email is required.'),
  body('password')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters long.'),
];

const loginRules = [
  body('email').isEmail().withMessage('A valid email is required.'),
  body('password').notEmpty().withMessage('Password is required.'),
];

router.post('/signup', signupRules, validate, signup);
router.post('/login', loginRules, validate, login);
router.post('/admin/login', loginRules, validate, adminLogin);
router.get('/me', protect, getMe);

module.exports = router;

const jwt = require('jsonwebtoken');
const asyncHandler = require('express-async-handler');
const User = require('../models/User');
const { ROLES } = require('../utils/constants');

const generateToken = (user) =>
  jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });

// @route  POST /api/auth/signup
// @desc   Public self-service signup. Always creates a CUSTOMER account —
//         the role field is never taken from the request body, so a user
//         can never sign themselves up as an admin.
// @access Public
const signup = asyncHandler(async (req, res) => {
  const { name, email, password, phone } = req.body;

  const existing = await User.findOne({ email: email.toLowerCase() });
  if (existing) {
    res.status(409);
    throw new Error('An account with this email already exists.');
  }

  const user = await User.create({
    name,
    email,
    password,
    phone,
    role: ROLES.CUSTOMER,
  });

  const token = generateToken(user);
  res.status(201).json({ success: true, token, user: user.toSafeObject() });
});

// @route  POST /api/auth/login
// @desc   Customer login. Rejects admin accounts so admins are forced to
//         use the separate /api/auth/admin/login endpoint.
// @access Public
const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email: email.toLowerCase() }).select('+password');
  if (!user || !(await user.comparePassword(password))) {
    res.status(401);
    throw new Error('Invalid email or password.');
  }

  if (user.role !== ROLES.CUSTOMER) {
    res.status(403);
    throw new Error('Please use the admin login page to access this account.');
  }

  const token = generateToken(user);
  res.status(200).json({ success: true, token, user: user.toSafeObject() });
});

// @route  POST /api/auth/admin/login
// @desc   Admin-only login. There is no public admin signup endpoint —
//         admin accounts are created exclusively via the seed script
//         (see backend/seed/seed.js) directly against the database.
// @access Public
const adminLogin = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email: email.toLowerCase() }).select('+password');
  if (!user || !(await user.comparePassword(password))) {
    res.status(401);
    throw new Error('Invalid email or password.');
  }

  if (user.role !== ROLES.ADMIN) {
    res.status(403);
    throw new Error('This account does not have administrator access.');
  }

  const token = generateToken(user);
  res.status(200).json({ success: true, token, user: user.toSafeObject() });
});

// @route  GET /api/auth/me
// @access Private
const getMe = asyncHandler(async (req, res) => {
  res.status(200).json({ success: true, user: req.user.toSafeObject() });
});

module.exports = { signup, login, adminLogin, getMe };

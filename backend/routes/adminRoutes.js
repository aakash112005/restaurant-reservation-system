const express = require('express');
const { body } = require('express-validator');
const validate = require('../middleware/validate');
const { protect, authorize } = require('../middleware/auth');
const { ROLES } = require('../utils/constants');
const {
  getAllReservations,
  updateReservationAdmin,
  cancelReservationAdmin,
} = require('../controllers/reservationController');
const {
  listAllTablesAdmin,
  createTable,
  updateTable,
  deleteTable,
} = require('../controllers/tableController');

const router = express.Router();

router.use(protect, authorize(ROLES.ADMIN));

// Reservations
router.get('/reservations', getAllReservations);
router.patch('/reservations/:id', updateReservationAdmin);
router.delete('/reservations/:id', cancelReservationAdmin);

// Table management
const tableRules = [
  body('tableNumber').notEmpty().withMessage('Table number is required.'),
  body('capacity').isInt({ min: 1 }).withMessage('Capacity must be at least 1.'),
];

router.get('/tables', listAllTablesAdmin);
router.post('/tables', tableRules, validate, createTable);
router.patch('/tables/:id', updateTable);
router.delete('/tables/:id', deleteTable);

module.exports = router;

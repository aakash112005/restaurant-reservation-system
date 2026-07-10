const express = require('express');
const { body } = require('express-validator');
const validate = require('../middleware/validate');
const { protect, authorize } = require('../middleware/auth');
const { ROLES } = require('../utils/constants');
const {
  createReservation,
  getMyReservations,
  cancelMyReservation,
} = require('../controllers/reservationController');

const router = express.Router();

const createRules = [
  body('tableId').notEmpty().withMessage('A table selection is required.'),
  body('date').matches(/^\d{4}-\d{2}-\d{2}$/).withMessage('Date must be in YYYY-MM-DD format.'),
  body('timeSlot').notEmpty().withMessage('A time slot is required.'),
  body('numberOfGuests').isInt({ min: 1 }).withMessage('Number of guests must be at least 1.'),
];

router.use(protect, authorize(ROLES.CUSTOMER));

router.post('/', createRules, validate, createReservation);
router.get('/my', getMyReservations);
router.delete('/:id', cancelMyReservation);

module.exports = router;

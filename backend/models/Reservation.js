const mongoose = require('mongoose');
const { TIME_SLOTS, RESERVATION_STATUS } = require('../utils/constants');

const reservationSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    table: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Table',
      required: true,
    },
    date: {
      // Stored as a normalized 'YYYY-MM-DD' string so comparisons never
      // suffer from timezone drift the way JS Date objects can.
      type: String,
      required: [true, 'Reservation date is required'],
      match: [/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format'],
    },
    timeSlot: {
      type: String,
      required: [true, 'Time slot is required'],
      enum: TIME_SLOTS,
    },
    numberOfGuests: {
      type: Number,
      required: [true, 'Number of guests is required'],
      min: [1, 'At least 1 guest is required'],
    },
    status: {
      type: String,
      enum: Object.values(RESERVATION_STATUS),
      default: RESERVATION_STATUS.CONFIRMED,
    },
    specialRequests: {
      type: String,
      trim: true,
      maxlength: 300,
      default: '',
    },
    cancelledAt: {
      type: Date,
      default: null,
    },
    cancelledBy: {
      type: String,
      enum: ['customer', 'admin', null],
      default: null,
    },
  },
  { timestamps: true }
);

// Speeds up the "find conflicting reservation" query used on every booking
// attempt: same table + same date + same slot + still confirmed.
reservationSchema.index({ table: 1, date: 1, timeSlot: 1, status: 1 });
reservationSchema.index({ user: 1, date: -1 });

// Belt-and-braces guard against race conditions: even if two requests pass
// the application-level availability check at the exact same millisecond,
// this PARTIAL UNIQUE index (only enforced while status === 'confirmed')
// makes a true double-booking impossible at the database layer. A second
// concurrent insert throws a duplicate-key error (11000), which the
// centralized error handler turns into a friendly 409 response.
reservationSchema.index(
  { table: 1, date: 1, timeSlot: 1 },
  {
    unique: true,
    partialFilterExpression: { status: 'confirmed' },
    name: 'unique_confirmed_table_slot',
  }
);

module.exports = mongoose.model('Reservation', reservationSchema);

const asyncHandler = require('express-async-handler');
const Reservation = require('../models/Reservation');
const Table = require('../models/Table');
const { TIME_SLOTS, RESERVATION_STATUS, ROLES } = require('../utils/constants');

const todayString = () => new Date().toISOString().slice(0, 10);

const maxAdvanceDateString = () => {
  const days = Number(process.env.MAX_ADVANCE_BOOKING_DAYS) || 60;
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
};

// @route  POST /api/reservations
// @desc   Customer creates a reservation. This is the core validation path:
//         1) date must be today or in the future (and within the booking window)
//         2) time slot must be one of the fixed slots
//         3) table must exist, be active, and have enough capacity
//         4) table must not already be booked for that date + slot
// @access Private/Customer
const createReservation = asyncHandler(async (req, res) => {
  const { tableId, date, timeSlot, numberOfGuests, specialRequests } = req.body;

  if (!TIME_SLOTS.includes(timeSlot)) {
    res.status(400);
    throw new Error('Invalid time slot selected.');
  }

  if (date < todayString()) {
    res.status(400);
    throw new Error('Reservation date cannot be in the past.');
  }

  if (date > maxAdvanceDateString()) {
    res.status(400);
    throw new Error('This date is too far in advance to book right now.');
  }

  const table = await Table.findById(tableId);
  if (!table || !table.isActive) {
    res.status(404);
    throw new Error('Selected table is not available.');
  }

  if (numberOfGuests > table.capacity) {
    res.status(400);
    throw new Error(
      `Table ${table.tableNumber} seats up to ${table.capacity} guests. Please choose a larger table or reduce the party size.`
    );
  }

  const conflict = await Reservation.findOne({
    table: tableId,
    date,
    timeSlot,
    status: RESERVATION_STATUS.CONFIRMED,
  });

  if (conflict) {
    res.status(409);
    throw new Error('That table is already booked for the selected date and time slot.');
  }

  // The unique partial index on the schema still protects against a
  // simultaneous request slipping past the check above.
  const reservation = await Reservation.create({
    user: req.user._id,
    table: tableId,
    date,
    timeSlot,
    numberOfGuests,
    specialRequests,
  });

  const populated = await reservation.populate('table');
  res.status(201).json({ success: true, reservation: populated });
});

// @route  GET /api/reservations/my
// @access Private/Customer
const getMyReservations = asyncHandler(async (req, res) => {
  const reservations = await Reservation.find({ user: req.user._id })
    .populate('table')
    .sort({ date: -1, createdAt: -1 });
  res.status(200).json({ success: true, count: reservations.length, reservations });
});

// @route  DELETE /api/reservations/:id
// @desc   Customer cancels their OWN reservation only.
// @access Private/Customer
const cancelMyReservation = asyncHandler(async (req, res) => {
  const reservation = await Reservation.findById(req.params.id);

  if (!reservation) {
    res.status(404);
    throw new Error('Reservation not found.');
  }

  if (String(reservation.user) !== String(req.user._id)) {
    res.status(403);
    throw new Error('You can only cancel your own reservations.');
  }

  if (reservation.status === RESERVATION_STATUS.CANCELLED) {
    res.status(400);
    throw new Error('This reservation is already cancelled.');
  }

  reservation.status = RESERVATION_STATUS.CANCELLED;
  reservation.cancelledAt = new Date();
  reservation.cancelledBy = 'customer';
  await reservation.save();

  res.status(200).json({ success: true, message: 'Reservation cancelled.', reservation });
});

// @route  GET /api/admin/reservations?date=YYYY-MM-DD&status=confirmed
// @desc   Admin: view all reservations, optionally filtered by date/status.
// @access Private/Admin
const getAllReservations = asyncHandler(async (req, res) => {
  const { date, status } = req.query;
  const filter = {};
  if (date) filter.date = date;
  if (status) filter.status = status;

  const reservations = await Reservation.find(filter)
    .populate('table')
    .populate('user', 'name email phone')
    .sort({ date: -1, timeSlot: 1 });

  res.status(200).json({ success: true, count: reservations.length, reservations });
});

// @route  PATCH /api/admin/reservations/:id
// @desc   Admin: update any reservation (reassign table/time/date/guests)
//         or change its status. Re-validates capacity and conflicts
//         whenever the table, date, or slot actually changes.
// @access Private/Admin
const updateReservationAdmin = asyncHandler(async (req, res) => {
  const reservation = await Reservation.findById(req.params.id);
  if (!reservation) {
    res.status(404);
    throw new Error('Reservation not found.');
  }

  const { tableId, date, timeSlot, numberOfGuests, status } = req.body;

  const nextTableId = tableId || String(reservation.table);
  const nextDate = date || reservation.date;
  const nextTimeSlot = timeSlot || reservation.timeSlot;
  const nextGuests = numberOfGuests || reservation.numberOfGuests;

  const relevantFieldsChanged =
    nextTableId !== String(reservation.table) || nextDate !== reservation.date || nextTimeSlot !== reservation.timeSlot;

  if (relevantFieldsChanged) {
    const table = await Table.findById(nextTableId);
    if (!table || !table.isActive) {
      res.status(404);
      throw new Error('Selected table is not available.');
    }
    if (nextGuests > table.capacity) {
      res.status(400);
      throw new Error(`Table ${table.tableNumber} seats up to ${table.capacity} guests.`);
    }
    const conflict = await Reservation.findOne({
      _id: { $ne: reservation._id },
      table: nextTableId,
      date: nextDate,
      timeSlot: nextTimeSlot,
      status: RESERVATION_STATUS.CONFIRMED,
    });
    if (conflict) {
      res.status(409);
      throw new Error('That table is already booked for the selected date and time slot.');
    }
  }

  reservation.table = nextTableId;
  reservation.date = nextDate;
  reservation.timeSlot = nextTimeSlot;
  reservation.numberOfGuests = nextGuests;

  if (status && Object.values(RESERVATION_STATUS).includes(status)) {
    reservation.status = status;
    if (status === RESERVATION_STATUS.CANCELLED) {
      reservation.cancelledAt = new Date();
      reservation.cancelledBy = 'admin';
    }
  }

  await reservation.save();
  const populated = await reservation.populate(['table', { path: 'user', select: 'name email phone' }]);
  res.status(200).json({ success: true, reservation: populated });
});

// @route  DELETE /api/admin/reservations/:id
// @desc   Admin cancels ANY reservation.
// @access Private/Admin
const cancelReservationAdmin = asyncHandler(async (req, res) => {
  const reservation = await Reservation.findById(req.params.id);
  if (!reservation) {
    res.status(404);
    throw new Error('Reservation not found.');
  }
  reservation.status = RESERVATION_STATUS.CANCELLED;
  reservation.cancelledAt = new Date();
  reservation.cancelledBy = 'admin';
  await reservation.save();
  res.status(200).json({ success: true, message: 'Reservation cancelled.', reservation });
});

module.exports = {
  createReservation,
  getMyReservations,
  cancelMyReservation,
  getAllReservations,
  updateReservationAdmin,
  cancelReservationAdmin,
};

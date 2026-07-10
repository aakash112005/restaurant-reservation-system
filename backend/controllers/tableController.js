const asyncHandler = require('express-async-handler');
const Table = require('../models/Table');
const Reservation = require('../models/Reservation');
const { RESERVATION_STATUS, TIME_SLOTS } = require('../utils/constants');

// @route  GET /api/tables
// @desc   List active tables. Used by the customer booking form.
// @access Private (any authenticated role)
const listTables = asyncHandler(async (req, res) => {
  const tables = await Table.find({ isActive: true }).sort({ tableNumber: 1 });
  res.status(200).json({ success: true, count: tables.length, tables });
});

// @route  GET /api/tables/availability?date=YYYY-MM-DD&timeSlot=..&guests=2
// @desc   Returns tables that can seat `guests` and have no confirmed
//         reservation for the given date + slot. This is the single
//         source of truth the booking form and the server-side create
//         endpoint both rely on, so the UI never promises something the
//         backend would then reject.
// @access Private
const checkAvailability = asyncHandler(async (req, res) => {
  const { date, timeSlot, guests } = req.query;

  if (!date || !timeSlot) {
    res.status(400);
    throw new Error('date and timeSlot query parameters are required.');
  }
  if (!TIME_SLOTS.includes(timeSlot)) {
    res.status(400);
    throw new Error('Invalid time slot.');
  }

  const guestCount = Number(guests) || 1;

  const candidateTables = await Table.find({
    isActive: true,
    capacity: { $gte: guestCount },
  }).sort({ capacity: 1 });

  const bookedTableIds = await Reservation.find({
    date,
    timeSlot,
    status: RESERVATION_STATUS.CONFIRMED,
  }).distinct('table');

  const bookedSet = new Set(bookedTableIds.map(String));
  const availableTables = candidateTables.filter((t) => !bookedSet.has(String(t._id)));

  res.status(200).json({
    success: true,
    date,
    timeSlot,
    guests: guestCount,
    availableTables,
  });
});

// @route  POST /api/admin/tables
// @access Private/Admin
const createTable = asyncHandler(async (req, res) => {
  const { tableNumber, capacity, location } = req.body;
  const table = await Table.create({ tableNumber, capacity, location });
  res.status(201).json({ success: true, table });
});

// @route  PATCH /api/admin/tables/:id
// @access Private/Admin
const updateTable = asyncHandler(async (req, res) => {
  const table = await Table.findById(req.params.id);
  if (!table) {
    res.status(404);
    throw new Error('Table not found.');
  }
  const { tableNumber, capacity, location, isActive } = req.body;
  if (tableNumber !== undefined) table.tableNumber = tableNumber;
  if (capacity !== undefined) table.capacity = capacity;
  if (location !== undefined) table.location = location;
  if (isActive !== undefined) table.isActive = isActive;
  await table.save();
  res.status(200).json({ success: true, table });
});

// @route  DELETE /api/admin/tables/:id
// @desc   Soft-deletes (deactivates) a table rather than hard-deleting it,
//         so historical reservations that reference it stay intact.
// @access Private/Admin
const deleteTable = asyncHandler(async (req, res) => {
  const table = await Table.findById(req.params.id);
  if (!table) {
    res.status(404);
    throw new Error('Table not found.');
  }
  table.isActive = false;
  await table.save();
  res.status(200).json({ success: true, message: 'Table deactivated.', table });
});

// @route  GET /api/admin/tables
// @desc   Admin view of ALL tables including inactive ones.
// @access Private/Admin
const listAllTablesAdmin = asyncHandler(async (req, res) => {
  const tables = await Table.find().sort({ tableNumber: 1 });
  res.status(200).json({ success: true, count: tables.length, tables });
});

module.exports = {
  listTables,
  checkAvailability,
  createTable,
  updateTable,
  deleteTable,
  listAllTablesAdmin,
};

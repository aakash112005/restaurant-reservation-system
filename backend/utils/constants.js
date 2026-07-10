// Fixed set of bookable time slots for the restaurant.
// Keeping slots fixed (rather than free-form times) makes overlap detection
// trivial and predictable: two reservations conflict only if they share the
// same table + date + slot. This is a deliberate simplification documented
// in the README under "Assumptions".
const TIME_SLOTS = [
  '12:00-13:30',
  '13:30-15:00',
  '18:00-19:30',
  '19:30-21:00',
  '21:00-22:30',
];

const ROLES = {
  CUSTOMER: 'customer',
  ADMIN: 'admin',
};

const RESERVATION_STATUS = {
  CONFIRMED: 'confirmed',
  CANCELLED: 'cancelled',
};

module.exports = { TIME_SLOTS, ROLES, RESERVATION_STATUS };

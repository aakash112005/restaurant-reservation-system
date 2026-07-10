const express = require('express');
const { TIME_SLOTS } = require('../utils/constants');

const router = express.Router();

// Public: lets the frontend render the same slot list the backend enforces,
// so the two never drift out of sync.
router.get('/time-slots', (req, res) => {
  res.status(200).json({ success: true, timeSlots: TIME_SLOTS });
});

module.exports = router;

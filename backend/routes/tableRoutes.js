const express = require('express');
const { protect } = require('../middleware/auth');
const { listTables, checkAvailability } = require('../controllers/tableController');

const router = express.Router();

router.use(protect);
router.get('/', listTables);
router.get('/availability', checkAvailability);

module.exports = router;

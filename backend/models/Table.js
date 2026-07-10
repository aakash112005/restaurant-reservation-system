const mongoose = require('mongoose');

const tableSchema = new mongoose.Schema(
  {
    tableNumber: {
      type: String,
      required: [true, 'Table number is required'],
      unique: true,
      trim: true,
    },
    capacity: {
      type: Number,
      required: [true, 'Seating capacity is required'],
      min: [1, 'Capacity must be at least 1'],
      max: [30, 'Capacity seems unreasonably large'],
    },
    location: {
      type: String,
      enum: ['indoor', 'outdoor', 'patio', 'private-room', 'bar'],
      default: 'indoor',
    },
    isActive: {
      type: Boolean,
      default: true, // inactive tables (e.g. under repair) are excluded from availability
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Table', tableSchema);

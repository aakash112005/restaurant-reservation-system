// One-time (or idempotent) setup script.
// Run with: npm run seed
//
// This is the ONLY way an admin account is ever created in this system —
// there is no public admin signup route. In a real production rollout you
// would run this once against your production database, then immediately
// change the password (or rotate ADMIN_PASSWORD and re-run) and remove the
// credentials from .env / chat history / anywhere else they were shared.
require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('../config/db');
const User = require('../models/User');
const Table = require('../models/Table');
const { ROLES } = require('../utils/constants');

const DEFAULT_TABLES = [
  { tableNumber: 'T1', capacity: 2, location: 'indoor' },
  { tableNumber: 'T2', capacity: 2, location: 'indoor' },
  { tableNumber: 'T3', capacity: 4, location: 'indoor' },
  { tableNumber: 'T4', capacity: 4, location: 'indoor' },
  { tableNumber: 'T5', capacity: 6, location: 'indoor' },
  { tableNumber: 'T6', capacity: 4, location: 'patio' },
  { tableNumber: 'T7', capacity: 2, location: 'patio' },
  { tableNumber: 'T8', capacity: 8, location: 'private-room' },
  { tableNumber: 'B1', capacity: 2, location: 'bar' },
  { tableNumber: 'B2', capacity: 2, location: 'bar' },
];

const seedAdmin = async () => {
  const email = (process.env.ADMIN_EMAIL || 'admin@thenightlytable.com').toLowerCase();
  const password = process.env.ADMIN_PASSWORD || 'Admin@12345';
  const name = process.env.ADMIN_NAME || 'Restaurant Owner';

  const existing = await User.findOne({ email });
  if (existing) {
    console.log(`Admin account already exists for ${email}. Skipping creation.`);
    console.log('To rotate the password, delete this user document and re-run npm run seed,');
    console.log('or update it directly in the database.');
    return;
  }

  await User.create({ name, email, password, role: ROLES.ADMIN });
  console.log('----------------------------------------------------');
  console.log('Demo admin account created:');
  console.log(`  Email:    ${email}`);
  console.log(`  Password: ${password}`);
  console.log('Change this password after first login in any real deployment.');
  console.log('----------------------------------------------------');
};

const seedTables = async () => {
  const count = await Table.countDocuments();
  if (count > 0) {
    console.log(`Tables already seeded (${count} found). Skipping.`);
    return;
  }
  await Table.insertMany(DEFAULT_TABLES);
  console.log(`Seeded ${DEFAULT_TABLES.length} tables.`);
};

const run = async () => {
  await connectDB();
  await seedAdmin();
  await seedTables();
  await mongoose.connection.close();
  process.exit(0);
};

run().catch((err) => {
  console.error('Seed script failed:', err);
  process.exit(1);
});

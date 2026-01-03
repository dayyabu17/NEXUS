const path = require('path');
const mongoose = require('mongoose');
require('dotenv').config({ path: path.resolve(__dirname, '..', '.env') });
const User = require('../models/User');

const normalizeQuery = (field) => ({
  $or: [
    { [field]: { $exists: false } },
    { [field]: null },
    { [field]: '' },
  ],
});

const run = async () => {
  try {
    const uri = process.env.MONGO_URI;

    if (!uri) {
      throw new Error('MONGO_URI is not defined in environment variables.');
    }

    await mongoose.connect(uri);
    console.log('Connected to MongoDB');

    const phoneResult = await User.updateMany(
      normalizeQuery('phoneNumber'),
      { $set: { phoneNumber: '0000000000' } },
    );
    console.log(`Phone backfill -> matched: ${phoneResult.matchedCount}, modified: ${phoneResult.modifiedCount}`);

    const regResult = await User.updateMany(
      { role: 'student', ...normalizeQuery('regNo') },
      { $set: { regNo: 'LEGACY_USER' } },
    );
    console.log(`RegNo backfill -> matched: ${regResult.matchedCount}, modified: ${regResult.modifiedCount}`);

    const addressResult = await User.updateMany(
      { role: 'student', ...normalizeQuery('address') },
      { $set: { address: 'Please update address' } },
    );
    console.log(`Address backfill -> matched: ${addressResult.matchedCount}, modified: ${addressResult.modifiedCount}`);
  } catch (error) {
    console.error('Migration failed:', error.message || error);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
};

run();

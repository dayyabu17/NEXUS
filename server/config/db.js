const mongoose = require('mongoose');
// Connect to MongoDB
/**
 * Connect to MongoDB using Mongoose.
 *
 * @description Establishes a connection to the MongoDB database configured in environment variables.
 * Exits the process on failure.
 * @returns {Promise<void>}
 */
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB Connected successfully!');
  } catch (err) {
    console.error(`MongoDB connection error: ${err.message}`);
    process.exit(1);
  }
};

module.exports = {connectDB};
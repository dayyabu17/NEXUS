const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();
const path = require('path');

// Import Routes
const authRoutes = require('./routes/authRoutes'); // Make sure this is present and correct
const adminRoutes = require('./routes/adminRoutes');

const app = express();

/**
 * Express Middleware Setup
 * - CORS: Allows cross-origin requests from the frontend.
 * - JSON Parser: Parses incoming requests with JSON payloads.
 * - URL Encoded: Parses incoming requests with URL-encoded payloads.
 * - Static Files: Serves static files from the 'public' directory.
 */
app.use(cors({
  origin: 'http://localhost:5173', // Allow your Vite frontend
  credentials: true
}));
app.use(express.json()); // Allows us to parse JSON bodies from requests
app.use(express.urlencoded({ extended: true })); // Add this for form-data parsing
app.use('/public', express.static(path.join(__dirname, 'public')));

// Routes
app.use('/api/auth', authRoutes); 
app.use('/api/admin', adminRoutes);

/**
 * Basic Route
 * Checks if the API is running.
 */
app.get('/', (req, res) => {
  res.send('Nexus API is running...');
});

/**
 * Connect to MongoDB and start the server.
 * Reads MONGO_URI from environment variables.
 * Exits process on failure.
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

connectDB(); // Call the connectDB function BEFORE starting the server

const PORT = process.env.PORT || 5000;

// Start Server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

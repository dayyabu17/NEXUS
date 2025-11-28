const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();
const path = require('path');

// Import Routes
const authRoutes = require('./routes/authRoutes'); 
const adminRoutes = require('./routes/adminRoutes');
const organizerRoutes = require('./routes/organizerRoutes');
const eventRoutes = require('./routes/eventRoutes');
const paymentRoutes = require('./routes/paymentRoutes');
const ticketRoutes = require('./routes/ticketRoutes');

/**
 * @module server
 * @description Main entry point for the Express backend server.
 */

const app = express();

// Middleware
/**
 * Enable CORS for the frontend application.
 */
app.use(cors({
  origin: 'http://localhost:5173', // Allow your Vite frontend
  credentials: true
}));

/**
 * Parse JSON request bodies.
 */
app.use(express.json({ limit: '10mb' }));

/**
 * Parse URL-encoded request bodies.
 */
app.use(express.urlencoded({ extended: true, limit: '10mb' })); 

/**
 * Serve static files from the 'public' directory.
 */
app.use('/public', express.static(path.join(__dirname, 'public')));

// Routes
/**
 * Mount authentication routes.
 */
app.use('/api/auth', authRoutes); 

/**
 * Mount admin routes.
 */
app.use('/api/admin', adminRoutes);

/**
 * Mount organizer routes.
 */
app.use('/api/organizer', organizerRoutes);

/**
 * Mount event routes.
 */
app.use('/api/events', eventRoutes);

/**
 * Mount payment routes.
 */
app.use('/api/payment', paymentRoutes);

/**
 * Mount ticket routes.
 */
app.use('/api/tickets', ticketRoutes);

/**
 * Basic health check route.
 * @route GET /
 */
app.get('/', (req, res) => {
  res.send('Nexus API is running...');
});

/**
 * Connects to the MongoDB database.
 * Uses the MONGO_URI from environment variables.
 * Exits the process on failure.
 * @async
 * @function connectDB
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

/**
 * Starts the Express server.
 */
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

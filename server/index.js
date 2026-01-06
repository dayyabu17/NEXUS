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
const payoutRoutes = require('./routes/payoutRoutes');
const userRoutes = require('./routes/userRoutes');

const app = express();

// Middleware
app.use(cors({
  origin: [
    "http://localhost:5173", // Keep this for your laptop
    "https://nexus-6753-usman-dayyabus-projects.vercel.app", // Add your specific Vercel link
    "https://nexus-6753.vercel.app"  // Add your specific Vercel link
    
  ],
  credentials: true
}));
app.use(express.json({ limit: '10mb' })); // Allows us to parse JSON bodies from requests
app.use(express.urlencoded({ extended: true, limit: '10mb' })); 
app.use('/public', express.static(path.join(__dirname, 'public')));

// Routes
app.use('/api/auth', authRoutes); 
app.use('/api/admin', adminRoutes);
app.use('/api/organizer', organizerRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/payment', paymentRoutes);
app.use('/api/tickets', ticketRoutes);
app.use('/api', payoutRoutes);
app.use('/api/users', userRoutes);

// -----------------------------------------
// SERVE STATIC ASSETS IN PRODUCTION
// -----------------------------------------
// This block ensures that when you run 'node index.js', it serves the React app
if (process.env.NODE_ENV === 'production') {
  // 1. Set static folder (where your React build lives)
  // We use '../client/dist' because we are currently in the 'server' folder
  app.use(express.static(path.join(__dirname, '../client/dist')));

  // 2. Handle React Routing (The "Catch-All" Handler)
  // We use regex /.*/ because string '*' is invalid in newer path-to-regexp versions
  app.get(/.*/, (req, res) => {
    res.sendFile(path.resolve(__dirname, '../client', 'dist', 'index.html'));
  });
} else {
  // Fallback for Development mode
  app.get('/', (req, res) => {
    res.send('API is running... (Dev Mode)');
  });
}
// -----------------------------------------

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

connectDB(); // Call the connectDB function BEFORE starting the server

const PORT = process.env.PORT || 5000;

// Start Server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
});
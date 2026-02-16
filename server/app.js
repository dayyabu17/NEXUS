const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

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
app.use(
  cors({
    origin: [
      'http://localhost:5173',
      'https://nexus-6753-usman-dayyabus-projects.vercel.app',
      'https://nexus-6753.vercel.app',
    ],
    credentials: true,
  })
);
app.use(express.json({ limit: '10mb' }));
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

// Serve static assets in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../client/dist')));

  app.get(/.*/, (req, res) => {
    res.sendFile(path.resolve(__dirname, '../client', 'dist', 'index.html'));
  });
} else {
  app.get('/', (req, res) => {
    res.send('API is running... (Dev Mode)');
  });
}

module.exports = app;

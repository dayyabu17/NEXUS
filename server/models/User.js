const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    enum: ['student', 'organizer', 'admin'], // <--- This is crucial for your Admin side
    default: 'student',
  },
  organizationName: {
    type: String, // Only required if role is 'organizer'
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  profilePicture: { type: String, default: '/images/default-avatar.jpeg' },
});

module.exports = mongoose.model('User', userSchema);
require('dotenv').config(); // Load environment variables
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');
const Event = require('./models/Event'); // Import the Event model

/**
 * Seeds the database with initial data.
 * Clears existing users and events, then creates an admin user, an organizer user,
 * and several dummy events.
 *
 * Usage: node server/seed.js
 */
const seedDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB Connected for seeding!');

    // Clear existing users and events
    await User.deleteMany();
    await Event.deleteMany();
    console.log('Existing users and events cleared.');

    // 1. Create Admin User
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('admin123', salt);

    const adminUser = await User.create({
      name: 'Admin User',
      email: 'admin@nexus.com',
      password: hashedPassword,
      role: 'admin',
    });
    console.log('Admin user created: admin@nexus.com');

    // 2. Create an Organizer User
    const organizerHashedPassword = await bcrypt.hash('organizer123', salt); // Re-use salt or create new
    const organizerUser = await User.create({
      name: 'Organizer Name',
      email: 'organizer@nexus.com',
      password: organizerHashedPassword,
      role: 'organizer',
      organizationName: 'Tech Innovators', // Add organization name
    });
    console.log('Organizer user created: organizer@nexus.com');

    // 3. Create some dummy Events linked to the Organizer
    await Event.create([
      {
        title: 'Tech Summit 2024',
        description: 'A grand summit for tech enthusiasts and professionals.',
        date: new Date(new Date().setDate(new Date().getDate() + 7)), // 7 days from now
        location: 'Virtual',
        organizer: organizerUser._id,
        category: 'Technology',
        status: 'pending', // Will show on admin dashboard
        capacity: 500,
        registrationFee: 0,
        tags: ['tech', 'summit', 'innovation'],
      },
      {
        title: 'Campus Hackathon',
        description: '24-hour coding challenge for students.',
        date: new Date(new Date().setDate(new Date().getDate() + 14)), // 14 days from now
        location: 'University Auditorium',
        organizer: organizerUser._id,
        category: 'Technology',
        status: 'pending', // Will show on admin dashboard
        capacity: 100,
        registrationFee: 10,
        tags: ['hackathon', 'coding', 'students'],
      },
      {
        title: 'Spring Festival Gala',
        description: 'Annual celebration with music, dance, and food.',
        date: new Date(new Date().setDate(new Date().getDate() + 30)), // 30 days from now
        location: 'Main Campus Field',
        organizer: organizerUser._id,
        category: 'Culture',
        status: 'approved', // Won't show on admin dashboard (pending)
        capacity: 1000,
        registrationFee: 5,
        tags: ['festival', 'gala', 'celebration'],
      },
      {
        title: 'Career Fair 2024',
        description: 'Connect with top companies for internships and jobs.',
        date: new Date(new Date().setDate(new Date().getDate() + 21)), // 21 days from now
        location: 'Sports Arena',
        organizer: organizerUser._id,
        category: 'Career',
        status: 'rejected', // Won't show on admin dashboard (pending)
        capacity: 300,
        registrationFee: 0,
        tags: ['career', 'job fair', 'networking'],
      },
    ]);
    console.log('Dummy events created and linked to organizer.');


    console.log('Database seeded successfully!');
    mongoose.connection.close();
  } catch (error) {
    console.error(`Error seeding database: ${error.message}`);
    process.exit(1);
  }
};

seedDB();

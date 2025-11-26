require('dotenv').config(); // Load environment variables
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');
const Event = require('./models/Event'); // Import the Event model

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

    // 3. Create a Guest (Attendee) User
    const guestHashedPassword = await bcrypt.hash('guest123', salt);
    await User.create({
      name: 'Guest Explorer',
      email: 'guest@nexus.com',
      password: guestHashedPassword,
      role: 'student',
    });
    console.log('Guest user created: guest@nexus.com');

    // 4. Create some dummy Events linked to the Organizer
    await Event.create([
      {
        title: 'Tech Innovators Meetup',
        description: 'Connect with fellow innovators, demo projects, and swap ideas for upcoming collaborations.',
        date: new Date(new Date().setDate(new Date().getDate() + 7)), // 7 days from now
        location: 'Innovation Hub, Block B',
        organizer: organizerUser._id,
        category: 'Technology',
        status: 'pending',
        capacity: 120,
        registrationFee: 0,
        rsvpCount: 0,
        imageUrl: 'https://images.unsplash.com/photo-1521737604893-d14cc237f11d?auto=format&fit=crop&w=800&q=80',
        tags: ['tech', 'networking', 'innovation'],
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
        rsvpCount: 35,
        imageUrl: 'https://images.unsplash.com/photo-1483478550801-ceba5fe50e8e?auto=format&fit=crop&w=800&q=80',
        tags: ['hackathon', 'coding', 'students'],
      },
      {
        title: 'Cultural Day',
        description: 'Annual celebration with music, dance, talks, and delicious food from across campus.',
        date: new Date(new Date().setDate(new Date().getDate() + 30)), // 30 days from now
        location: 'Main Campus Field',
        organizer: organizerUser._id,
        category: 'Culture',
        status: 'approved',
        capacity: 1000,
        registrationFee: 15,
        rsvpCount: 72,
        imageUrl: 'https://images.unsplash.com/photo-1521737604893-d14cc237f11d?auto=format&fit=crop&w=800&q=80',
        tags: ['festival', 'gala', 'celebration'],
      },
      {
        title: 'Career Fair 2024',
        description: 'Connect with top companies for internships and jobs.',
        date: new Date(new Date().setDate(new Date().getDate() + 21)), // 21 days from now
        location: 'Sports Arena',
        organizer: organizerUser._id,
        category: 'Career',
        status: 'rejected',
        capacity: 300,
        registrationFee: 0,
        rsvpCount: 18,
        imageUrl: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=800&q=80',
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
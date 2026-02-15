const request = require('supertest');
const jwt = require('jsonwebtoken');
const app = require('../../app');
const Event = require('../../models/Event');
const User = require('../../models/User');

const createOrganizer = async () => {
  const organizer = await User.create({
    name: 'Test Organizer',
    email: `organizer-${Date.now()}@test.dev`,
    password: 'hashedpassword',
    role: 'organizer',
    phoneNumber: '1234567890',
    organizationName: 'Test Org',
  });

  const token = jwt.sign(
    { id: organizer._id, role: organizer.role },
    process.env.JWT_SECRET,
    { expiresIn: '30d' }
  );

  return { organizer, token };
};

describe('event routes', () => {
  test('GET /api/events returns only approved events', async () => {
    const { organizer } = await createOrganizer();

    await Event.create({
      title: 'Approved Event',
      description: 'Approved description',
      date: new Date(Date.now() + 86400000),
      location: 'Main Hall',
      category: 'Technology',
      organizer: organizer._id,
      status: 'approved',
      price: 0,
      tags: ['Tech'],
    });

    await Event.create({
      title: 'Pending Event',
      description: 'Pending description',
      date: new Date(Date.now() + 172800000),
      location: 'Side Hall',
      category: 'Technology',
      organizer: organizer._id,
      status: 'pending',
      price: 0,
      tags: ['Tech'],
    });

    const response = await request(app).get('/api/events');

    expect(response.status).toBe(200);
    expect(response.body).toHaveLength(1);
    expect(response.body[0].title).toBe('Approved Event');
  });

  test('GET /api/events/:id returns event details for approved event', async () => {
    const { organizer } = await createOrganizer();

    const event = await Event.create({
      title: 'Public Event',
      description: 'Public description',
      date: new Date(Date.now() + 86400000),
      location: 'Auditorium',
      category: 'Academic',
      organizer: organizer._id,
      status: 'approved',
      price: 0,
      tags: ['Study'],
    });

    const response = await request(app).get(`/api/events/${event._id}`);

    expect(response.status).toBe(200);
    expect(response.body.title).toBe('Public Event');
    expect(response.body.organizer).toBeTruthy();
    expect(response.body.organizer.email).toBe(organizer.email);
    expect(response.body.organizer.accentPreference).toBeTruthy();
    expect(response.body.organizer.brandColor).toBeTruthy();
  });

  test('POST /api/organizer/events validates required fields', async () => {
    const { token } = await createOrganizer();

    const response = await request(app)
      .post('/api/organizer/events')
      .set('Authorization', `Bearer ${token}`)
      .send({
        title: 'Missing Fields Event',
      });

    expect(response.status).toBe(400);
    expect(response.body.message).toMatch(/missing/i);
  });

  test('POST /api/organizer/events creates an event', async () => {
    const { token } = await createOrganizer();

    const response = await request(app)
      .post('/api/organizer/events')
      .set('Authorization', `Bearer ${token}`)
      .send({
        title: 'Organizer Event',
        description: 'Organizer description',
        date: new Date(Date.now() + 86400000).toISOString(),
        location: 'Student Center',
        category: 'Social',
        capacity: 100,
        registrationFee: 0,
        tags: ['Campus', 'Social'],
      });

    expect(response.status).toBe(201);
    expect(response.body.title).toBe('Organizer Event');
    expect(response.body.status).toBe('pending');
  });

  test('PUT /api/organizer/events/:id updates organizer event', async () => {
    const { organizer, token } = await createOrganizer();

    const event = await Event.create({
      title: 'Updatable Event',
      description: 'Original description',
      date: new Date(Date.now() + 86400000),
      location: 'Old Hall',
      category: 'Business',
      organizer: organizer._id,
      status: 'approved',
      price: 0,
      tags: ['Business'],
    });

    const response = await request(app)
      .put(`/api/organizer/events/${event._id}`)
      .set('Authorization', `Bearer ${token}`)
      .send({
        title: 'Updated Event',
        capacity: 250,
      });

    expect(response.status).toBe(200);
    expect(response.body.event.title).toBe('Updated Event');
    expect(response.body.event.capacity).toBe(250);
  });

  test('PUT /api/organizer/events/:id rejects non-owner update', async () => {
    const { organizer } = await createOrganizer();
    const { token } = await createOrganizer();

    const event = await Event.create({
      title: 'Private Event',
      description: 'Original description',
      date: new Date(Date.now() + 86400000),
      location: 'Old Hall',
      category: 'Business',
      organizer: organizer._id,
      status: 'approved',
      price: 0,
      tags: ['Business'],
    });

    const response = await request(app)
      .put(`/api/organizer/events/${event._id}`)
      .set('Authorization', `Bearer ${token}`)
      .send({
        title: 'Attempted Update',
      });

    expect(response.status).toBe(403);
  });
});

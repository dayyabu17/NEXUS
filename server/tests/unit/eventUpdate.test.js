const request = require('supertest');
const jwt = require('jsonwebtoken');
const app = require('../../app');
const User = require('../../models/User');
const Event = require('../../models/Event');

const createOrganizerAndEvent = async () => {
  const organizer = await User.create({
    name: 'Update Test Organizer',
    email: `organizer-update-${Date.now()}@test.dev`,
    password: 'hashedpassword',
    role: 'organizer',
    phoneNumber: '1234567890',
    organizationName: 'Update Test Org',
  });

  const token = jwt.sign(
    { id: organizer._id, role: organizer.role },
    process.env.JWT_SECRET,
    { expiresIn: '30d' }
  );

  const event = await Event.create({
    title: 'Original Event',
    description: 'Original description',
    date: new Date(Date.now() + 86400000),
    location: 'Original Hall',
    category: 'Technology',
    organizer: organizer._id,
    status: 'approved',
    price: 0,
    tags: ['Tech'],
  });

  return { organizer, token, event };
};

describe('event update validation edge cases', () => {
  test('allows partial updates', async () => {
    const { token, event } = await createOrganizerAndEvent();

    const response = await request(app)
      .put(`/api/organizer/events/${event._id}`)
      .set('Authorization', `Bearer ${token}`)
      .send({
        title: 'Updated Title Only',
      });

    expect(response.status).toBe(200);
    expect(response.body.event.title).toBe('Updated Title Only');
    expect(response.body.event.description).toBe('Original description');
  });

  test('validates capacity as positive number', async () => {
    const { token, event } = await createOrganizerAndEvent();

    const response = await request(app)
      .put(`/api/organizer/events/${event._id}`)
      .set('Authorization', `Bearer ${token}`)
      .send({
        capacity: -50,
      });

    expect(response.status).toBe(400);
    expect(response.body.message).toMatch(/Capacity must be a positive number/i);
  });

  test('validates registration fee as positive number', async () => {
    const { token, event } = await createOrganizerAndEvent();

    const response = await request(app)
      .put(`/api/organizer/events/${event._id}`)
      .set('Authorization', `Bearer ${token}`)
      .send({
        registrationFee: -100,
      });

    expect(response.status).toBe(400);
    expect(response.body.message).toMatch(/Registration fee must be a positive number/i);
  });

  test('validates price as positive number', async () => {
    const { token, event } = await createOrganizerAndEvent();

    const response = await request(app)
      .put(`/api/organizer/events/${event._id}`)
      .set('Authorization', `Bearer ${token}`)
      .send({
        price: -25,
      });

    expect(response.status).toBe(400);
    expect(response.body.message).toMatch(/Ticket price must be a positive number/i);
  });

  test('validates latitude range', async () => {
    const { token, event } = await createOrganizerAndEvent();

    const response = await request(app)
      .put(`/api/organizer/events/${event._id}`)
      .set('Authorization', `Bearer ${token}`)
      .send({
        locationLatitude: 95,
      });

    expect(response.status).toBe(400);
    expect(response.body.message).toMatch(/Latitude must be between -90 and 90/i);
  });

  test('validates longitude range', async () => {
    const { token, event } = await createOrganizerAndEvent();

    const response = await request(app)
      .put(`/api/organizer/events/${event._id}`)
      .set('Authorization', `Bearer ${token}`)
      .send({
        locationLongitude: 200,
      });

    expect(response.status).toBe(400);
    expect(response.body.message).toMatch(/Longitude must be between -180 and 180/i);
  });

  test('rejects invalid start date', async () => {
    const { token, event } = await createOrganizerAndEvent();

    const response = await request(app)
      .put(`/api/organizer/events/${event._id}`)
      .set('Authorization', `Bearer ${token}`)
      .send({
        date: 'invalid-date',
      });

    expect(response.status).toBe(400);
    expect(response.body.message).toMatch(/Invalid start date/i);
  });

  test('rejects invalid end date', async () => {
    const { token, event } = await createOrganizerAndEvent();

    const response = await request(app)
      .put(`/api/organizer/events/${event._id}`)
      .set('Authorization', `Bearer ${token}`)
      .send({
        endDate: 'invalid-end-date',
      });

    expect(response.status).toBe(400);
    expect(response.body.message).toMatch(/Invalid end date/i);
  });

  test('prevents update to past event', async () => {
    const organizer = await User.create({
      name: 'Past Event Organizer',
      email: `organizer-past-${Date.now()}@test.dev`,
      password: 'hashedpassword',
      role: 'organizer',
      phoneNumber: '1234567890',
      organizationName: 'Past Org',
    });

    const token = jwt.sign(
      { id: organizer._id, role: organizer.role },
      process.env.JWT_SECRET,
      { expiresIn: '30d' }
    );

    const pastEvent = await Event.create({
      title: 'Past Event',
      description: 'Event in the past',
      date: new Date(Date.now() - 86400000),
      location: 'Past Hall',
      category: 'Technology',
      organizer: organizer._id,
      status: 'approved',
      price: 0,
      tags: ['Tech'],
    });

    const response = await request(app)
      .put(`/api/organizer/events/${pastEvent._id}`)
      .set('Authorization', `Bearer ${token}`)
      .send({
        title: 'Attempted Update',
      });

    expect(response.status).toBe(400);
    expect(response.body.message).toMatch(/Cannot modify or cancel an event that has already ended/i);
  });

  test('prevents non-owner from updating event', async () => {
    const { event } = await createOrganizerAndEvent();

    const anotherOrganizer = await User.create({
      name: 'Another Organizer',
      email: `another-${Date.now()}@test.dev`,
      password: 'hashedpassword',
      role: 'organizer',
      phoneNumber: '9876543210',
      organizationName: 'Another Org',
    });

    const anotherToken = jwt.sign(
      { id: anotherOrganizer._id, role: anotherOrganizer.role },
      process.env.JWT_SECRET,
      { expiresIn: '30d' }
    );

    const response = await request(app)
      .put(`/api/organizer/events/${event._id}`)
      .set('Authorization', `Bearer ${anotherToken}`)
      .send({
        title: 'Unauthorized Update',
      });

    expect(response.status).toBe(403);
    expect(response.body.message).toMatch(/You can only update events you created/i);
  });

  test('allows admin to update any event', async () => {
    const { event } = await createOrganizerAndEvent();

    const admin = await User.create({
      name: 'Admin User',
      email: `admin-${Date.now()}@test.dev`,
      password: 'hashedpassword',
      role: 'admin',
      phoneNumber: '1111111111',
    });

    const adminToken = jwt.sign(
      { id: admin._id, role: admin.role },
      process.env.JWT_SECRET,
      { expiresIn: '30d' }
    );

    const response = await request(app)
      .put(`/api/organizer/events/${event._id}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        title: 'Admin Updated Title',
      });

    expect(response.status).toBe(200);
    expect(response.body.event.title).toBe('Admin Updated Title');
  });

  test('requires at least one field to update', async () => {
    const { token, event } = await createOrganizerAndEvent();

    const response = await request(app)
      .put(`/api/organizer/events/${event._id}`)
      .set('Authorization', `Bearer ${token}`)
      .send({});

    expect(response.status).toBe(400);
    expect(response.body.message).toMatch(/No valid fields supplied for update/i);
  });

  test('updates multiple fields simultaneously', async () => {
    const { token, event } = await createOrganizerAndEvent();

    const response = await request(app)
      .put(`/api/organizer/events/${event._id}`)
      .set('Authorization', `Bearer ${token}`)
      .send({
        title: 'Multi-Update Event',
        capacity: 200,
        registrationFee: 50,
        isFeatured: true,
      });

    expect(response.status).toBe(200);
    expect(response.body.event.title).toBe('Multi-Update Event');
    expect(response.body.event.capacity).toBe(200);
    expect(response.body.event.registrationFee).toBe(50);
    expect(response.body.event.isFeatured).toBe(true);
  });

  test('normalizes tags on update', async () => {
    const { token, event } = await createOrganizerAndEvent();

    const response = await request(app)
      .put(`/api/organizer/events/${event._id}`)
      .set('Authorization', `Bearer ${token}`)
      .send({
        tags: 'Tech, Innovation, Campus',
      });

    expect(response.status).toBe(200);
    expect(response.body.event.tags).toEqual(['Tech', 'Innovation', 'Campus']);
  });

  test('updates coordinates correctly', async () => {
    const { token, event } = await createOrganizerAndEvent();

    const response = await request(app)
      .put(`/api/organizer/events/${event._id}`)
      .set('Authorization', `Bearer ${token}`)
      .send({
        locationLatitude: 6.5244,
        locationLongitude: 3.3792,
      });

    expect(response.status).toBe(200);
    expect(response.body.event.locationLatitude).toBe(6.5244);
    expect(response.body.event.locationLongitude).toBe(3.3792);
  });

  test('returns 404 for non-existent event', async () => {
    const { token } = await createOrganizerAndEvent();
    const fakeId = '507f1f77bcf86cd799439011';

    const response = await request(app)
      .put(`/api/organizer/events/${fakeId}`)
      .set('Authorization', `Bearer ${token}`)
      .send({
        title: 'Non-existent Update',
      });

    expect(response.status).toBe(404);
  });

  test('requires authentication', async () => {
    const { event } = await createOrganizerAndEvent();

    const response = await request(app)
      .put(`/api/organizer/events/${event._id}`)
      .send({
        title: 'Unauthenticated Update',
      });

    expect(response.status).toBe(401);
  });

  test('rounds currency values to 2 decimals', async () => {
    const { token, event } = await createOrganizerAndEvent();

    const response = await request(app)
      .put(`/api/organizer/events/${event._id}`)
      .set('Authorization', `Bearer ${token}`)
      .send({
        registrationFee: 19.999,
        price: 29.995,
      });

    expect(response.status).toBe(200);
    expect(response.body.event.registrationFee).toBe(20.00);
    expect(response.body.event.price).toBe(30.00);
  });

  test('handles zero values for numeric fields', async () => {
    const { token, event } = await createOrganizerAndEvent();

    const response = await request(app)
      .put(`/api/organizer/events/${event._id}`)
      .set('Authorization', `Bearer ${token}`)
      .send({
        capacity: 0,
        registrationFee: 0,
        price: 0,
      });

    expect(response.status).toBe(200);
    expect(response.body.event.capacity).toBe(0);
    expect(response.body.event.registrationFee).toBe(0);
    expect(response.body.event.price).toBe(0);
  });

  test('accepts valid end date and end time', async () => {
    const { token, event } = await createOrganizerAndEvent();

    const endDate = new Date(Date.now() + 90000000);

    const response = await request(app)
      .put(`/api/organizer/events/${event._id}`)
      .set('Authorization', `Bearer ${token}`)
      .send({
        endDate: endDate.toISOString(),
        endTime: '10:00 PM',
      });

    expect(response.status).toBe(200);
    expect(response.body.event.endDate).toBeTruthy();
    expect(response.body.event.endTime).toBe('10:00 PM');
  });

  test('updates timezone', async () => {
    const { token, event } = await createOrganizerAndEvent();

    const response = await request(app)
      .put(`/api/organizer/events/${event._id}`)
      .set('Authorization', `Bearer ${token}`)
      .send({
        timezone: 'America/New_York',
      });

    expect(response.status).toBe(200);
    expect(response.body.event.timezone).toBe('America/New_York');
  });
});

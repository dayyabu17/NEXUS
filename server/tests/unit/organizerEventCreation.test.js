const request = require('supertest');
const jwt = require('jsonwebtoken');
const app = require('../../app');
const User = require('../../models/User');
const Event = require('../../models/Event');

const createOrganizerWithToken = async () => {
  const organizer = await User.create({
    name: 'Edge Case Organizer',
    email: `organizer-edge-${Date.now()}@test.dev`,
    password: 'hashedpassword',
    role: 'organizer',
    phoneNumber: '1234567890',
    organizationName: 'Edge Case Org',
  });

  const token = jwt.sign(
    { id: organizer._id, role: organizer.role },
    process.env.JWT_SECRET,
    { expiresIn: '30d' }
  );

  return { organizer, token };
};

describe('organizer event creation edge cases', () => {
  test('rejects event with missing title', async () => {
    const { token } = await createOrganizerWithToken();

    const response = await request(app)
      .post('/api/organizer/events')
      .set('Authorization', `Bearer ${token}`)
      .send({
        description: 'Event without title',
        date: new Date(Date.now() + 86400000).toISOString(),
        location: 'Hall',
        category: 'Technology',
        tags: ['Tech'],
      });

    expect(response.status).toBe(400);
    expect(response.body.message).toMatch(/Title/i);
  });

  test('rejects event with missing description', async () => {
    const { token } = await createOrganizerWithToken();

    const response = await request(app)
      .post('/api/organizer/events')
      .set('Authorization', `Bearer ${token}`)
      .send({
        title: 'No Description Event',
        date: new Date(Date.now() + 86400000).toISOString(),
        location: 'Hall',
        category: 'Technology',
        tags: ['Tech'],
      });

    expect(response.status).toBe(400);
    expect(response.body.message).toMatch(/Description/i);
  });

  test('rejects event with missing location', async () => {
    const { token } = await createOrganizerWithToken();

    const response = await request(app)
      .post('/api/organizer/events')
      .set('Authorization', `Bearer ${token}`)
      .send({
        title: 'No Location Event',
        description: 'Event without location',
        date: new Date(Date.now() + 86400000).toISOString(),
        category: 'Technology',
        tags: ['Tech'],
      });

    expect(response.status).toBe(400);
    expect(response.body.message).toMatch(/Location/i);
  });

  test('rejects event with missing category', async () => {
    const { token } = await createOrganizerWithToken();

    const response = await request(app)
      .post('/api/organizer/events')
      .set('Authorization', `Bearer ${token}`)
      .send({
        title: 'No Category Event',
        description: 'Event without category',
        date: new Date(Date.now() + 86400000).toISOString(),
        location: 'Hall',
        tags: ['Tech'],
      });

    expect(response.status).toBe(400);
    expect(response.body.message).toMatch(/Category/i);
  });

  test('rejects event with missing tags', async () => {
    const { token } = await createOrganizerWithToken();

    const response = await request(app)
      .post('/api/organizer/events')
      .set('Authorization', `Bearer ${token}`)
      .send({
        title: 'No Tags Event',
        description: 'Event without tags',
        date: new Date(Date.now() + 86400000).toISOString(),
        location: 'Hall',
        category: 'Technology',
      });

    expect(response.status).toBe(400);
    expect(response.body.message).toMatch(/Tags/i);
  });

  test('rejects event with empty tags array', async () => {
    const { token } = await createOrganizerWithToken();

    const response = await request(app)
      .post('/api/organizer/events')
      .set('Authorization', `Bearer ${token}`)
      .send({
        title: 'Empty Tags Event',
        description: 'Event with empty tags',
        date: new Date(Date.now() + 86400000).toISOString(),
        location: 'Hall',
        category: 'Technology',
        tags: [],
      });

    expect(response.status).toBe(400);
    expect(response.body.message).toMatch(/Tags/i);
  });

  test('rejects event with invalid date', async () => {
    const { token } = await createOrganizerWithToken();

    const response = await request(app)
      .post('/api/organizer/events')
      .set('Authorization', `Bearer ${token}`)
      .send({
        title: 'Invalid Date Event',
        description: 'Event with invalid date',
        date: 'not-a-date',
        location: 'Hall',
        category: 'Technology',
        tags: ['Tech'],
      });

    expect(response.status).toBe(400);
    expect(response.body.message).toMatch(/Invalid event date/i);
  });

  test('rejects event with invalid capacity', async () => {
    const { token } = await createOrganizerWithToken();

    const response = await request(app)
      .post('/api/organizer/events')
      .set('Authorization', `Bearer ${token}`)
      .send({
        title: 'Invalid Capacity Event',
        description: 'Event with invalid capacity',
        date: new Date(Date.now() + 86400000).toISOString(),
        location: 'Hall',
        category: 'Technology',
        tags: ['Tech'],
        capacity: 'not-a-number',
      });

    expect(response.status).toBe(400);
    expect(response.body.message).toMatch(/Capacity must be a valid number/i);
  });

  test('rejects event with invalid registration fee', async () => {
    const { token } = await createOrganizerWithToken();

    const response = await request(app)
      .post('/api/organizer/events')
      .set('Authorization', `Bearer ${token}`)
      .send({
        title: 'Invalid Fee Event',
        description: 'Event with invalid fee',
        date: new Date(Date.now() + 86400000).toISOString(),
        location: 'Hall',
        category: 'Technology',
        tags: ['Tech'],
        registrationFee: 'not-a-number',
      });

    expect(response.status).toBe(400);
    expect(response.body.message).toMatch(/Registration fee must be a valid number/i);
  });

  test('creates event with optional capacity as undefined', async () => {
    const { token } = await createOrganizerWithToken();

    const response = await request(app)
      .post('/api/organizer/events')
      .set('Authorization', `Bearer ${token}`)
      .send({
        title: 'No Capacity Event',
        description: 'Event without capacity limit',
        date: new Date(Date.now() + 86400000).toISOString(),
        location: 'Hall',
        category: 'Technology',
        tags: ['Tech'],
      });

    expect(response.status).toBe(201);
    expect(response.body.capacity).toBeUndefined();
  });

  test('creates event with zero registration fee', async () => {
    const { token } = await createOrganizerWithToken();

    const response = await request(app)
      .post('/api/organizer/events')
      .set('Authorization', `Bearer ${token}`)
      .send({
        title: 'Free Event',
        description: 'Free event with no fee',
        date: new Date(Date.now() + 86400000).toISOString(),
        location: 'Hall',
        category: 'Technology',
        tags: ['Tech'],
        registrationFee: 0,
      });

    expect(response.status).toBe(201);
    expect(response.body.registrationFee).toBe(0);
  });

  test('creates event with valid coordinates', async () => {
    const { token } = await createOrganizerWithToken();

    const response = await request(app)
      .post('/api/organizer/events')
      .set('Authorization', `Bearer ${token}`)
      .send({
        title: 'Geo Event',
        description: 'Event with coordinates',
        date: new Date(Date.now() + 86400000).toISOString(),
        location: 'Campus Center',
        category: 'Technology',
        tags: ['Tech'],
        locationLatitude: 6.4541,
        locationLongitude: 3.3947,
      });

    expect(response.status).toBe(201);
    expect(response.body.locationLatitude).toBe(6.4541);
    expect(response.body.locationLongitude).toBe(3.3947);
  });

  test('creates event with timezone and end date', async () => {
    const { token } = await createOrganizerWithToken();

    const startDate = new Date(Date.now() + 86400000);
    const endDate = new Date(Date.now() + 86400000 + 3600000);

    const response = await request(app)
      .post('/api/organizer/events')
      .set('Authorization', `Bearer ${token}`)
      .send({
        title: 'Full Event',
        description: 'Event with all details',
        date: startDate.toISOString(),
        endDate: endDate.toISOString(),
        endTime: '6:00 PM',
        location: 'Conference Hall',
        category: 'Technology',
        tags: ['Tech', 'Innovation'],
        timezone: 'Africa/Lagos',
      });

    expect(response.status).toBe(201);
    expect(response.body.timezone).toBe('Africa/Lagos');
    expect(response.body.endTime).toBe('6:00 PM');
    expect(response.body.endDate).toBeTruthy();
  });

  test('normalizes whitespace in title and location', async () => {
    const { token } = await createOrganizerWithToken();

    const response = await request(app)
      .post('/api/organizer/events')
      .set('Authorization', `Bearer ${token}`)
      .send({
        title: '  Tech Summit  ',
        description: 'Event with extra spaces',
        date: new Date(Date.now() + 86400000).toISOString(),
        location: '  Main Hall  ',
        category: 'Technology',
        tags: ['Tech'],
      });

    expect(response.status).toBe(201);
    expect(response.body.title).toBe('Tech Summit');
    expect(response.body.location).toBe('Main Hall');
  });

  test('normalizes tags from comma-separated string', async () => {
    const { token } = await createOrganizerWithToken();

    const response = await request(app)
      .post('/api/organizer/events')
      .set('Authorization', `Bearer ${token}`)
      .send({
        title: 'Tag Test Event',
        description: 'Event with string tags',
        date: new Date(Date.now() + 86400000).toISOString(),
        location: 'Hall',
        category: 'Technology',
        tags: 'Tech, Innovation, Campus',
      });

    expect(response.status).toBe(201);
    expect(response.body.tags).toEqual(['Tech', 'Innovation', 'Campus']);
  });

  test('sets status to pending on creation', async () => {
    const { token } = await createOrganizerWithToken();

    const response = await request(app)
      .post('/api/organizer/events')
      .set('Authorization', `Bearer ${token}`)
      .send({
        title: 'Status Test Event',
        description: 'Testing initial status',
        date: new Date(Date.now() + 86400000).toISOString(),
        location: 'Hall',
        category: 'Technology',
        tags: ['Tech'],
      });

    expect(response.status).toBe(201);
    expect(response.body.status).toBe('pending');
  });

  test('requires authentication', async () => {
    const response = await request(app)
      .post('/api/organizer/events')
      .send({
        title: 'Unauthenticated Event',
        description: 'Should fail',
        date: new Date(Date.now() + 86400000).toISOString(),
        location: 'Hall',
        category: 'Technology',
        tags: ['Tech'],
      });

    expect(response.status).toBe(401);
  });

  test('requires organizer role', async () => {
    const student = await User.create({
      name: 'Test Student',
      email: `student-${Date.now()}@test.dev`,
      password: 'hashedpassword',
      role: 'student',
      phoneNumber: '1234567890',
      regNo: 'REG-STUDENT',
      address: 'Dorm',
    });

    const token = jwt.sign(
      { id: student._id, role: student.role },
      process.env.JWT_SECRET,
      { expiresIn: '30d' }
    );

    const response = await request(app)
      .post('/api/organizer/events')
      .set('Authorization', `Bearer ${token}`)
      .send({
        title: 'Student Event',
        description: 'Should fail',
        date: new Date(Date.now() + 86400000).toISOString(),
        location: 'Hall',
        category: 'Technology',
        tags: ['Tech'],
      });

    expect(response.status).toBe(403);
  });
});

const request = require('supertest');
const jwt = require('jsonwebtoken');
const app = require('../../app');
const User = require('../../models/User');
const Event = require('../../models/Event');
const Ticket = require('../../models/Ticket');

const createUserWithToken = async (role = 'student') => {
  const userData = {
    name: `Test ${role}`,
    email: `${role}-${Date.now()}@test.dev`,
    password: 'hashedpassword',
    role,
    phoneNumber: '1234567890',
  };

  if (role === 'student') {
    userData.regNo = `REG-${Date.now()}`;
    userData.address = 'Test Address';
  } else if (role === 'organizer') {
    userData.organizationName = 'Test Org';
  }

  const user = await User.create(userData);

  const token = jwt.sign(
    { id: user._id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: '30d' }
  );

  return { user, token };
};

const createEvent = async (organizerId, options = {}) => {
  return await Event.create({
    title: options.title || 'Test Event',
    description: 'Test description',
    date: options.date || new Date(Date.now() + 86400000),
    location: 'Test Hall',
    category: 'Technology',
    organizer: organizerId,
    status: options.status || 'approved',
    price: options.price !== undefined ? options.price : 0,
    tags: ['Test'],
    capacity: options.capacity,
    ...options,
  });
};

describe('ticket routes', () => {
  describe('GET /api/tickets/my-tickets', () => {
    test('returns user tickets', async () => {
      const { user, token } = await createUserWithToken('student');
      const { user: organizer } = await createUserWithToken('organizer');
      const event = await createEvent(organizer._id);

      await Ticket.create({
        user: user._id,
        event: event._id,
        status: 'confirmed',
        amountPaid: 0,
      });

      const response = await request(app)
        .get('/api/tickets/my-tickets')
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.tickets).toHaveLength(1);
      expect(response.body.tickets[0].event.title).toBe('Test Event');
    });

    test('requires authentication', async () => {
      const response = await request(app).get('/api/tickets/my-tickets');

      expect(response.status).toBe(401);
    });

    test('returns empty array when no tickets', async () => {
      const { token } = await createUserWithToken('student');

      const response = await request(app)
        .get('/api/tickets/my-tickets')
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body.tickets).toHaveLength(0);
    });
  });

  describe('GET /api/tickets/status/:eventId', () => {
    test('returns true when user has ticket', async () => {
      const { user, token } = await createUserWithToken('student');
      const { user: organizer } = await createUserWithToken('organizer');
      const event = await createEvent(organizer._id);

      await Ticket.create({
        user: user._id,
        event: event._id,
        status: 'confirmed',
        amountPaid: 0,
      });

      const response = await request(app)
        .get(`/api/tickets/status/${event._id}`)
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body.hasTicket).toBe(true);
      expect(response.body.ticketId).toBeTruthy();
    });

    test('returns false when user has no ticket', async () => {
      const { token } = await createUserWithToken('student');
      const { user: organizer } = await createUserWithToken('organizer');
      const event = await createEvent(organizer._id);

      const response = await request(app)
        .get(`/api/tickets/status/${event._id}`)
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body.hasTicket).toBe(false);
      expect(response.body.ticketId).toBeNull();
    });

    test('ignores pending tickets', async () => {
      const { user, token } = await createUserWithToken('student');
      const { user: organizer } = await createUserWithToken('organizer');
      const event = await createEvent(organizer._id);

      await Ticket.create({
        user: user._id,
        event: event._id,
        status: 'pending',
        amountPaid: 0,
      });

      const response = await request(app)
        .get(`/api/tickets/status/${event._id}`)
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body.hasTicket).toBe(false);
    });
  });

  describe('POST /api/tickets/check-in', () => {
    test('organizer can check in guest with ticketId', async () => {
      const { user: student } = await createUserWithToken('student');
      const { user: organizer, token } = await createUserWithToken('organizer');
      const event = await createEvent(organizer._id, {
        date: new Date(Date.now() - 3600000), // Started 1 hour ago
      });

      const ticket = await Ticket.create({
        user: student._id,
        event: event._id,
        status: 'confirmed',
        amountPaid: 0,
      });

      const response = await request(app)
        .post('/api/tickets/check-in')
        .set('Authorization', `Bearer ${token}`)
        .send({ ticketId: ticket._id });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.guest.status).toBe('checked-in');
      expect(response.body.guest.isCheckedIn).toBe(true);
    });

    test('organizer can check in guest with userId and eventId', async () => {
      const { user: student } = await createUserWithToken('student');
      const { user: organizer, token } = await createUserWithToken('organizer');
      const event = await createEvent(organizer._id, {
        date: new Date(Date.now() - 3600000),
      });

      await Ticket.create({
        user: student._id,
        event: event._id,
        status: 'confirmed',
        amountPaid: 0,
      });

      const response = await request(app)
        .post('/api/tickets/check-in')
        .set('Authorization', `Bearer ${token}`)
        .send({ userId: student._id, eventId: event._id });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });

    test('prevents check-in before event starts', async () => {
      const { user: student } = await createUserWithToken('student');
      const { user: organizer, token } = await createUserWithToken('organizer');
      const event = await createEvent(organizer._id, {
        date: new Date(Date.now() + 86400000), // Tomorrow
      });

      const ticket = await Ticket.create({
        user: student._id,
        event: event._id,
        status: 'confirmed',
        amountPaid: 0,
      });

      const response = await request(app)
        .post('/api/tickets/check-in')
        .set('Authorization', `Bearer ${token}`)
        .send({ ticketId: ticket._id });

      expect(response.status).toBe(400);
      expect(response.body.message).toMatch(/Event not started/i);
    });

    test('prevents check-in after event ends', async () => {
      const { user: student } = await createUserWithToken('student');
      const { user: organizer, token } = await createUserWithToken('organizer');
      const event = await createEvent(organizer._id, {
        date: new Date(Date.now() - 172800000), // 2 days ago
        endDate: new Date(Date.now() - 86400000), // 1 day ago
      });

      const ticket = await Ticket.create({
        user: student._id,
        event: event._id,
        status: 'confirmed',
        amountPaid: 0,
      });

      const response = await request(app)
        .post('/api/tickets/check-in')
        .set('Authorization', `Bearer ${token}`)
        .send({ ticketId: ticket._id });

      expect(response.status).toBe(400);
      expect(response.body.message).toMatch(/Event ended/i);
    });

    test('prevents check-in of pending tickets', async () => {
      const { user: student } = await createUserWithToken('student');
      const { user: organizer, token } = await createUserWithToken('organizer');
      const event = await createEvent(organizer._id, {
        date: new Date(Date.now() - 3600000),
      });

      const ticket = await Ticket.create({
        user: student._id,
        event: event._id,
        status: 'pending',
        amountPaid: 0,
      });

      const response = await request(app)
        .post('/api/tickets/check-in')
        .set('Authorization', `Bearer ${token}`)
        .send({ ticketId: ticket._id });

      expect(response.status).toBe(400);
      expect(response.body.message).toMatch(/Only confirmed tickets can be checked in/i);
    });

    test('returns success if already checked in', async () => {
      const { user: student } = await createUserWithToken('student');
      const { user: organizer, token } = await createUserWithToken('organizer');
      const event = await createEvent(organizer._id, {
        date: new Date(Date.now() - 3600000),
      });

      const ticket = await Ticket.create({
        user: student._id,
        event: event._id,
        status: 'checked-in',
        isCheckedIn: true,
        checkedInAt: new Date(),
        amountPaid: 0,
      });

      const response = await request(app)
        .post('/api/tickets/check-in')
        .set('Authorization', `Bearer ${token}`)
        .send({ ticketId: ticket._id });

      expect(response.status).toBe(200);
      expect(response.body.alreadyCheckedIn).toBe(true);
    });

    test('prevents non-organizer from checking in', async () => {
      const { user: student } = await createUserWithToken('student');
      const { user: organizer } = await createUserWithToken('organizer');
      const { token: otherOrganizerToken } = await createUserWithToken('organizer');
      const event = await createEvent(organizer._id, {
        date: new Date(Date.now() - 3600000),
      });

      const ticket = await Ticket.create({
        user: student._id,
        event: event._id,
        status: 'confirmed',
        amountPaid: 0,
      });

      const response = await request(app)
        .post('/api/tickets/check-in')
        .set('Authorization', `Bearer ${otherOrganizerToken}`)
        .send({ ticketId: ticket._id });

      expect(response.status).toBe(403);
      expect(response.body.message).toMatch(/permission/i);
    });

    test('requires ticketId or userId+eventId', async () => {
      const { token } = await createUserWithToken('organizer');

      const response = await request(app)
        .post('/api/tickets/check-in')
        .set('Authorization', `Bearer ${token}`)
        .send({});

      expect(response.status).toBe(400);
      expect(response.body.message).toMatch(/Provide a ticketId or both userId and eventId/i);
    });

    test('requires organizer role', async () => {
      const { user: student } = await createUserWithToken('student');
      const { user: organizer } = await createUserWithToken('organizer');
      const { token: studentToken } = await createUserWithToken('student');
      const event = await createEvent(organizer._id, {
        date: new Date(Date.now() - 3600000),
      });

      const ticket = await Ticket.create({
        user: student._id,
        event: event._id,
        status: 'confirmed',
        amountPaid: 0,
      });

      const response = await request(app)
        .post('/api/tickets/check-in')
        .set('Authorization', `Bearer ${studentToken}`)
        .send({ ticketId: ticket._id });

      expect(response.status).toBe(403);
    });
  });
});

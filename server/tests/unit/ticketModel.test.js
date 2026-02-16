const mongoose = require('mongoose');
const Ticket = require('../../models/Ticket');
const User = require('../../models/User');
const Event = require('../../models/Event');

describe('Ticket Model', () => {
  let user;
  let event;

  beforeEach(async () => {
    user = await User.create({
      name: 'Test User',
      email: `user-${Date.now()}@test.dev`,
      password: 'hashedpassword',
      role: 'student',
      phoneNumber: '1234567890',
      regNo: 'REG-001',
      address: 'Test Address',
    });

    const organizer = await User.create({
      name: 'Test Organizer',
      email: `organizer-${Date.now()}@test.dev`,
      password: 'hashedpassword',
      role: 'organizer',
      phoneNumber: '9876543210',
      organizationName: 'Test Org',
    });

    event = await Event.create({
      title: 'Test Event',
      description: 'Test description',
      date: new Date(Date.now() + 86400000),
      location: 'Test Hall',
      category: 'Technology',
      organizer: organizer._id,
      status: 'approved',
      price: 0,
      tags: ['Test'],
    });
  });

  test('creates ticket with required fields', async () => {
    const ticket = await Ticket.create({
      user: user._id,
      event: event._id,
      status: 'confirmed',
      amountPaid: 0,
    });

    expect(ticket).toBeTruthy();
    expect(ticket.user.toString()).toBe(user._id.toString());
    expect(ticket.event.toString()).toBe(event._id.toString());
    expect(ticket.status).toBe('confirmed');
  });

  test('sets default quantity to 1', async () => {
    const ticket = await Ticket.create({
      user: user._id,
      event: event._id,
      amountPaid: 0,
    });

    expect(ticket.quantity).toBe(1);
  });

  test('sets default status to confirmed', async () => {
    const ticket = await Ticket.create({
      user: user._id,
      event: event._id,
      amountPaid: 0,
    });

    expect(ticket.status).toBe('confirmed');
  });

  test('sets default isCheckedIn to false', async () => {
    const ticket = await Ticket.create({
      user: user._id,
      event: event._id,
      amountPaid: 0,
    });

    expect(ticket.isCheckedIn).toBe(false);
  });

  test('accepts valid status values', async () => {
    const statuses = ['pending', 'confirmed', 'checked-in'];

    const organizer = await User.findOne({ role: 'organizer' });

    for (let i = 0; i < statuses.length; i++) {
      const status = statuses[i];
      
      // Create unique event for each status to avoid duplicate key error
      const uniqueEvent = await Event.create({
        title: `Event ${i}`,
        description: 'Test description',
        date: new Date(Date.now() + 86400000),
        location: 'Test Hall',
        category: 'Technology',
        organizer: organizer._id,
        status: 'approved',
        price: 0,
        tags: ['Test'],
      });

      const ticket = await Ticket.create({
        user: user._id,
        event: uniqueEvent._id,
        status,
        amountPaid: 0,
      });

      expect(ticket.status).toBe(status);
    }
  });

  test('stores payment reference', async () => {
    const ticket = await Ticket.create({
      user: user._id,
      event: event._id,
      paymentReference: 'PAY-123456',
      amountPaid: 50,
    });

    expect(ticket.paymentReference).toBe('PAY-123456');
  });

  test('stores amount paid', async () => {
    const ticket = await Ticket.create({
      user: user._id,
      event: event._id,
      amountPaid: 99.99,
    });

    expect(ticket.amountPaid).toBe(99.99);
  });

  test('stores email', async () => {
    const ticket = await Ticket.create({
      user: user._id,
      event: event._id,
      email: 'test@example.com',
      amountPaid: 0,
    });

    expect(ticket.email).toBe('test@example.com');
  });

  test('stores metadata as object', async () => {
    const metadata = { source: 'web', device: 'mobile' };
    const ticket = await Ticket.create({
      user: user._id,
      event: event._id,
      metadata,
      amountPaid: 0,
    });

    expect(ticket.metadata).toEqual(metadata);
  });

  test('enforces unique constraint on event+user', async () => {
    await Ticket.create({
      user: user._id,
      event: event._id,
      amountPaid: 0,
    });

    await expect(
      Ticket.create({
        user: user._id,
        event: event._id,
        amountPaid: 0,
      })
    ).rejects.toThrow();
  });

  test('allows same user to have tickets for different events', async () => {
    const event2 = await Event.create({
      title: 'Event 2',
      description: 'Test description',
      date: new Date(Date.now() + 86400000),
      location: 'Test Hall',
      category: 'Technology',
      organizer: event.organizer,
      status: 'approved',
      price: 0,
      tags: ['Test'],
    });

    const ticket1 = await Ticket.create({
      user: user._id,
      event: event._id,
      amountPaid: 0,
    });

    const ticket2 = await Ticket.create({
      user: user._id,
      event: event2._id,
      amountPaid: 0,
    });

    expect(ticket1).toBeTruthy();
    expect(ticket2).toBeTruthy();
  });

  test('allows different users to have tickets for same event', async () => {
    const user2 = await User.create({
      name: 'User 2',
      email: `user2-${Date.now()}@test.dev`,
      password: 'hashedpassword',
      role: 'student',
      phoneNumber: '1111111111',
      regNo: 'REG-002',
      address: 'Test Address',
    });

    const ticket1 = await Ticket.create({
      user: user._id,
      event: event._id,
      amountPaid: 0,
    });

    const ticket2 = await Ticket.create({
      user: user2._id,
      event: event._id,
      amountPaid: 0,
    });

    expect(ticket1).toBeTruthy();
    expect(ticket2).toBeTruthy();
  });

  test('stores check-in timestamp', async () => {
    const checkedInAt = new Date();
    const ticket = await Ticket.create({
      user: user._id,
      event: event._id,
      status: 'checked-in',
      isCheckedIn: true,
      checkedInAt,
      amountPaid: 0,
    });

    expect(ticket.checkedInAt).toBeInstanceOf(Date);
    expect(ticket.checkedInAt.getTime()).toBe(checkedInAt.getTime());
  });

  test('enforces minimum quantity of 1', async () => {
    await expect(
      Ticket.create({
        user: user._id,
        event: event._id,
        quantity: 0,
        amountPaid: 0,
      })
    ).rejects.toThrow();
  });

  test('automatically sets timestamps', async () => {
    const ticket = await Ticket.create({
      user: user._id,
      event: event._id,
      amountPaid: 0,
    });

    expect(ticket.createdAt).toBeInstanceOf(Date);
    expect(ticket.updatedAt).toBeInstanceOf(Date);
  });

  test('updates updatedAt on modification', async () => {
    const ticket = await Ticket.create({
      user: user._id,
      event: event._id,
      status: 'pending',
      amountPaid: 0,
    });

    const originalUpdatedAt = ticket.updatedAt;

    await new Promise((resolve) => setTimeout(resolve, 10));

    ticket.status = 'confirmed';
    await ticket.save();

    expect(ticket.updatedAt.getTime()).toBeGreaterThan(originalUpdatedAt.getTime());
  });

  test('populates user reference', async () => {
    const ticket = await Ticket.create({
      user: user._id,
      event: event._id,
      amountPaid: 0,
    });

    const populated = await Ticket.findById(ticket._id).populate('user');
    expect(populated.user.name).toBe('Test User');
    expect(populated.user.email).toBe(user.email);
  });

  test('populates event reference', async () => {
    const ticket = await Ticket.create({
      user: user._id,
      event: event._id,
      amountPaid: 0,
    });

    const populated = await Ticket.findById(ticket._id).populate('event');
    expect(populated.event.title).toBe('Test Event');
  });
});

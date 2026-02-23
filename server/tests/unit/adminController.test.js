const { updateEventStatus } = require('../../controllers/adminController');
const Event = require('../../models/Event');
const User = require('../../models/User');

// Mock email service
jest.mock('../../utils/emailService', () => ({
  sendNotificationEmail: jest.fn().mockResolvedValue(true),
}));

describe('adminController - updateEventStatus Performance', () => {
  it('measures database calls for User.findById during status update', async () => {
    // 1. Setup Data
    const organizer = await User.create({
      name: 'Organizer One',
      email: 'organizer@example.com',
      password: 'password123',
      role: 'organizer',
      organizationName: 'Org One Inc',
      phoneNumber: '1234567890',
    });

    const event = await Event.create({
      title: 'Test Event',
      description: 'Test Description',
      date: new Date(),
      location: 'Test Location',
      organizer: organizer._id,
      status: 'pending',
      category: 'Technology',
      price: 0,
    });

    // 2. Mock Request and Response
    const req = {
      params: { id: event._id },
      body: { status: 'approved' },
      user: { _id: organizer._id, role: 'admin' } // Mock admin user making the request
    };

    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    // 3. Spy on User.findById
    const userFindSpy = jest.spyOn(User, 'findById');

    // 4. Call the Controller
    await updateEventStatus(req, res);

    // 5. Verify logic execution
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
      message: 'Event approved successfully.',
      newStatus: 'approved',
    }));

    // Check if the email service was called
    const { sendNotificationEmail } = require('../../utils/emailService');
    expect(sendNotificationEmail).toHaveBeenCalledWith(
      'organizer@example.com',
      expect.stringContaining('Event Approved'),
      expect.any(String)
    );

    // 6. Log call count
    console.log(`User.findById call count: ${userFindSpy.mock.calls.length}`);

    // Expect 0 calls (optimized)
    expect(userFindSpy).toHaveBeenCalledTimes(0);
  });
});

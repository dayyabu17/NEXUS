const bcrypt = require('bcryptjs');
const User = require('../../models/User');
const { authenticateUser, registerUser } = require('../../services/authService');

describe('authService', () => {
  test('registerUser creates a student account', async () => {
    await registerUser({
      name: 'Jane Student',
      email: 'jane@student.test',
      password: 'Password123!',
      role: 'student',
      phoneNumber: '1234567890',
      regNo: 'REG-1001',
      address: 'Campus Lane',
    });

    const user = await User.findOne({ email: 'jane@student.test' });
    expect(user).toBeTruthy();
    expect(user.role).toBe('student');
    expect(user.regNo).toBe('REG-1001');
  });

  test('registerUser rejects missing required fields', async () => {
    await expect(
      registerUser({
        name: 'Missing Phone',
        email: 'missing@phone.test',
        password: 'Password123!',
        role: 'student',
      })
    ).rejects.toMatchObject({ statusCode: 400 });
  });

  test('authenticateUser returns profile and token on success', async () => {
    const hashedPassword = await bcrypt.hash('Password123!', 10);
    await User.create({
      name: 'Login User',
      email: 'login@user.test',
      password: hashedPassword,
      role: 'student',
      phoneNumber: '1234567890',
      regNo: 'REG-2002',
      address: 'Dorm 3',
    });

    const result = await authenticateUser({
      email: 'login@user.test',
      password: 'Password123!',
    });

    expect(result.token).toBeTruthy();
    expect(result.profile.email).toBe('login@user.test');
  });

  test('authenticateUser rejects invalid password', async () => {
    const hashedPassword = await bcrypt.hash('Password123!', 10);
    await User.create({
      name: 'Login User',
      email: 'wrong@pass.test',
      password: hashedPassword,
      role: 'student',
      phoneNumber: '1234567890',
      regNo: 'REG-3003',
      address: 'Dorm 5',
    });

    await expect(
      authenticateUser({
        email: 'wrong@pass.test',
        password: 'WrongPassword',
      })
    ).rejects.toMatchObject({ statusCode: 400 });
  });
});

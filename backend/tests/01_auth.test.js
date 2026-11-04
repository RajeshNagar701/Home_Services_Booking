const { describe, it, before, after } = require('node:test');
const assert = require('node:assert/strict');
const request = require('supertest');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const app = require('../src/server');
const { User } = require('../src/models');
const { ROLES } = require('../src/config/constants');

describe('01. Authentication & RBAC Test Suite', () => {
  let customerToken = '';
  let providerToken = '';
  let techToken = '';
  let adminToken = '';
  let testUser = null;

  before(async () => {
    // Ensure DB connected
    if (mongoose.connection.readyState !== 1) {
      await mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/homeserve');
    }
  });

  after(async () => {
    // Cleanup temporary test users created during auth tests
    await User.deleteMany({ email: { $in: ['newuser@homeserve.tech', 'deactivated@homeserve.tech', 'resetuser@homeserve.tech'] } });
    await mongoose.disconnect();
  });

  // 1. Role Logins
  it('Super Admin: Valid login returns HTTP 200 & JWT token', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'admin@homeserve.tech', password: 'AdminPassword123!' });

    assert.strictEqual(res.statusCode, 200);
    assert.strictEqual(res.body.success, true);
    assert.ok(res.body.data.token, 'Token must be present');
    assert.strictEqual(res.body.data.user.role, ROLES.ADMIN);
    adminToken = res.body.data.token;
  });

  it('Customer: Valid login returns HTTP 200 & Customer profile', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'john.doe@gmail.com', password: 'CustomerPassword123!' });

    assert.strictEqual(res.statusCode, 200);
    assert.strictEqual(res.body.success, true);
    assert.ok(res.body.data.token);
    assert.strictEqual(res.body.data.user.role, ROLES.CUSTOMER);
    customerToken = res.body.data.token;
  });

  it('Service Provider: Valid login returns HTTP 200 & Provider profile', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'apex.homes@homeserve.tech', password: 'ProviderPassword123!' });

    assert.strictEqual(res.statusCode, 200);
    assert.strictEqual(res.body.success, true);
    assert.strictEqual(res.body.data.user.role, ROLES.PROVIDER);
    assert.ok(res.body.data.profile, 'Provider profile must be attached');
    providerToken = res.body.data.token;
  });

  it('Technician: Valid login returns HTTP 200 & Technician profile', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'rahul.tech@homeserve.tech', password: 'TechPassword123!' });

    assert.strictEqual(res.statusCode, 200);
    assert.strictEqual(res.body.success, true);
    assert.strictEqual(res.body.data.user.role, ROLES.TECHNICIAN);
    techToken = res.body.data.token;
  });

  // 2. Invalid Login & Input Validation
  it('Invalid Credentials: Wrong password returns HTTP 401', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'admin@homeserve.tech', password: 'WrongPassword999!' });

    assert.strictEqual(res.statusCode, 401);
    assert.strictEqual(res.body.success, false);
    assert.match(res.body.message, /invalid email or password/i);
  });

  it('Invalid Credentials: Non-existent email returns HTTP 401', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'ghost.user.doesnotexist@homeserve.tech', password: 'AnyPassword123!' });

    assert.strictEqual(res.statusCode, 401);
    assert.strictEqual(res.body.success, false);
  });

  it('Validation: Missing email or password returns HTTP 400', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'admin@homeserve.tech' });

    assert.strictEqual(res.statusCode, 400);
    assert.strictEqual(res.body.success, false);
  });

  // 3. Inactive / Deactivated Account
  it('Inactive Account: Deactivated user is blocked from logging in (HTTP 403)', async () => {
    await User.create({
      firstName: 'Deactivated',
      lastName: 'User',
      email: 'deactivated@homeserve.tech',
      phone: '+91 9999900000',
      password: 'Password123!',
      role: ROLES.CUSTOMER,
      isActive: false
    });

    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'deactivated@homeserve.tech', password: 'Password123!' });

    assert.strictEqual(res.statusCode, 403);
    assert.strictEqual(res.body.success, false);
    assert.match(res.body.message, /deactivated/i);
  });

  // 4. Role-Based Access Control (RBAC) & Unauthorized Access
  it('RBAC: Customer attempting Super Admin route returns HTTP 403 Forbidden', async () => {
    const res = await request(app)
      .get('/api/admin/dashboard-stats')
      .set('Authorization', `Bearer ${customerToken}`);

    assert.strictEqual(res.statusCode, 403);
    assert.strictEqual(res.body.success, false);
    assert.match(res.body.message, /access denied/i);
  });

  it('RBAC: Unauthenticated request without Bearer token returns HTTP 401 Unauthorized', async () => {
    const res = await request(app).get('/api/auth/me');

    assert.strictEqual(res.statusCode, 401);
    assert.strictEqual(res.body.success, false);
    assert.match(res.body.message, /not logged in/i);
  });

  it('RBAC: Tampered/invalid JWT token returns HTTP 401', async () => {
    const res = await request(app)
      .get('/api/auth/me')
      .set('Authorization', 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.invalidpayload.invalidsignature');

    assert.strictEqual(res.statusCode, 401);
    assert.strictEqual(res.body.success, false);
  });

  it('JWT Security: Expired JWT token returns HTTP 401', async () => {
    // Generate an already-expired token (expired 1 hour ago)
    const secret = process.env.JWT_SECRET || 'homeserve_super_secret_jwt_access_key_2026_x89';
    const expiredToken = jwt.sign(
      { id: new mongoose.Types.ObjectId() },
      secret,
      { expiresIn: '-1h' }
    );

    const res = await request(app)
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${expiredToken}`);

    assert.strictEqual(res.statusCode, 401);
    assert.strictEqual(res.body.success, false);
    assert.match(res.body.message, /expired/i);
  });

  // 5. Password Reset Workflow
  it('Password Reset: Request reset token, reset password, verify new login and old rejection', async () => {
    // 1. Create a dedicated user for password reset
    const resetUser = await User.create({
      firstName: 'Reset',
      lastName: 'Tester',
      email: 'resetuser@homeserve.tech',
      phone: '+91 9888877777',
      password: 'OldPassword123!',
      role: ROLES.CUSTOMER,
      isActive: true
    });

    // 2. Request forgot-password
    const forgotRes = await request(app)
      .post('/api/auth/forgot-password')
      .send({ email: 'resetuser@homeserve.tech' });

    assert.strictEqual(forgotRes.statusCode, 200);
    assert.ok(forgotRes.body.data.resetToken, 'Reset token must be generated');
    const resetToken = forgotRes.body.data.resetToken;

    // 3. Reset password using the valid token
    const resetRes = await request(app)
      .post(`/api/auth/reset-password/${resetToken}`)
      .send({ newPassword: 'BrandNewPassword2026!' });

    assert.strictEqual(resetRes.statusCode, 200);
    assert.strictEqual(resetRes.body.success, true);
    assert.ok(resetRes.body.data.token, 'Should return new auth token upon reset');

    // 4. Attempt login with OLD password -> Must FAIL (401)
    const oldLoginRes = await request(app)
      .post('/api/auth/login')
      .send({ email: 'resetuser@homeserve.tech', password: 'OldPassword123!' });

    assert.strictEqual(oldLoginRes.statusCode, 401);

    // 5. Attempt login with NEW password -> Must SUCCEED (200)
    const newLoginRes = await request(app)
      .post('/api/auth/login')
      .send({ email: 'resetuser@homeserve.tech', password: 'BrandNewPassword2026!' });

    assert.strictEqual(newLoginRes.statusCode, 200);
    assert.strictEqual(newLoginRes.body.success, true);
  });

  // 6. Sensitive Information Exposure
  it('Information Disclosure: Password hash and refreshToken are never exposed in user objects', async () => {
    const res = await request(app)
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${customerToken}`);

    assert.strictEqual(res.statusCode, 200);
    const userObj = res.body.data.user;
    assert.strictEqual(userObj.password, undefined, 'Password field must never be exposed');
    assert.strictEqual(userObj.refreshToken, undefined, 'RefreshToken must never be exposed');
    assert.strictEqual(userObj.resetPasswordToken, undefined, 'ResetPasswordToken must never be exposed');
  });
});

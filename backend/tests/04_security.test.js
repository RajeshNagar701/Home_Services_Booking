const { describe, it, before, after } = require('node:test');
const assert = require('node:assert/strict');
const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../src/server');
const { User, Address, Complaint, Booking, Review, Service } = require('../src/models');
const { BOOKING_STATUS, ROLES } = require('../src/config/constants');

describe('04. Application Security & Vulnerability Test Suite', () => {
  let customer1Token = '';
  let customer2Token = '';
  let customer1Address = null;
  let customer1Complaint = null;
  let activeBooking = null;

  before(async () => {
    if (mongoose.connection.readyState !== 1) {
      await mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/homeserve');
    }

    // Customer 1
    const cust1Res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'john.doe@gmail.com', password: 'CustomerPassword123!' });
    customer1Token = cust1Res.body.data.token;

    // Customer 2
    const cust2Res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'anita.sharma@gmail.com', password: 'CustomerPassword123!' });
    customer2Token = cust2Res.body.data.token;

    // Create an address for Customer 1
    customer1Address = await Address.create({
      user: cust1Res.body.data.user.id,
      streetAddress: 'Flat 404, Sea Green Apts',
      city: 'Mumbai',
      state: 'Maharashtra',
      pincode: '400001',
      contactPhone: '+91 9820011111',
      type: 'home'
    });

    // Find a booking for Customer 1
    activeBooking = await Booking.findOne({ customer: cust1Res.body.data.user.id });

    if (activeBooking) {
      customer1Complaint = await Complaint.create({
        booking: activeBooking._id,
        raisedBy: cust1Res.body.data.user.id,
        provider: activeBooking.provider,
        subject: 'Confidential billing dispute',
        description: 'Customer proprietary billing note.',
        priority: 'high',
        status: 'open'
      });
    }
  });

  after(async () => {
    if (customer1Address) await Address.findByIdAndDelete(customer1Address._id);
    if (customer1Complaint) await Complaint.findByIdAndDelete(customer1Complaint._id);
    await mongoose.disconnect();
  });

  // 1. NoSQL Injection
  it('NoSQL Injection: Operator injection ($ne, $gt) in login body is sanitized and fails authentication', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({
        email: { $ne: null },
        password: { $gt: '' }
      });

    // Since sanitizeObject strips $ keys, email and password become empty, triggering 400
    assert.strictEqual(res.statusCode, 400);
    assert.strictEqual(res.body.success, false);
    assert.match(res.body.message, /please provide both email and password/i);
  });

  // 2. Cross-Site Scripting (XSS)
  it('XSS Sanitization: Harmful <script> tags are neutralized in complaint description', async () => {
    if (!activeBooking) return;

    const xssPayload = "Billing error <script>alert('malicious_xss_execution')</script> please review.";
    const res = await request(app)
      .post('/api/complaints')
      .set('Authorization', `Bearer ${customer1Token}`)
      .send({
        bookingId: activeBooking._id,
        subject: 'Invoice clarification',
        description: xssPayload
      });

    assert.strictEqual(res.statusCode, 201);
    // Verify script tag was stripped
    assert.strictEqual(res.body.data.description.includes('<script>'), false);
    assert.strictEqual(res.body.data.description.includes('malicious_xss_execution'), false);

    await Complaint.findByIdAndDelete(res.body.data._id);
  });

  // 3. Broken Access Control & IDOR on Customer Addresses
  it('IDOR: Customer 2 CANNOT read Customer 1 address (Scoped to authenticated user)', async () => {
    const res = await request(app)
      .get('/api/customers/addresses')
      .set('Authorization', `Bearer ${customer2Token}`);

    assert.strictEqual(res.statusCode, 200);
    const addresses = res.body.data;
    const containsCust1Addr = addresses.some(a => a._id === customer1Address._id.toString());
    assert.strictEqual(containsCust1Addr, false, 'Addresses list must be tenant-isolated to caller');
  });

  it('IDOR: Customer 2 CANNOT update or tamper with Customer 1 address (HTTP 404)', async () => {
    const res = await request(app)
      .put(`/api/customers/addresses/${customer1Address._id}`)
      .set('Authorization', `Bearer ${customer2Token}`)
      .send({ streetAddress: 'Hacked Address Tampered' });

    assert.strictEqual(res.statusCode, 404);
    assert.strictEqual(res.body.success, false);

    // Verify address was NOT tampered
    const dbAddr = await Address.findById(customer1Address._id);
    assert.strictEqual(dbAddr.streetAddress, 'Flat 404, Sea Green Apts');
  });

  it('IDOR: Customer 2 CANNOT delete Customer 1 address (HTTP 404)', async () => {
    const res = await request(app)
      .delete(`/api/customers/addresses/${customer1Address._id}`)
      .set('Authorization', `Bearer ${customer2Token}`);

    assert.strictEqual(res.statusCode, 404);

    const dbAddr = await Address.findById(customer1Address._id);
    assert.ok(dbAddr, 'Address must remain intact in DB');
  });

  // 4. Broken Access Control & IDOR on Complaints
  it('IDOR: Customer 2 CANNOT view Customer 1 private complaints', async () => {
    const res = await request(app)
      .get('/api/complaints/my-complaints')
      .set('Authorization', `Bearer ${customer2Token}`);

    assert.strictEqual(res.statusCode, 200);
    const complaints = res.body.data;
    if (customer1Complaint) {
      const containsCust1Complaint = complaints.some(c => c._id === customer1Complaint._id.toString());
      assert.strictEqual(containsCust1Complaint, false, 'Complaints must be isolated');
    }
  });

  // 5. Rate Limiting Test
  it('Rate Limiting: Exceeding auth attempt threshold triggers HTTP 429 Too Many Requests', async () => {
    // We send 4 requests with x-test-rate-limit header which enforces threshold of 3
    const attempts = [];
    for (let i = 0; i < 4; i++) {
      attempts.push(
        request(app)
          .post('/api/auth/login')
          .set('x-test-rate-limit', 'true')
          .send({ email: 'spam@homeserve.tech', password: 'SpamPassword123!' })
      );
    }

    const responses = await Promise.all(attempts);
    const rateLimitedResponses = responses.filter(r => r.statusCode === 429);
    assert.ok(rateLimitedResponses.length > 0, 'At least 1 request must receive HTTP 429 Too Many Requests');
  });

  // 6. Security Headers (Helmet) & CORS
  it('Security Headers: Helmet protective HTTP response headers are present', async () => {
    const res = await request(app).get('/api/health');

    assert.strictEqual(res.statusCode, 200);
    assert.strictEqual(res.headers['x-content-type-options'], 'nosniff');
    assert.ok(res.headers['cross-origin-resource-policy']);
  });

  // 7. File Upload Validation
  it('File Upload: Non-image, non-PDF file extension is rejected with HTTP 400', async () => {
    const res = await request(app)
      .post('/api/upload/file')
      .set('Authorization', `Bearer ${customer1Token}`)
      .attach('file', Buffer.from('echo "Malicious script execution"'), 'malicious.sh');

    assert.strictEqual(res.statusCode, 400);
    assert.strictEqual(res.body.success, false);
    assert.match(res.body.message, /invalid file type/i);
  });
});

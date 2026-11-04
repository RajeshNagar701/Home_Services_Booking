const { describe, it, before, after } = require('node:test');
const assert = require('node:assert/strict');
const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../src/server');
const { User, Service, Provider, Booking, Availability, SlotAllocation } = require('../src/models');
const { BOOKING_STATUS, ROLES } = require('../src/config/constants');

describe('05. Performance, Concurrency & Indexing Audit Suite', () => {
  let customerToken = '';
  let activeService = null;

  before(async () => {
    if (mongoose.connection.readyState !== 1) {
      await mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/homeserve');
    }

    // Clean up any previous test artifacts
    await Booking.deleteMany({ bookingDate: '2026-12-31' });
    await SlotAllocation.deleteMany({ bookingDate: '2026-12-31' });

    const custRes = await request(app)
      .post('/api/auth/login')
      .send({ email: 'john.doe@gmail.com', password: 'CustomerPassword123!' });
    customerToken = custRes.body.data.token;

    activeService = await Service.findOne({ isActive: true }).populate('provider');
  });

  after(async () => {
    // Cleanup concurrency test bookings and slot allocations
    await Booking.deleteMany({ bookingDate: '2026-12-31' });
    await SlotAllocation.deleteMany({ bookingDate: '2026-12-31' });
    await mongoose.disconnect();
  });

  // 1. API Response Times (< 250ms)
  it('Latency: High-frequency catalog endpoints respond within 250ms', async () => {
    const t0 = Date.now();
    const res = await request(app).get('/api/services?limit=12&page=1');
    const elapsed = Date.now() - t0;

    assert.strictEqual(res.statusCode, 200);
    assert.ok(elapsed < 250, `Catalog endpoint took ${elapsed}ms (expected < 250ms)`);
  });

  it('Latency: Authenticated user bookings query responds within 250ms', async () => {
    const t0 = Date.now();
    const res = await request(app)
      .get('/api/bookings/my-bookings?page=1&limit=10')
      .set('Authorization', `Bearer ${customerToken}`);
    const elapsed = Date.now() - t0;

    assert.strictEqual(res.statusCode, 200);
    assert.ok(elapsed < 250, `My Bookings took ${elapsed}ms (expected < 250ms)`);
  });

  // 2. Pagination Calculations
  it('Pagination: Correctly handles page limit, total items, and totalPages metadata', async () => {
    const res = await request(app).get('/api/services?limit=2&page=1');

    assert.strictEqual(res.statusCode, 200);
    assert.strictEqual(res.body.success, true);
    assert.ok(res.body.data.length <= 2);
    assert.strictEqual(res.body.pagination.page, 1);
    assert.strictEqual(res.body.pagination.limit, 2);
    assert.ok(res.body.pagination.total >= 0);
    assert.ok(res.body.pagination.totalPages >= 1);
  });

  // 3. Database Indexes Verification
  it('Database Indexes: MongoDB collections have indexes for fast query performance', async () => {
    const bookingIndexes = await Booking.collection.indexes();
    const indexKeyNames = bookingIndexes.map(idx => Object.keys(idx.key).join('_'));

    // Check composite index { provider: 1, bookingDate: 1, timeSlot: 1, status: 1 }
    const hasSlotIndex = indexKeyNames.some(k => k.includes('provider') && k.includes('bookingDate') && k.includes('timeSlot'));
    assert.strictEqual(hasSlotIndex, true, 'Booking collection must index provider + bookingDate + timeSlot');

    // Check user email unique index
    const userIndexes = await User.collection.indexes();
    const userIndexKeys = userIndexes.map(idx => Object.keys(idx.key).join('_'));
    const hasEmailIndex = userIndexKeys.some(k => k.includes('email'));
    assert.strictEqual(hasEmailIndex, true, 'User collection must index email');
  });

  // 4. Concurrent Booking Requests & Race Conditions
  it('Concurrency: 5 simultaneous booking requests for a single remaining slot allows only 1 and rejects 4 (HTTP 409)', async () => {
    const testDate = '2026-12-31';
    const testSlot = '08:00 - 10:00';

    // Provider has maxBookingsPerSlot = 2. Let's pre-fill 1 booking so exactly 1 slot remains!
    await Booking.create({
      bookingReference: `HSB-RACE-PREFILL`,
      customer: new mongoose.Types.ObjectId(),
      provider: activeService.provider._id,
      service: activeService._id,
      bookingDate: testDate,
      timeSlot: testSlot,
      serviceAddress: { streetAddress: 'Race St', city: 'Mumbai', state: 'MH', pincode: '400001', contactPhone: '999' },
      pricing: { basePrice: 500, discount: 0, platformFee: 49, tax: 0, totalAmount: 549 },
      status: BOOKING_STATUS.ACCEPTED
    });

    // Fire 5 simultaneous requests for the exact same slot
    const concurrentRequests = Array.from({ length: 5 }).map((_, idx) =>
      request(app)
        .post('/api/bookings')
        .set('Authorization', `Bearer ${customerToken}`)
        .send({
          serviceId: activeService._id,
          bookingDate: testDate,
          timeSlot: testSlot,
          serviceAddress: { streetAddress: `Unit ${idx}`, city: 'Mumbai', state: 'MH', pincode: '400001', contactPhone: '999' }
        })
    );

    const results = await Promise.all(concurrentRequests);
    const successes = results.filter(r => r.statusCode === 201);
    const conflicts = results.filter(r => r.statusCode === 409);

    // Exactly 1 must have succeeded (filling the 2nd slot to reach limit 2)
    assert.strictEqual(successes.length, 1, `Expected exactly 1 booking success, got ${successes.length}`);
    // The other 4 must have received 409 Conflict
    assert.strictEqual(conflicts.length, 4, `Expected 4 conflicts, got ${conflicts.length}`);

    // Verify DB count in this slot is strictly 2
    const totalBooked = await Booking.countDocuments({
      provider: activeService.provider._id,
      bookingDate: testDate,
      timeSlot: testSlot,
      status: { $nin: [BOOKING_STATUS.CANCELLED, BOOKING_STATUS.REJECTED] }
    });
    assert.strictEqual(totalBooked, 2, 'Total active bookings in slot must not exceed capacity 2');
  });
});

const { describe, it, before, after } = require('node:test');
const assert = require('node:assert/strict');
const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../src/server');
const { User, Service, Provider, Booking, Availability, Customer, SlotAllocation } = require('../src/models');
const { BOOKING_STATUS, PAYMENT_STATUS, ROLES, PROVIDER_STATUS } = require('../src/config/constants');

describe('02. Booking Engine & State Machine Test Suite', () => {
  let customer1Token = '';
  let customer2Token = '';
  let providerToken = '';
  let tech1Token = '';
  let tech2Token = '';
  let activeService = null;
  let testBooking = null;

  before(async () => {
    if (mongoose.connection.readyState !== 1) {
      await mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/homeserve');
    }

    // Clean up test data from any previous runs
    await Booking.deleteMany({ bookingDate: '2026-12-15' });
    await SlotAllocation.deleteMany({ bookingDate: '2026-12-15' });

    // Authenticate Customer 1
    const cust1Res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'john.doe@gmail.com', password: 'CustomerPassword123!' });
    customer1Token = cust1Res.body.data.token;

    // Authenticate Customer 2
    const cust2Res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'anita.sharma@gmail.com', password: 'CustomerPassword123!' });
    customer2Token = cust2Res.body.data.token;

    // Authenticate Provider 1 (Approved: Apex Homes)
    const provRes = await request(app)
      .post('/api/auth/login')
      .send({ email: 'apex.homes@homeserve.tech', password: 'ProviderPassword123!' });
    providerToken = provRes.body.data.token;

    // Authenticate Technician 1 (Rahul Sharma)
    const t1Res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'rahul.tech@homeserve.tech', password: 'TechPassword123!' });
    tech1Token = t1Res.body.data.token;

    // Authenticate Technician 2 (Amit Kulkarni)
    const t2Res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'amit.tech@homeserve.tech', password: 'TechPassword123!' });
    tech2Token = t2Res.body.data.token;

    // Get an active approved service
    activeService = await Service.findOne({ isActive: true }).populate('provider');
  });

  after(async () => {
    // Clean up test bookings and slot allocations
    await Booking.deleteMany({ bookingDate: '2026-12-15' });
    await SlotAllocation.deleteMany({ bookingDate: '2026-12-15' });
    await mongoose.disconnect();
  });

  // 1. Booking Creation
  it('Customer: Successfully creates a new booking', async () => {
    const bookingPayload = {
      serviceId: activeService._id,
      bookingDate: '2026-12-15',
      timeSlot: '10:00 - 12:00',
      serviceAddress: {
        streetAddress: '702 Silver Oak Heights',
        landmark: 'Near Metro Station',
        city: 'Mumbai',
        state: 'Maharashtra',
        pincode: '400050',
        contactPhone: '+91 9820099887'
      },
      problemDescription: 'AC cooling coil inspection and deep cleaning required.'
    };

    const res = await request(app)
      .post('/api/bookings')
      .set('Authorization', `Bearer ${customer1Token}`)
      .send(bookingPayload);

    assert.strictEqual(res.statusCode, 201);
    assert.strictEqual(res.body.success, true);
    assert.ok(res.body.data.bookingReference.startsWith('HSB-'));
    assert.strictEqual(res.body.data.status, BOOKING_STATUS.PENDING);
    testBooking = res.body.data;
  });

  it('Validation: Missing required fields (serviceId, slot) returns HTTP 400', async () => {
    const res = await request(app)
      .post('/api/bookings')
      .set('Authorization', `Bearer ${customer1Token}`)
      .send({ bookingDate: '2026-12-15' });

    assert.strictEqual(res.statusCode, 400);
    assert.strictEqual(res.body.success, false);
  });

  // 2. Double-Booking Prevention
  it('Double Booking: Reject booking when time slot capacity is saturated (HTTP 409)', async () => {
    // Fill up the slot capacity for 2026-12-15 at 14:00 - 16:00
    const slot = '14:00 - 16:00';
    const date = '2026-12-15';

    // Create 2 bookings directly to hit maxBookingsPerSlot (limit = 2)
    await Booking.create([
      {
        bookingReference: `HSB-TEST-CAP-1`,
        customer: new mongoose.Types.ObjectId(),
        provider: activeService.provider._id,
        service: activeService._id,
        bookingDate: date,
        timeSlot: slot,
        serviceAddress: { streetAddress: 'A', city: 'Mumbai', state: 'MH', pincode: '400001', contactPhone: '999' },
        pricing: { basePrice: 500, discount: 0, platformFee: 49, tax: 0, totalAmount: 549 },
        status: BOOKING_STATUS.ACCEPTED
      },
      {
        bookingReference: `HSB-TEST-CAP-2`,
        customer: new mongoose.Types.ObjectId(),
        provider: activeService.provider._id,
        service: activeService._id,
        bookingDate: date,
        timeSlot: slot,
        serviceAddress: { streetAddress: 'B', city: 'Mumbai', state: 'MH', pincode: '400001', contactPhone: '999' },
        pricing: { basePrice: 500, discount: 0, platformFee: 49, tax: 0, totalAmount: 549 },
        status: BOOKING_STATUS.ACCEPTED
      }
    ]);

    // Now try to book the 3rd booking into that exact saturated slot
    const res = await request(app)
      .post('/api/bookings')
      .set('Authorization', `Bearer ${customer1Token}`)
      .send({
        serviceId: activeService._id,
        bookingDate: date,
        timeSlot: slot,
        serviceAddress: { streetAddress: 'C', city: 'Mumbai', state: 'MH', pincode: '400001', contactPhone: '999' }
      });

    assert.strictEqual(res.statusCode, 409);
    assert.strictEqual(res.body.success, false);
    assert.match(res.body.message, /fully booked/i);
  });

  // 3. Rescheduling Booking
  it('Rescheduling: Customer successfully reschedules pending booking to new slot', async () => {
    const res = await request(app)
      .put(`/api/bookings/${testBooking._id}/reschedule`)
      .set('Authorization', `Bearer ${customer1Token}`)
      .send({
        newDate: '2026-12-15',
        newTimeSlot: '16:00 - 18:00',
        reason: 'Office schedule shift'
      });

    assert.strictEqual(res.statusCode, 200);
    assert.strictEqual(res.body.success, true);
    assert.strictEqual(res.body.data.timeSlot, '16:00 - 18:00');
  });

  it('Rescheduling: Attempting to reschedule to a fully booked slot returns HTTP 409', async () => {
    const res = await request(app)
      .put(`/api/bookings/${testBooking._id}/reschedule`)
      .set('Authorization', `Bearer ${customer1Token}`)
      .send({
        newDate: '2026-12-15',
        newTimeSlot: '14:00 - 16:00' // This slot was saturated earlier
      });

    assert.strictEqual(res.statusCode, 409);
    assert.match(res.body.message, /fully booked/i);
  });

  // 4. Booking Lifecycle & State Machine Transitions
  it('Provider: Accepts pending booking (PENDING -> ACCEPTED)', async () => {
    const res = await request(app)
      .put(`/api/bookings/${testBooking._id}/accept`)
      .set('Authorization', `Bearer ${providerToken}`);

    assert.strictEqual(res.statusCode, 200);
    assert.strictEqual(res.body.data.status, BOOKING_STATUS.ACCEPTED);
  });

  it('Provider: Assigns Technician (ACCEPTED -> TECHNICIAN_ASSIGNED)', async () => {
    const techUser = await User.findOne({ email: 'rahul.tech@homeserve.tech' });
    const technician = await mongoose.model('Technician').findOne({ user: techUser._id });

    const res = await request(app)
      .put(`/api/bookings/${testBooking._id}/assign-technician`)
      .set('Authorization', `Bearer ${providerToken}`)
      .send({ technicianId: technician._id });

    assert.strictEqual(res.statusCode, 200);
    assert.strictEqual(res.body.data.status, BOOKING_STATUS.TECHNICIAN_ASSIGNED);
  });

  it('State Machine: Technician cannot skip to completed without going through progression (HTTP 400)', async () => {
    const res = await request(app)
      .post(`/api/bookings/${testBooking._id}/complete`)
      .set('Authorization', `Bearer ${tech1Token}`)
      .send({ technicianRemarks: 'Trying to finish prematurely' });

    assert.strictEqual(res.statusCode, 400);
    assert.match(res.body.message, /job must be 'in_progress'/i);
  });

  it('State Machine: Technician marks ON_THE_WAY -> ARRIVED -> IN_PROGRESS sequentially', async () => {
    // 1. Mark ON_THE_WAY
    const r1 = await request(app)
      .put(`/api/bookings/${testBooking._id}/technician-status`)
      .set('Authorization', `Bearer ${tech1Token}`)
      .send({ status: BOOKING_STATUS.ON_THE_WAY });
    assert.strictEqual(r1.statusCode, 200);
    assert.strictEqual(r1.body.data.status, BOOKING_STATUS.ON_THE_WAY);

    // 2. Mark ARRIVED
    const r2 = await request(app)
      .put(`/api/bookings/${testBooking._id}/technician-status`)
      .set('Authorization', `Bearer ${tech1Token}`)
      .send({ status: BOOKING_STATUS.ARRIVED });
    assert.strictEqual(r2.statusCode, 200);
    assert.strictEqual(r2.body.data.status, BOOKING_STATUS.ARRIVED);

    // 3. Mark IN_PROGRESS
    const r3 = await request(app)
      .put(`/api/bookings/${testBooking._id}/technician-status`)
      .set('Authorization', `Bearer ${tech1Token}`)
      .send({ status: BOOKING_STATUS.IN_PROGRESS });
    assert.strictEqual(r3.statusCode, 200);
    assert.strictEqual(r3.body.data.status, BOOKING_STATUS.IN_PROGRESS);
  });

  it('Cancellation Rule: Customer CANNOT cancel a booking that is already IN_PROGRESS (HTTP 400)', async () => {
    const res = await request(app)
      .post(`/api/bookings/${testBooking._id}/cancel`)
      .set('Authorization', `Bearer ${customer1Token}`)
      .send({ cancellationReason: 'Changed mind' });

    assert.strictEqual(res.statusCode, 400);
    assert.match(res.body.message, /cannot cancel booking in 'in_progress'/i);
  });

  it('Technician: Successfully completes job (IN_PROGRESS -> COMPLETED) and calculates commission', async () => {
    const res = await request(app)
      .post(`/api/bookings/${testBooking._id}/complete`)
      .set('Authorization', `Bearer ${tech1Token}`)
      .send({
        technicianRemarks: 'Cleaned condenser coils, refilled refrigerant gas, checked airflow. Working at 18C.',
        completionImages: ['https://example.com/ac_done.jpg']
      });

    assert.strictEqual(res.statusCode, 200);
    assert.strictEqual(res.body.data.status, BOOKING_STATUS.COMPLETED);

    // Verify Platform Commission was automatically generated
    const commission = await mongoose.model('Commission').findOne({ booking: testBooking._id });
    assert.ok(commission, 'Commission record must exist');
    assert.strictEqual(commission.payoutStatus, 'settled');
  });

  // 5. IDOR & Access Control
  it('IDOR Prevention: Customer 2 CANNOT access or cancel Customer 1 booking (HTTP 403 / 404)', async () => {
    // Attempt get details
    const getRes = await request(app)
      .get(`/api/bookings/${testBooking._id}`)
      .set('Authorization', `Bearer ${customer2Token}`);

    assert.strictEqual(getRes.statusCode, 403);
    assert.match(getRes.body.message, /not authorized/i);

    // Attempt cancellation
    const cancelRes = await request(app)
      .post(`/api/bookings/${testBooking._id}/cancel`)
      .set('Authorization', `Bearer ${customer2Token}`)
      .send({ cancellationReason: 'Malicious cancel' });

    assert.strictEqual(cancelRes.statusCode, 404);
  });

  it('IDOR Prevention: Unassigned Technician 2 CANNOT update Technician 1 job (HTTP 404)', async () => {
    const res = await request(app)
      .put(`/api/bookings/${testBooking._id}/technician-status`)
      .set('Authorization', `Bearer ${tech2Token}`)
      .send({ status: BOOKING_STATUS.ARRIVED });

    assert.strictEqual(res.statusCode, 404);
    assert.match(res.body.message, /not assigned to you/i);
  });

  // 6. Invoice Generation
  it('Invoice: Validates complete structured invoice generation', async () => {
    const res = await request(app)
      .get(`/api/bookings/${testBooking._id}/invoice`)
      .set('Authorization', `Bearer ${customer1Token}`);

    assert.strictEqual(res.statusCode, 200);
    const invoice = res.body.data;
    assert.ok(invoice.invoiceNumber.startsWith('INV-'));
    assert.ok(invoice.customer.name);
    assert.ok(invoice.provider.businessName);
    assert.ok(invoice.items.length > 0);
    assert.ok(invoice.breakdown.totalAmount >= 0);
  });
});

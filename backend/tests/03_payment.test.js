const { describe, it, before, after } = require('node:test');
const assert = require('node:assert/strict');
const request = require('supertest');
const mongoose = require('mongoose');
const crypto = require('crypto');
const app = require('../src/server');
const { User, Service, Provider, Booking, Coupon, Payment, Transaction, Commission } = require('../src/models');
const { BOOKING_STATUS, PAYMENT_STATUS, ROLES } = require('../src/config/constants');

describe('03. Payments, Webhooks, Coupons & Financials Test Suite', () => {
  let customerToken = '';
  let adminToken = '';
  let providerToken = '';
  let testBooking = null;
  let testCoupon = null;

  before(async () => {
    if (mongoose.connection.readyState !== 1) {
      await mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/homeserve');
    }

    // Customer
    const custRes = await request(app)
      .post('/api/auth/login')
      .send({ email: 'john.doe@gmail.com', password: 'CustomerPassword123!' });
    customerToken = custRes.body.data.token;

    // Super Admin
    const adminRes = await request(app)
      .post('/api/auth/login')
      .send({ email: 'admin@homeserve.tech', password: 'AdminPassword123!' });
    adminToken = adminRes.body.data.token;

    // Provider
    const provRes = await request(app)
      .post('/api/auth/login')
      .send({ email: 'apex.homes@homeserve.tech', password: 'ProviderPassword123!' });
    providerToken = provRes.body.data.token;

    // Fetch an active service
    const service = await Service.findOne({ isActive: true }).populate('provider');

    // Create a fresh test booking for payment verification
    testBooking = await Booking.create({
      bookingReference: `HSB-PAYTEST-${Date.now().toString().slice(-4)}`,
      customer: custRes.body.data.user.id,
      provider: service.provider._id,
      service: service._id,
      bookingDate: '2026-12-20',
      timeSlot: '11:00 - 13:00',
      serviceAddress: {
        streetAddress: '101 Marine Drive',
        city: 'Mumbai',
        state: 'Maharashtra',
        pincode: '400020',
        contactPhone: '+91 9820011223'
      },
      pricing: {
        basePrice: 1000,
        discount: 100,
        platformFee: 49,
        tax: 0,
        totalAmount: 949
      },
      status: BOOKING_STATUS.PENDING,
      paymentStatus: PAYMENT_STATUS.PENDING
    });
  });

  after(async () => {
    if (testBooking) {
      await Booking.findByIdAndDelete(testBooking._id);
      await Payment.deleteMany({ booking: testBooking._id });
      await Transaction.deleteMany({ booking: testBooking._id });
      await Commission.deleteMany({ booking: testBooking._id });
    }
    await Coupon.deleteMany({ code: { $in: ['TEST50', 'EXPIRED20', 'MINORDER1000'] } });
    await mongoose.disconnect();
  });

  // 1. Razorpay Order Creation
  it('Payment Order: Creates Razorpay order for customer booking', async () => {
    const res = await request(app)
      .post('/api/payments/create-order')
      .set('Authorization', `Bearer ${customerToken}`)
      .send({ bookingId: testBooking._id });

    assert.strictEqual(res.statusCode, 200);
    assert.strictEqual(res.body.success, true);
    assert.ok(res.body.data.orderId.startsWith('order_'));
    assert.strictEqual(res.body.data.amount, 949);
    assert.strictEqual(res.body.data.currency, 'INR');
  });

  // 2. Signature Verification
  it('Payment Verification: Forged signature is rejected with HTTP 400', async () => {
    const res = await request(app)
      .post('/api/payments/verify')
      .set('Authorization', `Bearer ${customerToken}`)
      .send({
        bookingId: testBooking._id,
        razorpayOrderId: 'order_mock_test_123',
        razorpayPaymentId: 'pay_mock_test_123',
        razorpaySignature: 'forged_invalid_signature_hash_xyz'
      });

    assert.strictEqual(res.statusCode, 400);
    assert.strictEqual(res.body.success, false);
    assert.match(res.body.message, /invalid payment signature/i);
  });

  it('Payment Verification: Valid signature marks booking as PAID and calculates platform commission', async () => {
    const orderId = 'order_mock_verified_001';
    const paymentId = 'pay_mock_verified_001';
    const secret = process.env.RAZORPAY_KEY_SECRET || 'homeserve_mock_secret_key_88';

    // Generate genuine HMAC signature
    const validSignature = crypto
      .createHmac('sha256', secret)
      .update(`${orderId}|${paymentId}`)
      .digest('hex');

    const res = await request(app)
      .post('/api/payments/verify')
      .set('Authorization', `Bearer ${customerToken}`)
      .send({
        bookingId: testBooking._id,
        razorpayOrderId: orderId,
        razorpayPaymentId: paymentId,
        razorpaySignature: validSignature
      });

    assert.strictEqual(res.statusCode, 200);
    assert.strictEqual(res.body.success, true);
    assert.strictEqual(res.body.data.paymentStatus, PAYMENT_STATUS.PAID);

    // Verify Commission Auto-Calculation (15% platform cut on total 949 => 142 platform fee, 807 provider payout)
    const commission = await Commission.findOne({ booking: testBooking._id });
    assert.ok(commission, 'Commission record must be generated');
    assert.strictEqual(commission.totalBookingAmount, 949);
    assert.strictEqual(commission.commissionPercentage, 15);
    assert.strictEqual(commission.platformCommissionAmount, Math.round((949 * 15) / 100));
    assert.strictEqual(commission.providerPayoutAmount, 949 - commission.platformCommissionAmount);
  });

  // 3. Webhook Handling & Idempotency
  it('Webhook: Invalid webhook signature returns HTTP 400', async () => {
    const res = await request(app)
      .post('/api/payments/webhook')
      .set('x-razorpay-signature', 'bogus_signature')
      .send({ event: 'payment.captured' });

    assert.strictEqual(res.statusCode, 400);
    assert.strictEqual(res.body.success, false);
    assert.match(res.body.message, /invalid webhook signature/i);
  });

  it('Webhook: Missing webhook signature returns HTTP 400', async () => {
    const res = await request(app)
      .post('/api/payments/webhook')
      .send({ event: 'payment.captured' });

    assert.strictEqual(res.statusCode, 400);
    assert.match(res.body.message, /missing webhook signature/i);
  });

  it('Webhook Idempotency: Duplicate payment.captured webhook does not duplicate transactions', async () => {
    // Webhook secret
    const secret = process.env.RAZORPAY_WEBHOOK_SECRET || process.env.RAZORPAY_KEY_SECRET || 'homeserve_mock_secret_key_88';

    // Find the payment linked to testBooking
    const payment = await Payment.findOne({ booking: testBooking._id });

    const webhookPayload = {
      event: 'payment.captured',
      payload: {
        payment: {
          entity: {
            id: payment.razorpayPaymentId || 'pay_mock_verified_001',
            order_id: payment.razorpayOrderId || 'order_mock_verified_001',
            amount: 94900,
            status: 'captured'
          }
        }
      }
    };

    const payloadString = JSON.stringify(webhookPayload);
    const validWebhookSig = crypto
      .createHmac('sha256', secret)
      .update(payloadString)
      .digest('hex');

    const txCountBefore = await Transaction.countDocuments({ booking: testBooking._id });

    // Send duplicate webhook
    const res = await request(app)
      .post('/api/payments/webhook')
      .set('x-razorpay-signature', validWebhookSig)
      .send(webhookPayload);

    assert.strictEqual(res.statusCode, 200);
    assert.strictEqual(res.body.data.idempotent, true);

    const txCountAfter = await Transaction.countDocuments({ booking: testBooking._id });
    assert.strictEqual(txCountAfter, txCountBefore, 'Transaction count must NOT increase on duplicate webhook');
  });

  // 4. Refund Processing
  it('Refund: Super Admin processes refund for paid booking', async () => {
    const res = await request(app)
      .post(`/api/payments/${testBooking._id}/refund`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ reason: 'Customer service guarantee claim' });

    assert.strictEqual(res.statusCode, 200);
    assert.strictEqual(res.body.success, true);
    assert.strictEqual(res.body.data.paymentStatus, PAYMENT_STATUS.REFUNDED);

    // Verify refund transaction created
    const refundTx = await Transaction.findOne({ booking: testBooking._id, type: 'refund' });
    assert.ok(refundTx, 'Refund transaction audit log must exist');

    // Verify commission reversed
    const commission = await Commission.findOne({ booking: testBooking._id });
    assert.strictEqual(commission.payoutStatus, 'reversed');
  });

  it('Refund: Reject refund attempt on unpaid booking (HTTP 400)', async () => {
    // Create an unpaid booking
    const unpaidBooking = await Booking.create({
      bookingReference: `HSB-UNPAID-${Date.now().toString().slice(-4)}`,
      customer: testBooking.customer,
      provider: testBooking.provider,
      service: testBooking.service,
      bookingDate: '2026-12-25',
      timeSlot: '10:00 - 12:00',
      serviceAddress: testBooking.serviceAddress,
      pricing: { basePrice: 500, discount: 0, platformFee: 49, tax: 0, totalAmount: 549 },
      status: BOOKING_STATUS.PENDING,
      paymentStatus: PAYMENT_STATUS.PENDING
    });

    const res = await request(app)
      .post(`/api/payments/${unpaidBooking._id}/refund`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ reason: 'Premature refund' });

    assert.strictEqual(res.statusCode, 400);
    assert.match(res.body.message, /must be 'paid'/i);

    await Booking.findByIdAndDelete(unpaidBooking._id);
  });

  // 5. Coupon Engine Validation
  it('Coupons: Validates percentage coupon calculation with max discount cap', async () => {
    await Coupon.create({
      code: 'TEST50',
      discountType: 'percentage',
      discountValue: 50, // 50%
      minOrderAmount: 500,
      maxDiscountAmount: 300, // Capped at ₹300
      validTill: new Date(Date.now() + 86400000),
      usageLimit: 100,
      isActive: true
    });

    const res = await request(app)
      .post('/api/coupons/validate')
      .send({ code: 'TEST50', amount: 1000 });

    assert.strictEqual(res.statusCode, 200);
    // 50% of 1000 = 500, capped at maxDiscountAmount 300
    assert.strictEqual(res.body.data.calculatedDiscount, 300);
  });

  it('Coupons: Rejects coupon when booking amount is below minOrderAmount (HTTP 400)', async () => {
    const res = await request(app)
      .post('/api/coupons/validate')
      .send({ code: 'TEST50', amount: 300 }); // Below min 500

    assert.strictEqual(res.statusCode, 400);
    assert.match(res.body.message, /minimum booking amount/i);
  });

  it('Coupons: Rejects expired coupon (HTTP 404)', async () => {
    await Coupon.create({
      code: 'EXPIRED20',
      discountType: 'percentage',
      discountValue: 20,
      minOrderAmount: 100,
      validTill: new Date(Date.now() - 86400000), // Expired yesterday
      usageLimit: 100,
      isActive: true
    });

    const res = await request(app)
      .post('/api/coupons/validate')
      .send({ code: 'EXPIRED20', amount: 1000 });

    assert.strictEqual(res.statusCode, 404);
    assert.match(res.body.message, /expired coupon/i);
  });
});

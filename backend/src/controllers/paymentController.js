const { Booking, Payment, Transaction, Commission, Provider, Notification } = require('../models');
const AppError = require('../utils/AppError');
const { successResponse } = require('../utils/apiResponse');
const { PAYMENT_STATUS, BOOKING_STATUS } = require('../config/constants');
const { createOrder, verifySignature } = require('../services/paymentService');

/**
 * @desc    Create Razorpay Order for a booking
 * @route   POST /api/payments/create-order
 * @access  Private (Customer)
 */
const createPaymentOrder = async (req, res, next) => {
  try {
    const { bookingId } = req.body;

    const booking = await Booking.findOne({ _id: bookingId, customer: req.user._id });
    if (!booking) {
      return next(new AppError('Booking not found.', 404));
    }

    if (booking.paymentStatus === PAYMENT_STATUS.PAID) {
      return next(new AppError('This booking is already paid for.', 400));
    }

    const amount = booking.pricing.totalAmount;
    const orderData = await createOrder(amount, booking.bookingReference);

    // Create or update payment record
    await Payment.findOneAndUpdate(
      { booking: booking._id },
      {
        booking: booking._id,
        user: req.user._id,
        amount,
        currency: 'INR',
        razorpayOrderId: orderData.orderId,
        status: 'created'
      },
      { upsert: true, new: true }
    );

    return successResponse(res, 'Payment order created.', {
      orderId: orderData.orderId,
      amount,
      currency: 'INR',
      keyId: orderData.keyId,
      bookingReference: booking.bookingReference,
      customer: {
        name: `${req.user.firstName} ${req.user.lastName}`,
        email: req.user.email,
        phone: req.user.phone
      }
    });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Verify Razorpay payment signature & settle transaction
 * @route   POST /api/payments/verify
 * @access  Private (Customer)
 */
const verifyPayment = async (req, res, next) => {
  try {
    const { bookingId, razorpayOrderId, razorpayPaymentId, razorpaySignature } = req.body;

    const booking = await Booking.findOne({ _id: bookingId, customer: req.user._id }).populate('provider');
    if (!booking) {
      return next(new AppError('Booking not found.', 404));
    }

    const isValid = verifySignature(razorpayOrderId, razorpayPaymentId, razorpaySignature);
    if (!isValid) {
      return next(new AppError('Invalid payment signature. Payment verification failed.', 400));
    }

    // Update payment record
    const payment = await Payment.findOneAndUpdate(
      { booking: booking._id },
      {
        razorpayOrderId,
        razorpayPaymentId: razorpayPaymentId || `pay_mock_${Date.now()}`,
        razorpaySignature: razorpaySignature || `sig_mock_${Date.now()}`,
        status: 'captured'
      },
      { new: true, upsert: true }
    );

    // Create transaction audit log
    await Transaction.create({
      payment: payment._id,
      booking: booking._id,
      type: 'payment',
      amount: booking.pricing.totalAmount,
      status: 'success',
      referenceId: payment.razorpayPaymentId
    });

    // Update booking payment status
    booking.paymentStatus = PAYMENT_STATUS.PAID;
    booking.statusHistory.push({
      status: booking.status,
      timestamp: new Date(),
      updatedBy: req.user._id,
      remarks: `Online payment received (ID: ${payment.razorpayPaymentId})`
    });
    await booking.save();

    // Auto-calculate Platform Commission
    const totalAmount = booking.pricing.totalAmount;
    const commissionRate = (booking.provider && booking.provider.commissionRate) || 15;
    const platformCommissionAmount = Math.round((totalAmount * commissionRate) / 100);
    const providerPayoutAmount = Math.max(0, totalAmount - platformCommissionAmount);

    await Commission.findOneAndUpdate(
      { booking: booking._id },
      {
        provider: booking.provider._id,
        totalBookingAmount: totalAmount,
        commissionPercentage: commissionRate,
        platformCommissionAmount,
        providerPayoutAmount,
        payoutStatus: 'settled',
        settledAt: new Date()
      },
      { upsert: true, new: true }
    );

    return successResponse(res, 'Payment verified successfully. Booking is confirmed.', {
      bookingId: booking._id,
      bookingReference: booking.bookingReference,
      paymentStatus: booking.paymentStatus,
      paymentId: payment.razorpayPaymentId
    });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Razorpay Webhook Handler (with signature verification & idempotency)
 * @route   POST /api/payments/webhook
 * @access  Public (Webhook verification via HMAC)
 */
const handleWebhook = async (req, res, next) => {
  try {
    const crypto = require('crypto');
    const webhookSignature = req.headers['x-razorpay-signature'];
    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET || process.env.RAZORPAY_KEY_SECRET || 'homeserve_mock_secret_key_88';

    if (!webhookSignature) {
      return next(new AppError('Missing webhook signature.', 400));
    }

    const payload = JSON.stringify(req.body);
    const expectedSignature = crypto.createHmac('sha256', webhookSecret).update(payload).digest('hex');

    if (webhookSignature !== expectedSignature) {
      return next(new AppError('Invalid webhook signature.', 400));
    }

    const event = req.body.event;
    const paymentEntity = req.body.payload && req.body.payload.payment && req.body.payload.payment.entity;

    if (!paymentEntity) {
      return successResponse(res, 'Webhook received without payment entity.', { received: true });
    }

    const orderId = paymentEntity.order_id;
    const paymentId = paymentEntity.id;

    // Idempotency check: Find existing payment by razorpayOrderId or razorpayPaymentId
    const existingPayment = await Payment.findOne({
      $or: [{ razorpayOrderId: orderId }, { razorpayPaymentId: paymentId }]
    });

    if (!existingPayment) {
      return successResponse(res, 'Webhook acknowledged. No matching local payment found.', { received: true });
    }

    const booking = await Booking.findById(existingPayment.booking).populate('provider');
    if (!booking) {
      return successResponse(res, 'Webhook acknowledged. Associated booking not found.', { received: true });
    }

    // Handle Payment Captured
    if (event === 'payment.captured') {
      // Idempotency: if already paid, do not re-process or duplicate commissions
      if (booking.paymentStatus === PAYMENT_STATUS.PAID) {
        return successResponse(res, 'Payment already processed (idempotent duplicate webhook).', {
          idempotent: true,
          bookingId: booking._id
        });
      }

      existingPayment.status = 'captured';
      existingPayment.razorpayPaymentId = paymentId;
      await existingPayment.save();

      booking.paymentStatus = PAYMENT_STATUS.PAID;
      booking.statusHistory.push({
        status: booking.status,
        timestamp: new Date(),
        remarks: `Payment captured via webhook (ID: ${paymentId})`
      });
      await booking.save();

      await Transaction.create({
        payment: existingPayment._id,
        booking: booking._id,
        type: 'payment',
        amount: booking.pricing.totalAmount,
        status: 'success',
        referenceId: paymentId
      });

      // Platform commission calculation
      const totalAmount = booking.pricing.totalAmount;
      const commissionRate = (booking.provider && booking.provider.commissionRate) || 15;
      const platformCommissionAmount = Math.round((totalAmount * commissionRate) / 100);
      const providerPayoutAmount = Math.max(0, totalAmount - platformCommissionAmount);

      await Commission.findOneAndUpdate(
        { booking: booking._id },
        {
          provider: booking.provider._id,
          totalBookingAmount: totalAmount,
          commissionPercentage: commissionRate,
          platformCommissionAmount,
          providerPayoutAmount,
          payoutStatus: 'settled',
          settledAt: new Date()
        },
        { upsert: true, new: true }
      );
    } else if (event === 'payment.failed') {
      existingPayment.status = 'failed';
      await existingPayment.save();

      booking.paymentStatus = PAYMENT_STATUS.FAILED;
      booking.statusHistory.push({
        status: booking.status,
        timestamp: new Date(),
        remarks: `Payment attempt failed via webhook (Error: ${paymentEntity.error_description || 'Declined'})`
      });
      await booking.save();

      await Transaction.create({
        payment: existingPayment._id,
        booking: booking._id,
        type: 'payment',
        amount: booking.pricing.totalAmount,
        status: 'failed',
        referenceId: paymentId
      });
    }

    return successResponse(res, `Webhook event '${event}' processed successfully.`, { received: true });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Process refund for a booking
 * @route   POST /api/payments/:id/refund
 * @access  Private (Admin)
 */
const refundPayment = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { reason, refundAmount } = req.body;

    const booking = await Booking.findById(id).populate('provider');
    if (!booking) {
      return next(new AppError('Booking not found.', 404));
    }

    if (booking.paymentStatus !== PAYMENT_STATUS.PAID) {
      return next(new AppError(`Cannot refund booking with payment status '${booking.paymentStatus}'. Must be 'paid'.`, 400));
    }

    const amountToRefund = Number(refundAmount) || booking.pricing.totalAmount;
    const payment = await Payment.findOne({ booking: booking._id });

    // Create refund transaction
    const refundTransaction = await Transaction.create({
      payment: payment ? payment._id : null,
      booking: booking._id,
      type: 'refund',
      amount: amountToRefund,
      status: 'success',
      referenceId: `ref_${Date.now()}`
    });

    booking.paymentStatus = PAYMENT_STATUS.REFUNDED;
    booking.statusHistory.push({
      status: booking.status,
      timestamp: new Date(),
      updatedBy: req.user._id,
      remarks: `Refund of ₹${amountToRefund} processed. Reason: ${reason || 'Customer request / Cancellation'}`
    });
    await booking.save();

    // Reverse commission if previously settled
    await Commission.findOneAndUpdate(
      { booking: booking._id },
      { payoutStatus: 'reversed', remarks: 'Refund processed to customer' }
    );

    return successResponse(res, `Refund of ₹${amountToRefund} processed successfully.`, {
      bookingId: booking._id,
      bookingReference: booking.bookingReference,
      refundAmount: amountToRefund,
      refundTransactionId: refundTransaction._id,
      paymentStatus: booking.paymentStatus
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  createPaymentOrder,
  verifyPayment,
  handleWebhook,
  refundPayment
};

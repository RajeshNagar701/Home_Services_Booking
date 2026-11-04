const mongoose = require('mongoose');

const ROLES = {
  ADMIN: 'admin',
  CUSTOMER: 'customer',
  PROVIDER: 'provider',
  TECHNICIAN: 'technician'
};

const BOOKING_STATUS = {
  PENDING: 'pending',
  ACCEPTED: 'accepted',
  REJECTED: 'rejected',
  TECHNICIAN_ASSIGNED: 'technician_assigned',
  ON_THE_WAY: 'on_the_way',
  ARRIVED: 'arrived',
  IN_PROGRESS: 'in_progress',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled'
};

const PAYMENT_STATUS = {
  PENDING: 'pending',
  PAID: 'paid',
  FAILED: 'failed',
  REFUNDED: 'refunded'
};

const PAYMENT_METHODS = {
  RAZORPAY: 'razorpay',
  CASH_ON_DELIVERY: 'cash_on_delivery',
  CARD: 'card',
  UPI: 'upi'
};

const PROVIDER_STATUS = {
  PENDING: 'pending',
  APPROVED: 'approved',
  REJECTED: 'rejected'
};

const COMPLAINT_STATUS = {
  OPEN: 'open',
  UNDER_INVESTIGATION: 'under_investigation',
  RESOLVED: 'resolved',
  CLOSED: 'closed'
};

const COMPLAINT_PRIORITY = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high'
};

const DEFAULT_COMMISSION_RATE = 15; // 15% platform commission

module.exports = {
  ROLES,
  BOOKING_STATUS,
  PAYMENT_STATUS,
  PAYMENT_METHODS,
  PROVIDER_STATUS,
  COMPLAINT_STATUS,
  COMPLAINT_PRIORITY,
  DEFAULT_COMMISSION_RATE
};

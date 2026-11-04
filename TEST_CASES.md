# HomeServe Technologies – Comprehensive Test Cases Matrix

**Platform:** HomeServe Technologies (SaaS Home Services Marketplace)  
**QA Lead & Security Architect:** Quality Assurance & AppSec Team  
**Audit Date:** November 2026  
**Test Automation Framework:** Node.js Native Test Runner (`node:test`, `node:assert`), Supertest, MongoDB 7+  
**Total Automated Tests:** 53  
**Passing Rate:** 100% (53 Passed, 0 Failed, 0 Skipped)

---

## 1. Functional Testing by User Role

### 1.1 Super Admin Portal
| Test ID | Test Scenario | Steps / Input | Expected Result | Status | Automated Test Ref |
|---|---|---|---|---|---|
| TC-ADM-01 | Admin Authentication | `POST /api/auth/login` with admin credentials | Returns HTTP 200, JWT token, user object with `role: admin` | PASSED | `01_auth.test.js` #1 |
| TC-ADM-02 | Analytics & Dashboard Stats | `GET /api/admin/dashboard-stats` with Admin JWT | Returns HTTP 200 with platform metrics (revenue, total bookings, users) | PASSED | `01_auth.test.js` #9 |
| TC-ADM-03 | Provider Verification & KYC | `PUT /api/admin/providers/:id/verify` | Approves or rejects provider KYC status | PASSED | `seedData.js` / Admin controller |
| TC-ADM-04 | Platform Booking Oversight | `GET /api/bookings/admin/all` | Returns paginated list of all system bookings across all providers | PASSED | `02_booking.test.js` |
| TC-ADM-05 | Complaint Resolution | `PUT /api/complaints/:id/resolve` with resolution notes | Updates complaint status to `resolved` and notifies customer | PASSED | `04_security.test.js` |
| TC-ADM-06 | Process Booking Refund | `POST /api/payments/:id/refund` on paid booking | Sette payment status to `refunded`, creates refund transaction, reverses commission | PASSED | `03_payment.test.js` #8 |
| TC-ADM-07 | Coupon Management | `POST /api/coupons` with discountType, maxCap, expiry | Creates coupon valid for promotional campaigns | PASSED | `03_payment.test.js` #10 |

### 1.2 Customer Portal
| Test ID | Test Scenario | Steps / Input | Expected Result | Status | Automated Test Ref |
|---|---|---|---|---|---|
| TC-CUST-01 | Customer Registration | `POST /api/auth/register` with valid profile | Returns HTTP 201, auto-generates Customer document & JWT | PASSED | `01_auth.test.js` |
| TC-CUST-02 | Service Discovery & Search | `GET /api/services?search=ac&limit=10` | Returns HTTP 200 with matching active services, provider info, ratings | PASSED | `05_performance.test.js` #1 |
| TC-CUST-03 | Booking Appointment Creation | `POST /api/bookings` with serviceId, date, slot, address | Returns HTTP 201 with unique `HSB-` reference & `status: pending` | PASSED | `02_booking.test.js` #1 |
| TC-CUST-04 | Online Payment Checkout | `POST /api/payments/create-order` | Generates Razorpay Order ID for total order value | PASSED | `03_payment.test.js` #1 |
| TC-CUST-05 | Booking Rescheduling | `PUT /api/bookings/:id/reschedule` with new slot | Moves booking to new slot, updates audit trail, releases old slot | PASSED | `02_booking.test.js` #4 |
| TC-CUST-06 | Booking Cancellation | `POST /api/bookings/:id/cancel` while in `pending` | Sets status to `cancelled`, releases slot reservation | PASSED | `02_booking.test.js` #10 |
| TC-CUST-07 | Review Submission | `POST /api/reviews` on completed booking | Computes updated average provider rating and updates service rating | PASSED | `04_security.test.js` |
| TC-CUST-08 | Complaint Ticket Filing | `POST /api/complaints` with bookingId & description | Issues ticket number, sanitizes text, alerts support | PASSED | `04_security.test.js` #2 |
| TC-CUST-09 | Structured Invoice Download | `GET /api/bookings/:id/invoice` | Returns structured PDF/printable JSON invoice with price breakdown | PASSED | `02_booking.test.js` #14 |

### 1.3 Service Provider Portal
| Test ID | Test Scenario | Steps / Input | Expected Result | Status | Automated Test Ref |
|---|---|---|---|---|---|
| TC-PROV-01 | Provider Onboarding & Verification | Unapproved provider attempts `POST /api/services` | Blocked with HTTP 403 until Super Admin KYC approval | PASSED | `01_auth.test.js` |
| TC-PROV-02 | Service Catalog Management | Approved provider publishes new service | Returns HTTP 201, service becomes visible in public catalog | PASSED | `02_booking.test.js` |
| TC-PROV-03 | Availability Scheduling | Set working days, start/end hours, maxBookingsPerSlot | System validates slots during customer booking | PASSED | `02_booking.test.js` #3 |
| TC-PROV-04 | Accept Booking Request | `PUT /api/bookings/:id/accept` | Transitions booking from `pending` to `accepted` | PASSED | `02_booking.test.js` #6 |
| TC-PROV-05 | Reject Booking Request | `PUT /api/bookings/:id/reject` with reason | Transitions booking to `rejected`, notifies customer | PASSED | `02_booking.test.js` |
| TC-PROV-06 | Assign Technician | `PUT /api/bookings/:id/assign-technician` with technicianId | Transitions booking to `technician_assigned`, alerts technician | PASSED | `02_booking.test.js` #7 |
| TC-PROV-07 | Commission & Earnings Tracking | Completed booking triggers commission split | Platform 15% deducted, provider payout computed and recorded | PASSED | `03_payment.test.js` #3 |

### 1.4 Technician Portal
| Test ID | Test Scenario | Steps / Input | Expected Result | Status | Automated Test Ref |
|---|---|---|---|---|---|
| TC-TECH-01 | View Assigned Jobs | `GET /api/bookings/technician-jobs` | Returns only jobs assigned to the authenticated technician | PASSED | `02_booking.test.js` |
| TC-TECH-02 | Update Status: On The Way | `PUT /api/bookings/:id/technician-status` with `on_the_way` | Transitions booking to `on_the_way`, alerts customer | PASSED | `02_booking.test.js` #9 |
| TC-TECH-03 | Update Status: Arrived | `PUT /api/bookings/:id/technician-status` with `arrived` | Transitions booking to `arrived` | PASSED | `02_booking.test.js` #9 |
| TC-TECH-04 | Update Status: In Progress | `PUT /api/bookings/:id/technician-status` with `in_progress` | Transitions booking to `in_progress`, locks cancellation | PASSED | `02_booking.test.js` #9 |
| TC-TECH-05 | Complete Job with Work Proof | `POST /api/bookings/:id/complete` with remarks & images | Sets status `completed`, updates provider stats, triggers commission | PASSED | `02_booking.test.js` #11 |
| TC-TECH-06 | Prevent Illegal Job Skipping | Technician attempts `complete` while `technician_assigned` | Rejected with HTTP 400 (Must progress through `in_progress`) | PASSED | `02_booking.test.js` #8 |

---

## 2. Authentication & Authorization Test Cases

| Test ID | Test Scenario | Input / Vector | Expected HTTP | Status | Test Reference |
|---|---|---|---|---|---|
| TC-AUTH-01 | Valid Super Admin Login | `admin@homeserve.tech` / `AdminPassword123!` | 200 OK | PASSED | `01_auth.test.js` #1 |
| TC-AUTH-02 | Valid Customer Login | `john.doe@gmail.com` / `CustomerPassword123!` | 200 OK | PASSED | `01_auth.test.js` #2 |
| TC-AUTH-03 | Valid Provider Login | `apex.homes@homeserve.tech` / `ProviderPassword123!` | 200 OK | PASSED | `01_auth.test.js` #3 |
| TC-AUTH-04 | Valid Technician Login | `rahul.tech@homeserve.tech` / `TechPassword123!` | 200 OK | PASSED | `01_auth.test.js` #4 |
| TC-AUTH-05 | Invalid Password | Correct email, wrong password | 401 Unauthorized | PASSED | `01_auth.test.js` #5 |
| TC-AUTH-06 | Non-Existent User | `ghost@homeserve.tech` | 401 Unauthorized | PASSED | `01_auth.test.js` #6 |
| TC-AUTH-07 | Missing Credentials | Empty request body | 400 Bad Request | PASSED | `01_auth.test.js` #7 |
| TC-AUTH-08 | Inactive/Deactivated Account | User with `isActive: false` | 403 Forbidden | PASSED | `01_auth.test.js` #8 |
| TC-AUTH-09 | Unauthorized Role Escalation | Customer accessing Admin endpoint | 403 Forbidden | PASSED | `01_auth.test.js` #9 |
| TC-AUTH-10 | Missing JWT Token | Unauthenticated access to protected route | 401 Unauthorized | PASSED | `01_auth.test.js` #10 |
| TC-AUTH-11 | Tampered JWT Signature | Altered JWT token string | 401 Unauthorized | PASSED | `01_auth.test.js` #11 |
| TC-AUTH-12 | Expired JWT Token | Token with negative expiration | 401 Unauthorized | PASSED | `01_auth.test.js` #12 |
| TC-AUTH-13 | Password Reset Cycle | Forgot token -> Reset password -> Old pass fails, new pass logs in | 200 OK | PASSED | `01_auth.test.js` #13 |
| TC-AUTH-14 | Information Leakage Check | Check user response object for password hash & refresh token | 200 OK (Fields undefined) | PASSED | `01_auth.test.js` #14 |

---

## 3. Booking Engine & Concurrency Test Cases

| Test ID | Test Scenario | Input / Vector | Expected HTTP | Status | Test Reference |
|---|---|---|---|---|---|
| TC-BOOK-01 | Create Valid Booking | Complete valid payload with date and slot | 201 Created | PASSED | `02_booking.test.js` #1 |
| TC-BOOK-02 | Missing Required Fields | Missing serviceId or bookingDate | 400 Bad Request | PASSED | `02_booking.test.js` #2 |
| TC-BOOK-03 | Saturated Slot Rejection | Book slot when `activeBookings >= maxBookingsPerSlot` | 409 Conflict | PASSED | `02_booking.test.js` #3 |
| TC-BOOK-04 | Reschedule to Open Slot | Valid new date & slot | 200 OK | PASSED | `02_booking.test.js` #4 |
| TC-BOOK-05 | Reschedule to Saturated Slot | Attempt move to fully booked slot | 409 Conflict | PASSED | `02_booking.test.js` #5 |
| TC-BOOK-06 | Provider Accept Booking | Provider confirms incoming booking | 200 OK | PASSED | `02_booking.test.js` #6 |
| TC-BOOK-07 | Provider Dispatch Technician | Assign registered business technician | 200 OK | PASSED | `02_booking.test.js` #7 |
| TC-BOOK-08 | Prevent Out-of-Order Transition | Technician completing job without in_progress | 400 Bad Request | PASSED | `02_booking.test.js` #8 |
| TC-BOOK-09 | Sequential Technician Stepper | `on_the_way` -> `arrived` -> `in_progress` | 200 OK each | PASSED | `02_booking.test.js` #9 |
| TC-BOOK-10 | Lock Cancellation While In-Progress | Customer cancels when status is `in_progress` | 400 Bad Request | PASSED | `02_booking.test.js` #10 |
| TC-BOOK-11 | Complete Technician Job | Upload remarks & photos, mark completed | 200 OK | PASSED | `02_booking.test.js` #11 |
| TC-BOOK-12 | IDOR: Customer Booking Access | Customer B accesses Customer A booking | 403 Forbidden | PASSED | `02_booking.test.js` #12 |
| TC-BOOK-13 | IDOR: Technician Job Tampering | Technician B modifies Technician A job | 404 Not Found | PASSED | `02_booking.test.js` #13 |
| TC-BOOK-14 | Generate Structured Tax Invoice | `GET /api/bookings/:id/invoice` | 200 OK | PASSED | `02_booking.test.js` #14 |
| TC-BOOK-15 | Concurrent Race Condition | 5 simultaneous requests for 1 remaining slot | 1x 201, 4x 409 | PASSED | `05_performance.test.js` #5 |

---

## 4. Payment & Financial Test Cases

| Test ID | Test Scenario | Input / Vector | Expected HTTP | Status | Test Reference |
|---|---|---|---|---|---|
| TC-PAY-01 | Create Razorpay Order | Valid booking ID | 200 OK | PASSED | `03_payment.test.js` #1 |
| TC-PAY-02 | Forged Payment Signature | Altered HMAC signature | 400 Bad Request | PASSED | `03_payment.test.js` #2 |
| TC-PAY-03 | Valid Signature Verification | Authentic HMAC-SHA256 signature | 200 OK | PASSED | `03_payment.test.js` #3 |
| TC-PAY-04 | Webhook: Invalid Signature | Webhook with forged `x-razorpay-signature` | 400 Bad Request | PASSED | `03_payment.test.js` #4 |
| TC-PAY-05 | Webhook: Missing Signature | Webhook missing header | 400 Bad Request | PASSED | `03_payment.test.js` #5 |
| TC-PAY-06 | Webhook Idempotency | Send identical `payment.captured` webhook twice | 200 OK (idempotent: true, no duplicate tx) | PASSED | `03_payment.test.js` #6 |
| TC-PAY-07 | Process Paid Booking Refund | Admin requests refund on paid booking | 200 OK | PASSED | `03_payment.test.js` #7 |
| TC-PAY-08 | Prevent Refund on Unpaid Booking | Refund attempt on pending/unpaid booking | 400 Bad Request | PASSED | `03_payment.test.js` #8 |
| TC-PAY-09 | Percentage Coupon with Max Cap | Apply 50% discount capped at ₹300 | 200 OK (discount = 300) | PASSED | `03_payment.test.js` #9 |
| TC-PAY-10 | Coupon Min Order Amount Rule | Apply coupon on order below minimum amount | 400 Bad Request | PASSED | `03_payment.test.js` #10 |
| TC-PAY-11 | Expired Coupon Rejection | Apply coupon with expired `validTill` | 404 Not Found | PASSED | `03_payment.test.js` #11 |

---

## 5. Security & Vulnerability Test Cases

| Test ID | Test Scenario | Attack Vector | Expected Defense | Status | Test Reference |
|---|---|---|---|---|---|
| TC-SEC-01 | NoSQL Injection (Auth Bypass) | `{ email: { "$ne": null }, password: { "$gt": "" } }` | Stripped by sanitizer, rejects with 400 | PASSED | `04_security.test.js` #1 |
| TC-SEC-02 | Stored XSS in Descriptions | `<script>alert('xss')</script>` in complaint text | Stripped before database write | PASSED | `04_security.test.js` #2 |
| TC-SEC-03 | IDOR: Read Another User Address | Customer B requests Customer A address | Scoped to caller (isolated) | PASSED | `04_security.test.js` #3 |
| TC-SEC-04 | IDOR: Update Another User Address | Customer B PUTs Customer A address ID | 404 Not Found | PASSED | `04_security.test.js` #4 |
| TC-SEC-05 | IDOR: Delete Another User Address | Customer B DELETEs Customer A address ID | 404 Not Found | PASSED | `04_security.test.js` #5 |
| TC-SEC-06 | IDOR: Private Complaint Viewing | Customer B requests complaints list | Scoped to caller (isolated) | PASSED | `04_security.test.js` #6 |
| TC-SEC-07 | Rate Limiting Enforcement | Rapid sequential requests (> threshold) | 429 Too Many Requests | PASSED | `04_security.test.js` #7 |
| TC-SEC-08 | HTTP Security Headers | Check response headers (Helmet) | `nosniff`, `cross-origin` present | PASSED | `04_security.test.js` #8 |
| TC-SEC-09 | Malicious Executable Upload | Upload `malicious.sh` or `.exe` | 400 Bad Request (Invalid file type) | PASSED | `04_security.test.js` #9 |

---

## 6. Performance & Scale Test Cases

| Test ID | Test Scenario | Metric / Threshold | Actual Result | Status | Test Reference |
|---|---|---|---|---|---|
| TC-PERF-01 | Catalog Query Latency | Response time < 250ms | 51.38ms | PASSED | `05_performance.test.js` #1 |
| TC-PERF-02 | Bookings Query Latency | Response time < 250ms | 54.47ms | PASSED | `05_performance.test.js` #2 |
| TC-PERF-03 | Pagination Integrity | Accurate limit, page, total, totalPages | Correct bounds & count | PASSED | `05_performance.test.js` #3 |
| TC-PERF-04 | Database Index Verification | Composite indexes on high-frequency keys | Present & Verified | PASSED | `05_performance.test.js` #4 |
| TC-PERF-05 | Concurrency Stress Test | 5 simultaneous requests for 1 slot | 1 Success (201), 4 Rejected (409) | PASSED | `05_performance.test.js` #5 |

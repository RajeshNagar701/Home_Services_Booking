# HomeServe Technologies – Comprehensive API Testing Report

**Architecture:** RESTful API Architecture  
**Protocol:** HTTP/1.1 with JSON payloads  
**Security Standard:** Bearer JWT Authentication & Role-Based Access Control (RBAC)  
**Test Harness:** Supertest & Node.js Native Test Runner (`node:test`)  
**Postman Collection:** `backend/tests/HomeServe_Technologies_API_Collection.postman_collection.json`  
**Total Endpoints Audited:** 32 Endpoints  
**Overall Status:** **100% OPERATIONAL & VERIFIED**

---

## 1. API Endpoint Coverage Matrix

### 1.1 Authentication & Profile APIs (`/api/auth`)
| Method | Endpoint | Access Level | Description | Status Code | Test Status |
|---|---|---|---|---|---|
| `POST` | `/api/auth/register` | Public | Register new Customer or Provider profile | 201 Created | **PASS** |
| `POST` | `/api/auth/login` | Public | Authenticate user, issue JWT token & role profile | 200 OK | **PASS** |
| `POST` | `/api/auth/forgot-password` | Public | Generate cryptographically secure reset token | 200 OK | **PASS** |
| `POST` | `/api/auth/reset-password/:token` | Public | Validate token & reset password | 200 OK | **PASS** |
| `GET` | `/api/auth/me` | Authenticated | Retrieve authenticated user profile | 200 OK | **PASS** |
| `PUT` | `/api/auth/profile` | Authenticated | Update user first name, last name, phone, avatar | 200 OK | **PASS** |

### 1.2 Categories & Services APIs (`/api/categories`, `/api/services`)
| Method | Endpoint | Access Level | Description | Status Code | Test Status |
|---|---|---|---|---|---|
| `GET` | `/api/categories` | Public | Fetch all service categories | 200 OK | **PASS** |
| `GET` | `/api/services` | Public | Search, filter by category/city/price, and paginate | 200 OK | **PASS** |
| `GET` | `/api/services/:id` | Public | Get single service details and customer reviews | 200 OK | **PASS** |
| `POST` | `/api/services` | Provider | Approved provider creates a new service | 201 Created | **PASS** |
| `PUT` | `/api/services/:id` | Provider | Provider updates own service details | 200 OK | **PASS** |
| `DELETE` | `/api/services/:id` | Provider | Provider soft-deletes/deactivates service | 200 OK | **PASS** |

### 1.3 Booking Management APIs (`/api/bookings`)
| Method | Endpoint | Access Level | Description | Status Code | Test Status |
|---|---|---|---|---|---|
| `POST` | `/api/bookings` | Customer | Atomic booking creation with slot availability checks | 201 Created | **PASS** |
| `GET` | `/api/bookings/my-bookings` | Customer | Fetch current customer bookings with status filter | 200 OK | **PASS** |
| `GET` | `/api/bookings/:id` | Private (Owner/Staff) | Get comprehensive booking details with timeline | 200 OK | **PASS** |
| `POST` | `/api/bookings/:id/cancel` | Customer | Cancel booking (enforces non-cancellable states) | 200 OK | **PASS** |
| `PUT` | `/api/bookings/:id/reschedule` | Customer/Provider | Reschedule appointment to another slot | 200 OK | **PASS** |
| `GET` | `/api/bookings/provider-bookings` | Provider | Fetch provider incoming booking requests | 200 OK | **PASS** |
| `PUT` | `/api/bookings/:id/accept` | Provider | Provider confirms booking request | 200 OK | **PASS** |
| `PUT` | `/api/bookings/:id/reject` | Provider | Provider declines booking request | 200 OK | **PASS** |
| `PUT` | `/api/bookings/:id/assign-technician` | Provider | Assign business technician to booking | 200 OK | **PASS** |
| `GET` | `/api/bookings/technician-jobs` | Technician | View assigned field jobs | 200 OK | **PASS** |
| `PUT` | `/api/bookings/:id/technician-status` | Technician | Advance status: `on_the_way` -> `arrived` -> `in_progress` | 200 OK | **PASS** |
| `POST` | `/api/bookings/:id/complete` | Technician | Mark job completed, upload remarks/photos | 200 OK | **PASS** |
| `GET` | `/api/bookings/admin/all` | Super Admin | View and filter all platform bookings | 200 OK | **PASS** |
| `GET` | `/api/bookings/:id/invoice` | Private (Owner/Admin) | Generate structured tax invoice breakdown | 200 OK | **PASS** |

### 1.4 Payments & Webhooks APIs (`/api/payments`)
| Method | Endpoint | Access Level | Description | Status Code | Test Status |
|---|---|---|---|---|---|
| `POST` | `/api/payments/create-order` | Customer | Create Razorpay order for online payment | 200 OK | **PASS** |
| `POST` | `/api/payments/verify` | Customer | Verify Razorpay HMAC-SHA256 signature & settle | 200 OK | **PASS** |
| `POST` | `/api/payments/webhook` | Public (HMAC header) | Process payment capture/failure webhooks idempotently | 200 OK | **PASS** |
| `POST` | `/api/payments/:id/refund` | Super Admin | Process refund for paid booking, reverse commission | 200 OK | **PASS** |

### 1.5 Reviews, Complaints, Coupons & Uploads
| Method | Endpoint | Access Level | Description | Status Code | Test Status |
|---|---|---|---|---|---|
| `POST` | `/api/reviews` | Customer | Submit review for completed booking | 201 Created | **PASS** |
| `POST` | `/api/complaints` | Customer | Raise complaint ticket against booking | 201 Created | **PASS** |
| `POST` | `/api/coupons/validate` | Public | Check coupon validity, min order, and discount cap | 200 OK | **PASS** |
| `POST` | `/api/upload/file` | Authenticated | Upload image/document with MIME & size validation | 200 OK | **PASS** |
| `GET` | `/api/admin/dashboard-stats` | Super Admin | Platform aggregate KPI metrics | 200 OK | **PASS** |

---

## 2. API Schema & Request/Response Samples

### 2.1 Atomic Booking Creation (`POST /api/bookings`)
**Request Header:** `Authorization: Bearer <CUSTOMER_JWT>`  
**Request Payload:**
```json
{
  "serviceId": "6aeb15b12eddca6047f54be6",
  "bookingDate": "2026-12-15",
  "timeSlot": "10:00 - 12:00",
  "serviceAddress": {
    "streetAddress": "702 Silver Oak Heights",
    "landmark": "Near Metro Station",
    "city": "Mumbai",
    "state": "Maharashtra",
    "pincode": "400050",
    "contactPhone": "+91 9820099887"
  },
  "problemDescription": "AC cooling coil inspection and deep cleaning required.",
  "paymentMethod": "razorpay"
}
```
**Response (HTTP 201 Created):**
```json
{
  "success": true,
  "message": "Booking created successfully.",
  "data": {
    "_id": "6aeb16e62e1d94cb47c53bbf",
    "bookingReference": "HSB-20261104-FZ3XT",
    "customer": "6aeb1543788a10d9e8461ab1",
    "provider": "6aeb1543788a10d9e8461ac2",
    "service": "6aeb15b12eddca6047f54be6",
    "bookingDate": "2026-12-15",
    "timeSlot": "10:00 - 12:00",
    "status": "pending",
    "pricing": {
      "basePrice": 899,
      "discount": 0,
      "couponCode": "",
      "platformFee": 49,
      "tax": 0,
      "totalAmount": 948
    },
    "paymentStatus": "pending"
  }
}
```

### 2.2 Payment Webhook Processing (`POST /api/payments/webhook`)
**Request Header:** `x-razorpay-signature: <HMAC_SHA256_HASH>`  
**Request Payload:**
```json
{
  "event": "payment.captured",
  "payload": {
    "payment": {
      "entity": {
        "id": "pay_mock_verified_001",
        "order_id": "order_mock_verified_001",
        "amount": 94800,
        "currency": "INR",
        "status": "captured"
      }
    }
  }
}
```
**Response (HTTP 200 OK):**
```json
{
  "success": true,
  "message": "Webhook event 'payment.captured' processed successfully.",
  "data": {
    "received": true
  }
}
```

---

## 3. Postman Collection Integration

A complete, exportable Postman Collection file has been generated and validated at:
`backend/tests/HomeServe_Technologies_API_Collection.postman_collection.json`

Features:
- Configured dynamic collection variables `{{baseUrl}}` and `{{authToken}}`
- Pre-structured folder hierarchies covering Authentication, Catalog, Booking Engine, Payments & Webhooks, and Complaints
- Ready for automated Postman / Newman CLI regression runs.

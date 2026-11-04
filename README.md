# HomeServe Technologies — SaaS Home Services Booking Platform

**HomeServe Technologies** is an enterprise-grade, multi-vendor SaaS home services marketplace connecting homeowners and businesses (Customers) with verified Service Providers and field Technicians, governed by a centralized Super Admin.

---

## 1. Role Matrix & Features

### 1. Super Admin
- **Platform Analytics**: Interactive volume charts (Recharts), commission revenue metrics, category distributions, and top provider performance.
- **Provider KYC & Compliance**: Review legal documents, business licenses, trade certificates; 1-click **Approve** / **Reject** with feedback.
- **Service Categories Taxonomy**: Dynamic category CRUD with custom icons and sort priorities.
- **Global Bookings & Financial Ledger**: Platform-wide booking oversight, payment audits, and 15% platform commission tracking.
- **Complaints Desk**: Investigate customer disputes, update ticket statuses, and log official admin resolutions.
- **Promotional Campaigns**: Create percentage and flat coupons (`WELCOME50`, `FESTIVE100`), set order minimums, usage caps, and expiration dates.

### 2. Customer
- **Public Services Catalog**: Search by keywords, filter by category pills, filter by city (Mumbai, Pune, etc.), sort by rating or price.
- **Verified Provider Comparison**: View provider profiles, background verification badges, and customer reviews.
- **Interactive Multi-Step Booking**:
  - Step 1: Select date and 2-hour arrival slot with atomic double-booking prevention.
  - Step 2: Choose / enter service address and contact phone.
  - Step 3: Describe problem and attach optional issue photos.
  - Step 4: Apply promotional coupon codes with instant discount calculations.
  - Step 5: Choose payment method (Razorpay online simulator or Pay on Completion).
- **Live Service Tracking Stepper**: Visual 7-stage progress (`Pending` &rarr; `Accepted` &rarr; `Tech Assigned` &rarr; `On The Way` &rarr; `Arrived` &rarr; `In Progress` &rarr; `Completed`).
- **Direct Technician Contact**: 1-click phone call to assigned technician.
- **Tax Invoices**: Generate and print structured GST invoices.
- **Ratings & Reviews**: Submit 5-star ratings and written feedback for completed bookings.
- **Complaints**: Lodge tickets with priorities for platform admin investigation.

### 3. Service Provider
- **Provider Dashboard**: Gross volume, 15% platform commission deductions, net payout, pending requests counter, and rating.
- **Booking Requests Queue**: 1-click **Accept** or **Reject** (with reason modal).
- **Technician Dispatch**: Assign employed field technicians to confirmed appointments.
- **Catalog Management**: Add, edit, or delete service offerings with dynamic pricing, durations, included/excluded bullet points, and banners.
- **7-Day Working Hours Scheduler**: Configure shift start/end times, slot durations, capacity limits, and off-days.
- **Staff Management**: Add and manage field technicians with specializations and experience.
- **Earnings & Statements**: Transparent breakdown of gross total vs platform cut vs net payout with T+1 bank settlement status.
- **KYC Uploads**: Submit GSTIN, PAN, and trade certificates for Super Admin audit.
- **Customer Reviews**: View customer ratings and post official provider responses.

### 4. Technician
- **Field Mobility Dashboard**: View current active urgent job with customer phone, address, and problem description.
- **Step-by-Step Status Progression**:
  - `1. Mark "On The Way"`
  - `2. Mark "Arrived At Location"`
  - `3. Mark "Work In Progress"`
  - `4. Complete Job & Upload Evidence` (before/after photos and technician remarks).
- **Assigned Jobs Queue**: Review upcoming, active, and completed appointments.

---

## 2. Technology Stack

| Layer | Technology | Details |
|---|---|---|
| **Frontend Framework** | React 18+ with Vite | Fast HMR, optimized production build |
| **Styling & UI** | Bootstrap 5, Bootstrap Icons, Custom CSS | Modern SaaS aesthetic, responsive cards, modals, badge system |
| **Routing** | React Router DOM v6 | Nested layouts, role guards (`ProtectedRoute`) |
| **State & HTTP** | React Context API + Axios | Global `AuthContext`, `ToastContext`, Axios interceptors with JWT injection |
| **Data Visualization** | Recharts | Revenue growth charts, booking status pie distributions |
| **Backend Runtime** | Node.js & Express.js | Modular REST architecture, MVC pattern |
| **Database** | MongoDB & Mongoose ODM | 17 normalized schemas, atomic availability validation, composite indexes |
| **Security & Auth** | JWT, bcryptjs, Helmet, Express Rate Limit, CORS | Secure tokens, rate limiting, granular RBAC |
| **Payments** | Razorpay SDK & Sandbox Simulator | Secure HMAC-SHA256 signature verification |
| **Email/Notifications** | Nodemailer | Booking confirmation templates & notification system |

---

## 3. Seed Accounts for Testing

The platform includes ready-to-test accounts across all 4 roles:

| Role | Account Email | Password | Details |
|---|---|---|---|
| **Super Admin** | `admin@homeserve.tech` | `AdminPassword123!` | Full platform administration |
| **Provider 1 (Approved)** | `apex.homes@homeserve.tech` | `ProviderPassword123!` | Apex Home Solutions & Repair |
| **Provider 2 (Approved)** | `sparkle.clean@homeserve.tech` | `ProviderPassword123!` | SparkleClean Facility Management |
| **Provider 3 (Pending)** | `quickfix.appliances@homeserve.tech` | `ProviderPassword123!` | QuickFix Appliances (for KYC verification testing) |
| **Technician** | `rahul.tech@homeserve.tech` | `TechPassword123!` | Senior Electrician & HVAC specialist |
| **Customer 1** | `john.doe@gmail.com` | `CustomerPassword123!` | Customer with active & completed bookings |
| **Customer 2** | `anita.sharma@gmail.com` | `CustomerPassword123!` | Customer with open support complaint |

> **Pro Tip**: Use the **"Demo Roles"** dropdown in the top navbar or the quick pills on `/login` to sign in to any role with 1 click without typing!

---

## 4. Getting Started

### Prerequisites
- Node.js v18+ and npm installed
- MongoDB installed locally OR a MongoDB Atlas connection string

### 1. Backend Setup
```bash
cd backend
npm install
# Configure your MongoDB URI in .env (if not default localhost:27017)
node src/utils/seedData.js   # Seeds all accounts, categories, services & demo bookings
npm test                     # Runs full automated test suite (53 tests across 5 domains)
npm start                    # Starts API on http://localhost:5000
```

### 2. Frontend Setup
```bash
cd frontend
npm install
npm run dev                  # Starts Vite dev server on http://localhost:5173
```

---

## 5. API Endpoints Overview

- **Auth**: `POST /api/auth/register`, `POST /api/auth/login`, `GET /api/auth/me`, `PUT /api/auth/profile`
- **Catalog**: `GET /api/categories`, `GET /api/services`, `GET /api/services/:id`
- **Bookings**:
  - `POST /api/bookings` (Atomic slot reservation)
  - `GET /api/bookings/my-bookings` (Customer)
  - `GET /api/bookings/provider-bookings` (Provider queue)
  - `PUT /api/bookings/:id/accept` (Provider)
  - `PUT /api/bookings/:id/reject` (Provider)
  - `PUT /api/bookings/:id/assign-technician` (Provider dispatch)
  - `GET /api/bookings/technician-jobs` (Technician queue)
  - `PUT /api/bookings/:id/technician-status` (Technician live status update)
  - `POST /api/bookings/:id/complete` (Technician proof upload & completion)
  - `POST /api/bookings/:id/cancel` (Customer cancellation)
  - `GET /api/bookings/:id/invoice` (Structured tax invoice)
- **Payments**: `POST /api/payments/create-order`, `POST /api/payments/verify`
- **Reviews**: `POST /api/reviews`, `PUT /api/reviews/:id/reply`, `GET /api/reviews/provider`
- **Complaints**: `POST /api/complaints`, `GET /api/complaints/my-complaints`, `GET /api/complaints/admin`, `PUT /api/complaints/:id/resolve`
- **Coupons**: `POST /api/coupons/validate`, `GET /api/coupons`, `POST /api/coupons`, `PUT /api/coupons/:id/toggle`
- **Provider Hub**: `GET /api/providers/dashboard-stats`, `GET /api/providers/availability`, `PUT /api/providers/availability`, `GET /api/providers/technicians`, `POST /api/providers/technicians`, `GET /api/providers/documents`, `POST /api/providers/documents`
- **Super Admin**: `GET /api/admin/analytics`, `GET /api/admin/providers`, `PUT /api/admin/providers/:id/verify`, `GET /api/admin/customers`, `GET /api/admin/commissions`

---

## 6. QA & Security Audit Reports

The platform has undergone a comprehensive quality, security, and performance audit. Detailed deliverables:

- **[TEST_CASES.md](./TEST_CASES.md)**: Full test case matrix across Functional (4 roles), Authentication, Booking Lifecycle, Payments, Security, and Performance.
- **[SECURITY_AUDIT_REPORT.md](./SECURITY_AUDIT_REPORT.md)**: OWASP Top 10 assessment, IDOR, NoSQL injection, XSS defense, Rate Limiting, and JWT cryptography audit.
- **[BUG_REPORT.md](./BUG_REPORT.md)**: Investigation and verified remediation logs for 8 defects (TOCTOU race condition, input validation, state machine integrity, webhook idempotency, etc.).
- **[API_TESTING_REPORT.md](./API_TESTING_REPORT.md)**: REST API endpoint schemas, response statuses, and Postman collection reference.
- **[E2E_TESTING_REPORT.md](./E2E_TESTING_REPORT.md)**: End-to-end multi-role lifecycle walkthrough from service discovery through technician completion and tax invoice generation.
- **[PERFORMANCE_OBSERVATIONS.md](./PERFORMANCE_OBSERVATIONS.md)**: Database index verification, query latency benchmarks (<55ms), concurrency stress testing, and Vite bundle code splitting.
- **Automated Test Suite**: Run `cd backend && npm test` to execute all 53 automated integration tests.
- **Postman Collection**: `backend/tests/HomeServe_Technologies_API_Collection.postman_collection.json`.

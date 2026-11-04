# HomeServe Technologies — Production Deployment Guide

This guide provides end-to-end instructions for deploying the **HomeServe Technologies** full-stack SaaS platform into production.

---

## Architecture Overview

```
                      +-----------------------------+
                      |   Netlify / Vercel Edge CDN |
                      |    (React 18 + Vite SPA)    |
                      +--------------+--------------+
                                     |
                       HTTPS REST API (VITE_API_BASE_URL)
                                     |
                      +--------------v--------------+
                      |        Render / Railway     |
                      |   (Node.js / Express API)   |
                      +-------+--------------+------+
                              |              |
           Mongoose / TLS     |              | HTTPS Webhooks
                              v              v
     +--------------------------+          +-------------------+
     |    MongoDB Atlas Cloud   |          | Razorpay Sandbox  |
     |   (Managed Database)     |          |  & Cloudinary CDN |
     +--------------------------+          +-------------------+
```

---

## 1. Git Repository & Branching Workflow

### A. Repository Structure
The repository is structured with separation of concerns:
```
Home_Services_Booking/
├── .github/workflows/          # CI/CD Automated Pipelines
├── backend/                    # Node.js / Express REST API & Python Seed Package
│   ├── src/                    # Controllers, Models, Routes, Middleware, Services
│   ├── seed/                   # Demonstration & Seeding Package
│   ├── tests/                  # Automated Integration & Security Tests
│   ├── package.json
│   └── .env.example
├── frontend/                   # React 18 + Vite Frontend Application
│   ├── src/                    # Components, Pages, Layouts, Contexts, Hooks
│   ├── public/                 # Static Assets & _redirects for Netlify SPA
│   ├── netlify.toml            # Netlify SPA Redirects
│   ├── vercel.json             # Vercel SPA Rewrites
│   ├── package.json
│   └── .env.example
├── netlify.toml                # Root Netlify configuration
├── vercel.json                 # Root Vercel configuration
├── render.yaml                 # Render Blueprint Infrastructure-as-Code
├── Procfile                    # Web service process declaration
├── package.json                # Root workspace orchestration
├── .gitignore                  # Security-first ignore rules
└── README.md
```

### B. Branching Strategy
- **`main`**: Production-ready, stable releases deployed directly to production.
- **`development`**: Integration branch for ongoing staging and pre-release audits.
- **`feature/*`**: Feature branches for isolated development (e.g., `feature/production-deployment-config`).

---

## 2. Frontend Deployment (Netlify or Vercel)

### Option A: Deploy on Netlify (Recommended)
1. **Connect GitHub**:
   - Log in to your [Netlify Dashboard](https://app.netlify.com).
   - Click **Add new site** > **Import an existing project** > **GitHub**.
   - Select the `Home_Services_Booking` repository and choose the `main` branch.
2. **Configure Build Settings**:
   - **Base directory**: `frontend`
   - **Build command**: `npm run build`
   - **Publish directory**: `frontend/dist`
3. **Environment Variables**:
   In Netlify Site Settings > **Environment variables**, set:
   ```env
   VITE_API_BASE_URL=https://your-backend-service.onrender.com/api
   VITE_RAZORPAY_KEY_ID=rzp_test_homeserve_2026
   VITE_APP_NAME=HomeServe Technologies
   ```
4. **Deploy**:
   - Click **Deploy site**.
   - Netlify will build the SPA and serve it over global HTTPS with automated routing fallback from [`_redirects`](file:///d:/Home_Services_Booking/frontend/public/_redirects).

### Option B: Deploy on Vercel
1. Log in to [Vercel](https://vercel.com).
2. Click **New Project** and import the GitHub repository.
3. Set **Root Directory** to `frontend`.
4. Framework Preset: **Vite**.
5. Add the environment variables (`VITE_API_BASE_URL`, `VITE_RAZORPAY_KEY_ID`).
6. Click **Deploy**.

---

## 3. Backend Deployment (Render or Railway)

### Deploy on Render (Web Service)
1. Log in to your [Render Dashboard](https://dashboard.render.com).
2. Click **New +** > **Web Service**.
3. Connect your GitHub repository.
4. Configure service parameters:
   - **Name**: `homeserve-backend`
   - **Region**: Oregon (US West) or Singapore (Asia)
   - **Branch**: `main`
   - **Root Directory**: `backend`
   - **Runtime**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Health Check Path**: `/api/health`
5. **Environment Variables**:
   Add the following in Render's **Environment** tab:
   ```env
   NODE_ENV=production
   PORT=10000
   MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.mongodb.net/homeserve?retryWrites=true&w=majority
   JWT_SECRET=super_secure_production_jwt_key_random_32_bytes
   JWT_REFRESH_SECRET=super_secure_production_refresh_jwt_key_random_32_bytes
   JWT_EXPIRE=24h
   JWT_REFRESH_EXPIRE=7d
   FRONTEND_URL=https://your-frontend-site.netlify.app
   RAZORPAY_KEY_ID=rzp_test_homeserve_2026
   RAZORPAY_KEY_SECRET=your_razorpay_secret
   CLOUDINARY_CLOUD_NAME=your_cloud_name
   CLOUDINARY_API_KEY=your_cloudinary_api_key
   CLOUDINARY_API_SECRET=your_cloudinary_api_secret
   ```
6. Click **Create Web Service**.

---

## 4. Managed Cloud Database (MongoDB Atlas)

1. Create a free M0 cluster on [MongoDB Atlas](https://www.mongodb.com/cloud/atlas).
2. Under **Network Access**, add IP `0.0.0.0/0` (allow access from anywhere) so Render/Railway web instances can connect securely over TLS.
3. Under **Database Access**, create a user (e.g. `homeserve_admin`) with read/write privileges.
4. Copy the connection string:
   `mongodb+srv://homeserve_admin:<password>@cluster0.xxxx.mongodb.net/homeserve?retryWrites=true&w=majority`
5. Run the database seed to initialize categories, services, and admin accounts:
   ```bash
   MONGODB_URI="mongodb+srv://homeserve_admin:<password>@cluster0.xxxx.mongodb.net/homeserve" node backend/src/utils/seedData.js
   ```

---

## 5. Third-Party Integrations

### Razorpay Test Mode Setup
1. Log in to the [Razorpay Dashboard](https://dashboard.razorpay.com).
2. Switch to **Test Mode**.
3. Navigate to **Account & Settings** > **API Keys** and generate **Key ID** and **Key Secret**.
4. Set `RAZORPAY_KEY_ID` on both Frontend and Backend.
5. Set `RAZORPAY_KEY_SECRET` exclusively on the Backend environment.

### Cloudinary CDN Setup
1. Log in to [Cloudinary Console](https://console.cloudinary.com).
2. Copy `Cloud Name`, `API Key`, and `API Secret`.
3. Add these to the Backend environment variables.

---

## 6. Production Verification Checklist

- [ ] **Health Endpoint**: `GET https://your-backend.onrender.com/api/health` returns `{"status":"healthy"}`.
- [ ] **Catalog API**: `GET https://your-backend.onrender.com/api/services` returns 40 seeded services.
- [ ] **Customer Registration & Login**: Test on production frontend (`rahul@gmail.com` / `CustomerPassword123!`).
- [ ] **Provider Hub**: Login as `apex.homes@homeserve.tech` / `ProviderPassword123!` and verify technician list.
- [ ] **Technician Portal**: Login as `rahul.tech@homeserve.tech` / `TechPassword123!` and check assigned jobs.
- [ ] **Super Admin Dashboard**: Login as `admin@homeserve.com` / `Admin@12345` and verify analytics charts.
- [ ] **Booking Flow**: Complete test appointment with slot reservation, coupon application (`HOME20`), and mock payment.

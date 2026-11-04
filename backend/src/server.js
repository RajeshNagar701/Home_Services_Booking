require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const path = require('path');
const { connectDB } = require('./config/db');
const errorHandler = require('./middleware/errorHandler');
const { generalLimiter } = require('./middleware/rateLimiter');
const AppError = require('./utils/AppError');

// Route imports
const authRoutes = require('./routes/authRoutes');
const categoryRoutes = require('./routes/categoryRoutes');
const serviceRoutes = require('./routes/serviceRoutes');
const bookingRoutes = require('./routes/bookingRoutes');
const paymentRoutes = require('./routes/paymentRoutes');
const reviewRoutes = require('./routes/reviewRoutes');
const complaintRoutes = require('./routes/complaintRoutes');
const couponRoutes = require('./routes/couponRoutes');
const providerRoutes = require('./routes/providerRoutes');
const adminRoutes = require('./routes/adminRoutes');
const customerRoutes = require('./routes/customerRoutes');
const uploadRoutes = require('./routes/uploadRoutes');
const notificationRoutes = require('./routes/notificationRoutes');

const app = express();

// Security HTTP headers
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' }
  })
);

// CORS configuration
const allowedOrigins = [
  process.env.FRONTEND_URL || 'http://localhost:5173',
  'http://127.0.0.1:5173',
  'http://localhost:3000'
];

app.use(
  cors({
    origin: (origin, callback) => {
      // allow requests with no origin (like mobile apps or curl requests)
      if (!origin || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      return callback(null, true); // Permissive in development
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS']
  })
);

// Request body parsers
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Input sanitization against NoSQL injection and XSS
const sanitizeInput = require('./middleware/sanitizeMiddleware');
app.use(sanitizeInput);

// Logging
if (process.env.NODE_ENV !== 'production') {
  app.use(morgan('dev'));
}

// Rate Limiting
app.use('/api', generalLimiter);

// Serve static uploaded files
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// API Health Check
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    service: 'HomeServe Technologies API',
    database: require('mongoose').connection.readyState === 1 ? 'connected' : 'autonomous_catalog',
    timestamp: new Date().toISOString()
  });
});

// Root API Greeting (prevents 404 in hosting logs like Render/Uptime checkers)
app.get('/', (req, res) => {
  res.status(200).json({
    status: 'success',
    service: 'HomeServe Technologies Production REST API',
    version: '1.0.0',
    healthCheck: '/api/health',
    endpoints: {
      categories: '/api/categories',
      services: '/api/services',
      auth: '/api/auth/login'
    }
  });
});

app.head('/', (req, res) => {
  res.status(200).end();
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/services', serviceRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/complaints', complaintRoutes);
app.use('/api/coupons', couponRoutes);
app.use('/api/providers', providerRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/customers', customerRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/notifications', notificationRoutes);

// Catch-all for undefined routes
app.all('*', (req, res, next) => {
  next(new AppError(`Cannot find ${req.method} ${req.originalUrl} on this server.`, 404));
});

// Global Error Handler
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

// Connect Database & Start Server
const startServer = async () => {
  try {
    await connectDB();
    const server = app.listen(PORT, () => {
      console.log(`\n======================================================`);
      console.log(`  HOMESERVE API SERVER RUNNING ON PORT ${PORT}`);
      console.log(`  Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`  Health Check: http://localhost:${PORT}/api/health`);
      console.log(`======================================================\n`);
    });

    process.on('unhandledRejection', (err) => {
      console.error('[Process] Unhandled Rejection:', err);
      // Keep running in dev so background tasks don't crash the server
    });
  } catch (err) {
    console.error('[Server] Failed to initialize server:', err);
  }
};

if (require.main === module) {
  startServer();
} else {
  connectDB();
}

module.exports = app;

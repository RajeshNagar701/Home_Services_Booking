const mongoose = require('mongoose');

let isConnected = false;
let memoryServer = null;

const connectDB = async () => {
  if (isConnected) return;

  const uri = process.env.MONGODB_URI;

  // 1. If explicit MONGODB_URI is provided, attempt connection
  if (uri && uri.trim() !== '' && uri !== 'mongodb://127.0.0.1:27017/homeserve') {
    try {
      const conn = await mongoose.connect(uri, {
        serverSelectionTimeoutMS: 5000,
        autoIndex: true
      });
      isConnected = true;
      console.log(`[MongoDB] Connected to external cluster: ${conn.connection.host}/${conn.connection.name}`);
      return conn;
    } catch (err) {
      console.warn(`[MongoDB] External cluster connection failed: ${err.message}`);
    }
  }

  // 2. Attempt local MongoDB if available
  try {
    const conn = await mongoose.connect('mongodb://127.0.0.1:27017/homeserve', {
      serverSelectionTimeoutMS: 2000,
      autoIndex: true
    });
    isConnected = true;
    console.log(`[MongoDB] Connected to local database: ${conn.connection.host}/${conn.connection.name}`);
    return conn;
  } catch (localErr) {
    console.log(`[MongoDB] Local MongoDB not available: ${localErr.message}`);
  }

  // 3. Autonomous Cloud Fallback: Run in-memory MongoDB engine
  try {
    console.log('[MongoDB] Starting autonomous in-memory database engine...');
    const { MongoMemoryServer } = require('mongodb-memory-server');
    memoryServer = await MongoMemoryServer.create();
    const memUri = memoryServer.getUri();
    const conn = await mongoose.connect(memUri);
    isConnected = true;
    console.log(`[MongoDB] Autonomous database engine active: ${conn.connection.host}/${conn.connection.name}`);

    // Seed database with all 40 services & user accounts
    const { seedDatabase } = require('../utils/seedData');
    await seedDatabase();
    console.log('[MongoDB] Autonomous catalog database successfully seeded with all 4 roles & 40 services!');
    return conn;
  } catch (memErr) {
    console.warn(`[MongoDB] Autonomous engine initialization notice: ${memErr.message}`);
  }
};

const disconnectDB = async () => {
  if (isConnected) {
    await mongoose.disconnect();
    isConnected = false;
  }
  if (memoryServer) {
    await memoryServer.stop();
    memoryServer = null;
  }
};

module.exports = { connectDB, disconnectDB };

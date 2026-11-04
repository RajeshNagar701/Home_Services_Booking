const mongoose = require('mongoose');

let isConnected = false;

const connectDB = async () => {
  if (isConnected) return;

  const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/homeserve';

  try {
    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 3000,
      autoIndex: true
    });
    isConnected = true;
    console.log(`[MongoDB] Connected successfully: ${conn.connection.host}/${conn.connection.name}`);
    return conn;
  } catch (err) {
    console.warn(`\n[MongoDB] Notice: Could not connect to '${uri}': ${err.message}`);
    console.log(`[MongoDB] Set MONGODB_URI in backend/.env (e.g. MongoDB Atlas cluster or local mongodb://127.0.0.1:27017/homeserve).`);
    console.log(`[MongoDB] The API server will continue running. Mongoose will automatically reconnect once MongoDB is available.\n`);
  }
};

const disconnectDB = async () => {
  if (isConnected) {
    await mongoose.disconnect();
    isConnected = false;
  }
};

module.exports = { connectDB, disconnectDB };

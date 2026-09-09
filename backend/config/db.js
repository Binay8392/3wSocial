const path = require('path');
const dotenv = require('dotenv');
const mongoose = require('mongoose');

dotenv.config({ path: path.resolve(__dirname, '..', '.env'), override: true });

const connectDB = async () => {
  const mongoUri = process.env.MONGODB_URI;

  if (!mongoUri) {
    console.error('MONGODB_URI configured: false');
    console.error(
      'MongoDB configuration missing. Add MONGODB_URI to backend/.env before starting the API.'
    );
    throw new Error('Missing MONGODB_URI');
  }

  try {
    const conn = await mongoose.connect(mongoUri);
    console.log('MongoDB connected successfully');
    console.log(`MongoDB host: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    const message = String(error && error.message ? error.message : error || 'Unknown MongoDB error');

    if (message.includes('Authentication failed') || message.includes('auth failed')) {
      console.error('MongoDB connection failed: credential rejection');
    } else if (message.includes('ECONNREFUSED') || message.includes('ENOTFOUND') || message.includes('MongoServerSelectionError')) {
      console.error('MongoDB connection failed: network or Atlas access issue');
    } else {
      console.error('MongoDB connection failed: configuration or connectivity issue');
    }

    throw new Error('MongoDB connection failed');
  }
};

module.exports = connectDB;

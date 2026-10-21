const mongoose = require('mongoose');

const connectDB = async () => {
  // Support both names so Render's MONGODB_URI setting and older MONGO_URI
  // deployments work without silently falling back to localhost.
  const mongoUri = process.env.MONGO_URI || process.env.MONGODB_URI;

  if (!mongoUri) {
    console.error('[MongoDB] Missing MONGO_URI or MONGODB_URI environment variable.');
    return;
  }

  try {
    const conn = await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 10000,
    });
    console.log(`[MongoDB] Database connected successfully: ${conn.connection.host}`);
  } catch (error) {
    console.error(`[MongoDB] Connection Error: ${error.message}`);
    console.warn('[MongoDB] Database operations will fail until MongoDB is connected.');
  }
};

module.exports = connectDB;

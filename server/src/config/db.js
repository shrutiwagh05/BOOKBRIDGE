const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/bookbridge');
    console.log(`[MongoDB] Database connected successfully: ${conn.connection.host}`);
  } catch (error) {
    console.error(`[MongoDB] Connection Error: ${error.message}`);
    console.warn('[MongoDB] Server will continue running, but database operations will fail until MongoDB is connected.');
  }
};

module.exports = connectDB;

const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const errorHandler = require('./middlewares/errorHandler');

// Load environment variables
dotenv.config();

// Connect to MongoDB
connectDB();

const app = express();

// Middlewares
app.use(
  cors({
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    credentials: true,
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health Check Route
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    project: 'BookBridge API',
    theme: 'Paper & Ink',
    timestamp: new Date().toISOString(),
    endpoints: {
      auth: '/api/auth',
      books: '/api/books',
      exchanges: '/api/exchanges',
      users: '/api/users',
      admin: '/api/admin',
      notifications: '/api/notifications',
    },
  });
});

// Mount Module Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/books', require('./routes/bookRoutes'));
app.use('/api/exchanges', require('./routes/exchangeRoutes'));
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/admin', require('./routes/adminRoutes'));
app.use('/api/notifications', require('./routes/notificationRoutes'));

// 404 Route Not Found Handler
app.use((req, res, next) => {
  res.status(404).json({
    success: false,
    message: `API Route ${req.originalUrl} not found`,
  });
});

// Centralized Error Handler
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`[BookBridge Server] Running on http://localhost:${PORT}`);
  console.log(`[BookBridge Server] Environment: ${process.env.NODE_ENV || 'development'}`);
});

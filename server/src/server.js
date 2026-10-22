const express = require('express');
const path = require('path');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const errorHandler = require('./middlewares/errorHandler');

// Load environment variables
dotenv.config();

// Connect to MongoDB
connectDB();

const app = express();

// CORS: allow the configured frontend and explicitly approved development/preview origins.
const extraAllowedOrigins = (process.env.ALLOWED_ORIGINS || '')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);

const allowedOrigins = [
  process.env.CLIENT_URL,
  ...extraAllowedOrigins,
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  'http://localhost:3000',
].filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      // Requests without an Origin header (e.g. curl, Postman, server-to-server) are allowed.
      if (!origin) return callback(null, true);

      if (
        allowedOrigins.includes(origin) ||
        (process.env.NODE_ENV !== 'production' &&
          (() => {
            try {
              const url = new URL(origin);
              return url.hostname === 'localhost' || url.hostname === '127.0.0.1';
            } catch {
              return false;
            }
          })())
      ) {
        return callback(null, true);
      }

      return callback(new Error('Origin not allowed by CORS'));
    },
    credentials: true,
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static(path.resolve(__dirname, '../uploads')));

// Health Check Routes
const healthResponse = (req, res) => {
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
};

app.get('/api/health', healthResponse);
app.get('/health', healthResponse);
app.get('/', (req, res) => {
  res.status(200).json({
    status: 'online',
    message: 'BookBridge API is running',
    health: '/api/health',
  });
});

// Mount Module Routes (mounted at both /api/* and /* so requests succeed regardless of client baseURL configuration)
const authRoutes = require('./routes/authRoutes');
const bookRoutes = require('./routes/bookRoutes');
const exchangeRoutes = require('./routes/exchangeRoutes');
const userRoutes = require('./routes/userRoutes');
const adminRoutes = require('./routes/adminRoutes');
const notificationRoutes = require('./routes/notificationRoutes');

app.use('/api/auth', authRoutes);
app.use('/auth', authRoutes);

app.use('/api/books', bookRoutes);
app.use('/books', bookRoutes);

app.use('/api/exchanges', exchangeRoutes);
app.use('/exchanges', exchangeRoutes);

app.use('/api/users', userRoutes);
app.use('/users', userRoutes);

app.use('/api/admin', adminRoutes);
app.use('/admin', adminRoutes);

app.use('/api/notifications', notificationRoutes);
app.use('/notifications', notificationRoutes);

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

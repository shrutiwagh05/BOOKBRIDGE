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

// Middlewares: Flexible CORS configuration supporting Vercel deployments & localhost
const allowedOrigins = [
  process.env.CLIENT_URL,
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  'http://localhost:3000',
].filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      // allow requests with no origin (e.g. curl, postman, mobile apps, server-to-server)
      if (!origin) return callback(null, true);
      try {
        const url = new URL(origin);
        if (
          allowedOrigins.includes(origin) ||
          url.hostname.endsWith('.vercel.app') ||
          url.hostname === 'localhost' ||
          url.hostname === '127.0.0.1' ||
          process.env.NODE_ENV !== 'production'
        ) {
          return callback(null, true);
        }
      } catch (e) {
        // Fallback to allowing if invalid URL parser
      }
      return callback(null, true);
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

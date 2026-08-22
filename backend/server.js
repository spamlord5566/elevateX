const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const connectDB = require('./config/db');
const registrationRoutes = require('./routes/registrationRoutes');
const errorHandler = require('./middleware/errorMiddleware');

const app = express();
const PORT = process.env.PORT || 5000;

// Security Middlewares
app.use(helmet());

// CORS configuration
const allowedOrigin = process.env.CORS_ORIGIN || 'http://localhost:3000';
app.use(cors({
  origin: allowedOrigin,
  optionsSuccessStatus: 200
}));

// Rate Limiter
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  limit: 100, // Limit each IP to 100 requests per windowMs
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many requests from this IP, please try again after 15 minutes.'
  }
});

// Apply rate limiter to all API routes
app.use('/api', limiter);

// Body Parsers
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Log requests in development
if (process.env.NODE_ENV !== 'production') {
  app.use((req, res, next) => {
    console.log(`${req.method} ${req.originalUrl}`);
    next();
  });
}

// Routes
app.use('/api', registrationRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ success: true, message: 'Server is healthy' });
});

// Centralized Error Handling Middleware (must be after all routes)
app.use(errorHandler);

// Connect to database then start server
connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
  });
}).catch(err => {
  console.error('Failed to connect to database. Server not started.', err);
});

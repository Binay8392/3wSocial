const path = require('path');
const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const mongoose = require('mongoose');

const backendEnvPath = path.resolve(__dirname, '.env');
dotenv.config({ path: backendEnvPath, override: true });

const connectDB = require('./config/db');
const authRoutes = require('./routes/authRoutes');
const postRoutes = require('./routes/postRoutes');
const { notFound, errorHandler } = require('./middleware/errorMiddleware');

const app = express();
const PORT = process.env.PORT || 5000;

const mongoConfigured = Boolean(process.env.MONGODB_URI);
const jwtConfigured = Boolean(process.env.JWT_SECRET);
const cloudinaryConfigured = Boolean(
  process.env.CLOUDINARY_CLOUD_NAME &&
    process.env.CLOUDINARY_API_KEY &&
    process.env.CLOUDINARY_API_SECRET
);
console.log(`MONGODB_URI configured: ${mongoConfigured}`);
console.log(`JWT_SECRET configured: ${jwtConfigured}`);
console.log(`CLOUDINARY_CLOUD_NAME configured: ${Boolean(process.env.CLOUDINARY_CLOUD_NAME)}`);
console.log(`CLOUDINARY_API_KEY configured: ${Boolean(process.env.CLOUDINARY_API_KEY)}`);
console.log(`CLOUDINARY_API_SECRET configured: ${Boolean(process.env.CLOUDINARY_API_SECRET)}`);
console.log(`Cloudinary ready: ${cloudinaryConfigured}`);

// Trust the first proxy so req.protocol works behind Render/Vercel
app.set('trust proxy', 1);

// CORS — allow the Vite dev server, configured production frontend, and Vercel deployments
const allowedOrigins = [
  'http://localhost:5173',
  'http://127.0.0.1:5173',
].filter(Boolean);

if (process.env.CLIENT_URL) {
  allowedOrigins.push(process.env.CLIENT_URL);
}

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) {
        return callback(null, true);
      }

      if (
        allowedOrigins.includes(origin) ||
        origin.endsWith('.vercel.app') ||
        origin.includes('localhost')
      ) {
        return callback(null, true);
      }

      return callback(new Error('Not allowed by CORS'));
    },
    credentials: true,
  })
);

// Body parsers — JSON for most requests, large payloads for images via multipart
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Serve uploaded images during local development (Cloudinary is used in prod)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/posts', postRoutes);

// Health & root endpoints
app.get('/api/health', (req, res) => {
  const dbStatus = mongoose.connection.readyState === 1 ? 'connected' : 'disconnected';

  res.status(200).json({
    success: true,
    message: 'Server is healthy',
    database: dbStatus,
  });
});

app.get('/', (req, res) => {
  res.status(200).json({
    message: '3W Social API is running successfully',
  });
});

// Error handling
app.use(notFound);
app.use(errorHandler);

const startServer = async () => {
  if (!process.env.MONGODB_URI) {
    console.error('MONGODB_URI configured: false');
    console.error(
      'MongoDB configuration is missing. Add MONGODB_URI to backend/.env before starting the API.'
    );
    process.exit(1);
  }

  if (!process.env.JWT_SECRET) {
    console.error('JWT_SECRET configured: false');
    console.error(
      'JWT_SECRET is missing. Add JWT_SECRET to backend/.env before starting the API.'
    );
    process.exit(1);
  }

  try {
    await connectDB();
    app.listen(PORT, () => {
      console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error.message);
    process.exit(1);
  }
};

startServer();

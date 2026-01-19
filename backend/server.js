// Global error handler for uncaught errors
process.on('uncaughtException', (error) => {
  console.error('❌ Uncaught Exception:', error);
  console.error('Stack:', error.stack);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Unhandled Rejection at:', promise);
  console.error('Reason:', reason);
  process.exit(1);
});

console.log('📦 Loading server.js...');

import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

console.log('✅ Core imports loaded');

import authRoutes from './routes/auth.js';
import articleRoutes from './routes/articles.js';
import mediaSourceRoutes from './routes/media-sources.js';
import coverageRoutes from './routes/coverages.js';
import classificationRoutes from './routes/classifications.js';
import tagRoutes from './routes/tags.js';
import uploadRoutes from './routes/upload.js';

console.log('✅ Routes imported');

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('📝 Loading environment variables...');
dotenv.config();
console.log('✅ Environment variables loaded');

const app = express();
const PORT = process.env.PORT || 3001;

// Log environment info (without sensitive data)
console.log('🚀 Starting server...');
console.log('NODE_ENV:', process.env.NODE_ENV);
console.log('PORT:', PORT);
console.log('DB_HOST:', process.env.DB_HOST ? 'configured' : 'not configured');

// Middleware CORS - Normalizar URL (eliminar barras finales)
const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
const normalizedFrontendUrl = frontendUrl.replace(/\/+$/, ''); // Eliminar barras finales

console.log('CORS configured for:', normalizedFrontendUrl);

app.use(cors({
  origin: (origin, callback) => {
    // Permitir requests sin origin (como Postman, curl, etc.)
    if (!origin) {
      return callback(null, true);
    }
    
    // Normalizar el origin (eliminar barras finales)
    const normalizedOrigin = origin.replace(/\/+$/, '');
    
    // Verificar si el origin coincide (con o sin barra final)
    if (normalizedOrigin === normalizedFrontendUrl || origin === normalizedFrontendUrl) {
      callback(null, true);
    } else {
      console.warn('CORS blocked origin:', origin);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files from uploads directory
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/articles', articleRoutes);
app.use('/api/media-sources', mediaSourceRoutes);
app.use('/api/coverages', coverageRoutes);
app.use('/api/classifications', classificationRoutes);
app.use('/api/tags', tagRoutes);
app.use('/api/upload', uploadRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'API is running' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

try {
  console.log(`🎯 Attempting to start server on 0.0.0.0:${PORT}...`);
  const server = app.listen(PORT, '0.0.0.0', () => {
    console.log(`✅ Server running on port ${PORT}`);
    console.log(`✅ Server listening on 0.0.0.0:${PORT}`);
    console.log(`✅ Health check available at http://0.0.0.0:${PORT}/api/health`);
  });

  server.on('error', (err) => {
    console.error('❌ Server error:', err);
    if (err.code === 'EADDRINUSE') {
      console.error(`Port ${PORT} is already in use. Please stop the other process or change the PORT in .env`);
    }
    process.exit(1);
  });

  // Keep process alive
  process.on('SIGTERM', () => {
    console.log('SIGTERM received, shutting down gracefully');
    server.close(() => {
      console.log('Process terminated');
    });
  });
} catch (error) {
  console.error('❌ Error starting server:', error);
  console.error('Stack:', error.stack);
  process.exit(1);
}

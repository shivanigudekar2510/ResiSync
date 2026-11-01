import express from 'express';
import http from 'http';
import cors from 'cors';
import dotenv from 'dotenv';
import apiRouter from './routes/api.js';
import { errorHandler } from './middleware/errorHandler.js';
import { initSocket } from './socket.js';

dotenv.config();

const app = express();
const server = http.createServer(app);

// Initialize WebSockets
const io = initSocket(server);

// Middleware
app.use(cors({
  origin: process.env.CLIENT_URL || '*',
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health Check & Documentation
app.get('/api/health', (req, res) => {
  res.json({
    status: 'online',
    platform: 'RESISYNC: Smart Residential Operations Platform',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    features: {
      socketIO: true,
      sandboxPayments: true,
      iotSimulation: true,
    },
  });
});

// Mount Main API Router
app.use('/api', apiRouter);

// Centralized error handler
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

server.on('error', (err: any) => {
  if (err.code === 'EADDRINUSE') {
    console.warn(`⚠️ Port ${PORT} already in use. HTTP listener skipped (running in-memory or proxy mode).`);
  } else {
    console.error('Server error:', err);
  }
});

if (process.env.NODE_ENV !== 'test') {
  server.listen(PORT, () => {
    console.log(`🚀 RESISYNC Server operational on port ${PORT}`);
    console.log(`📡 WebSocket server initialized`);
    console.log(`🌐 API Health: http://localhost:${PORT}/api/health`);
  });
}

export { app, server, io };

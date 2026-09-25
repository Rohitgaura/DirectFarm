const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const http = require('http');
const { Server } = require('socket.io');
require('dotenv').config();


const { sequelize } = require('./models');

const app = express();
const server = http.createServer(app);

// Allowed origins for CORS (development, production, domain)
const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:3001',
  'http://127.0.0.1:3000',
  'https://directfarm.co.in',
  'https://api.directfarm.co.in',
  'https://www.directfarm.co.in',
  process.env.FRONTEND_URL
].filter(Boolean);

const corsOriginDelegate = (origin, callback) => {
  if (!origin) return callback(null, true);
  if (
    allowedOrigins.includes(origin) ||
    origin.endsWith('directfarm.co.in') ||
    origin.startsWith('http://localhost:') ||
    origin.startsWith('http://127.0.0.1:')
  ) {
    return callback(null, true);
  }
  return callback(null, true);
};

// Initialize Socket.io
const io = new Server(server, {
  path: '/socket.io',
  cors: {
    origin: corsOriginDelegate,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    credentials: true
  },
  transports: ['polling', 'websocket'],
  allowEIO3: true,
  pingTimeout: 60000,
  pingInterval: 25000
});

// Import routes
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const productRoutes = require('./routes/products');
const orderRoutes = require('./routes/orders');
const farmerRoutes = require('./routes/farmers');
const buyerRoutes = require('./routes/buyers');
const successStoriesRoutes = require('./routes/successStories');
const locationRoutes = require('./routes/locations');
const feedbackRoutes = require('./routes/feedback');
const complaintRoutes = require('./routes/complaints');
const publicStatsRoutes = require('./routes/publicStats');
const negotiationRoutes = require('./routes/negotiation');
const notificationRoutes = require('./routes/notification');
const chatRoutes = require('./routes/chat');
const adminRoutes = require('./routes/admin');
const analyticsRoutes = require('./routes/analytics');
const ratingRoutes = require('./routes/rating');


// Middleware
app.set('trust proxy', 1);
app.use(helmet({ crossOriginResourcePolicy: { policy: "cross-origin" } }));
app.use(cors({
  origin: corsOriginDelegate,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept']
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Clean Request Logger: [YYYY-MM-DD HH:mm:ss] METHOD /path
app.use((req, res, next) => {
  const now = new Date();
  const dateStr = now.toISOString().slice(0, 10);
  const timeStr = now.toTimeString().slice(0, 8);
  console.log(`[${dateStr} ${timeStr}] ${req.method} ${req.originalUrl || req.url}`);
  next();
});

// Rate limiting - generous for local development to prevent blocking UI requests
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: process.env.NODE_ENV === 'production' ? 1000 : 10000,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many requests, please try again later.' }
});
app.use('/api/', limiter);

// Socket.io Logic
const onlineUsers = new Map(); // userId -> socketId

io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  io.emit('activeUsersCount', io.engine.clientsCount);

  socket.on('getActiveUsersCount', () => {
    socket.emit('activeUsersCount', io.engine.clientsCount);
  });

  socket.on('join', (userId) => {
    onlineUsers.set(userId, socket.id);
    console.log(`User ${userId} joined with socket ${socket.id}`);
  });

  socket.on('disconnect', () => {
    for (const [userId, socketId] of onlineUsers.entries()) {
      if (socketId === socket.id) {
        onlineUsers.delete(userId);
        console.log(`User ${userId} disconnected`);
        break;
      }
    }
    console.log('User disconnected:', socket.id);
    io.emit('activeUsersCount', io.engine.clientsCount);
  });

  socket.on('markMessagesRead', ({ roomId, userId, senderId }) => {
    if (senderId) {
      const senderSocketId = onlineUsers.get(senderId);
      if (senderSocketId) {
        io.to(senderSocketId).emit('messageRead', { roomId, readBy: userId });
      }
    }
  });

  socket.on('messageDelivered', ({ messageId, senderId, roomId }) => {
    if (senderId) {
      const senderSocketId = onlineUsers.get(senderId);
      if (senderSocketId) {
        io.to(senderSocketId).emit('messageDelivered', { messageId, roomId });
      }
    }
  });
});

// Make io and onlineUsers available in routes
app.use((req, res, next) => {
  req.io = io;
  req.onlineUsers = onlineUsers;
  next();
});

// Connect to PostgreSQL database via Sequelize
sequelize.authenticate()
  .then(async () => {
    console.log('✅ Connected to PostgreSQL database (pgAdmin 4 ready)');
    console.log(`📦 Database: ${process.env.DB_NAME || 'directfarm'}`);
    await sequelize.sync({ alter: true });
    console.log('📦 All PostgreSQL tables synchronized');
  })
  .catch(err => {
    console.error('❌ PostgreSQL connection error:', err.message);
  });

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/farmers', farmerRoutes);
app.use('/api/buyers', buyerRoutes);
app.use('/api/success-stories', successStoriesRoutes);
app.use('/api/locations', locationRoutes);
app.use('/api/feedback', feedbackRoutes);
app.use('/api/complaints', complaintRoutes);
app.use('/api/public', publicStatsRoutes);
app.use('/api/negotiations', negotiationRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/ratings', ratingRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    database: 'PostgreSQL',
    message: 'DirectFarm API is running',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

const path = require('path');
const fs = require('fs');
const buildPath = path.join(__dirname, '../directfarm-react/build');
if (fs.existsSync(buildPath)) {
  app.use(express.static(buildPath));
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api')) return next();
    res.sendFile(path.join(buildPath, 'index.html'));
  });
} else {
  app.get('/', (req, res) => {
    res.json({
      message: 'Welcome to DirectFarm API (PostgreSQL backend)',
      version: '1.0.0'
    });
  });
  app.use('*', (req, res) => {
    res.status(404).json({
      success: false,
      message: 'Route not found'
    });
  });
}

const PORT = process.env.PORT || 5001;

server.listen(PORT, "0.0.0.0", () => {
  console.log(`🚀 DirectFarm server running on port ${PORT}`);
  console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🐘 Database: PostgreSQL (${process.env.DB_NAME || 'directfarm'})`);
  console.log(`🔗 API URL: http://localhost:${PORT}`);
});

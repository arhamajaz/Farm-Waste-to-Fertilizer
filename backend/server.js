require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

// Route Handlers
const authRoutes = require('./routes/auth.routes');
const recipesRoutes = require('./routes/recipes.routes');
const reportsRoutes = require('./routes/reports.routes');

const app = express();
const PORT = process.env.PORT || 5000;

// Standard Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Root Meta Endpoint
app.get('/', (req, res) => {
  res.json({
    name: 'KrishiUrja BioRefinery API Engine',
    version: '1.0.0',
    description: 'Statutory Bio-Fertilizer Formulation & FCO Compliance Backend',
    endpoints: {
      health: '/api/health',
      auth: '/api/auth',
      recipes: '/api/recipes',
      reports: '/api/reports'
    },
    status: 'Operational'
  });
});

// Health Check Endpoint
app.get('/api/health', (req, res) => {
  const dbStatus = mongoose.connection.readyState;
  const dbStatusMap = {
    0: 'disconnected',
    1: 'connected',
    2: 'connecting',
    3: 'disconnecting'
  };

  res.status(200).json({
    status: 'healthy',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
    database: dbStatusMap[dbStatus] || 'unknown'
  });
});

// Mount Resource Routers
app.use('/api/auth', authRoutes);
app.use('/api/recipes', recipesRoutes);
app.use('/api/reports', reportsRoutes);

// 404 Catch-All Handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Resource ${req.originalUrl} not found on this server.`
  });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('[ServerError]', err.stack || err.message);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal Server Error'
  });
});

// MongoDB Connection Logic
const connectDB = async () => {
  const mongoUri = process.env.MONGO_URI;

  if (!mongoUri || mongoUri === 'your_mongodb_connection_string_here') {
    console.warn('⚠️ [MongoDB] MONGO_URI is set to placeholder in .env. Skipping active database connection.');
    return;
  }

  try {
    console.log('🔄 [MongoDB] Connecting to database cluster...');
    const conn = await mongoose.connect(mongoUri);
    console.log(`✅ [MongoDB] Connected successfully: ${conn.connection.host}`);
  } catch (error) {
    console.error('❌ [MongoDB] Connection error:', error.message);
  }
};

// Start Server Execution
const startServer = async () => {
  await connectDB();
  const server = app.listen(PORT, () => {
    console.log(`🚀 [KrishiUrja API] Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
    console.log(`   Health check available at: http://localhost:${PORT}/api/health`);
  });
  return server;
};

if (require.main === module) {
  startServer();
}

module.exports = { app, startServer };

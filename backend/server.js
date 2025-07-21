const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const path = require('path');
const http = require('http');
require('dotenv').config();

// Import utilities
const { logger, logRequest, logError } = require('./utils/logger');
const { uploadsDir } = require('./middleware/upload');
const socketManager = require('./utils/socket');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Logging middleware
app.use(logRequest);

// Serve static files
app.use('/uploads', express.static(uploadsDir));

// MongoDB connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/erp_db', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => {
  logger.info('MongoDB bağlantısı başarılı');
  console.log('MongoDB bağlantısı başarılı');
})
.catch(err => {
  logger.error('MongoDB bağlantı hatası', { error: err.message });
  console.error('MongoDB bağlantı hatası:', err);
});

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/users', require('./routes/users'));
app.use('/api/products', require('./routes/products'));
app.use('/api/orders', require('./routes/orders'));
app.use('/api/backup', require('./routes/backup'));

// Error logging middleware
app.use(logError);

// Test route
app.get('/', (req, res) => {
  res.json({ message: 'ERP API çalışıyor!' });
});

// Create HTTP server
const server = http.createServer(app);

// Initialize Socket.IO
socketManager.initialize(server);

server.listen(PORT, () => {
  logger.info(`Sunucu başlatıldı`, { port: PORT });
  console.log(`Sunucu ${PORT} portunda çalışıyor`);
}); 
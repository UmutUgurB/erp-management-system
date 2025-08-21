const express = require('express');
const app = express();

// Basic middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// CORS middleware
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  
  if (req.method === 'OPTIONS') {
    res.sendStatus(200);
  } else {
    next();
  }
});

// Test route
app.get('/test', (req, res) => {
  res.json({ message: 'Simple server is working!' });
});

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// Auth test route
app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;
  
  // Demo login
  if (email === 'admin@example.com' && password === '123456') {
    res.json({
      success: true,
      user: {
        id: '1',
        email: 'admin@example.com',
        name: 'Admin User',
        role: 'admin'
      },
      accessToken: 'demo-token-123',
      refreshToken: 'demo-refresh-123'
    });
  } else if (email === 'manager@example.com' && password === '123456') {
    res.json({
      success: true,
      user: {
        id: '2',
        email: 'manager@example.com',
        name: 'Manager User',
        role: 'manager'
      },
      accessToken: 'demo-token-456',
      refreshToken: 'demo-refresh-456'
    });
  } else {
    res.status(401).json({
      success: false,
      message: 'Invalid credentials'
    });
  }
});

// Start server
const PORT = 5000;
app.listen(PORT, () => {
  console.log(`Simple server running on port ${PORT}`);
  console.log(`Test endpoint: http://localhost:${PORT}/test`);
  console.log(`Health check: http://localhost:${PORT}/health`);
  console.log(`Login endpoint: http://localhost:${PORT}/api/auth/login`);
});


const express = require('express');
const app = express();

// Basic middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Test route
app.get('/test', (req, res) => {
  res.json({ message: 'Test server is working!' });
});

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// Start server
const PORT = 3001;
app.listen(PORT, () => {
  console.log(`Test server running on port ${PORT}`);
  console.log(`Test endpoint: http://localhost:${PORT}/test`);
  console.log(`Health check: http://localhost:${PORT}/health`);
});

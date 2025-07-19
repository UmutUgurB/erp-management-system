const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/erp_db', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('MongoDB bağlantısı başarılı'))
.catch(err => console.error('MongoDB bağlantı hatası:', err));

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/users', require('./routes/users'));
app.use('/api/products', require('./routes/products'));
app.use('/api/orders', require('./routes/orders'));

// Test route
app.get('/', (req, res) => {
  res.json({ message: 'ERP API çalışıyor!' });
});

app.listen(PORT, () => {
  console.log(`Sunucu ${PORT} portunda çalışıyor`);
}); 
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const auth = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ message: 'Token bulunamadı, erişim reddedildi' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    const user = await User.findById(decoded.userId).select('-password');
    
    if (!user || !user.isActive) {
      return res.status(401).json({ message: 'Geçersiz token veya kullanıcı deaktif' });
    }

    req.user = user;
    next();
  } catch (error) {
    res.status(401).json({ message: 'Token geçerli değil' });
  }
};

const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ 
        message: 'Bu işlem için yetkiniz bulunmuyor' 
      });
    }
    next();
  };
};

module.exports = { auth, authorize }; 
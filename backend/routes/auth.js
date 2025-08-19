const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const User = require('../models/User');
const { auth } = require('../middleware/auth');
const logger = require('../utils/logger');
const ResponseFormatter = require('../utils/responseFormatter');
const { body, validationResult } = require('express-validator');
const rateLimit = require('express-rate-limit');

const router = express.Router();

// Rate limiters
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // limit each IP to 5 requests per windowMs
  message: 'Too many login attempts, please try again later',
  standardHeaders: true,
  legacyHeaders: false,
});

const registerLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 3, // limit each IP to 3 registration attempts per hour
  message: 'Too many registration attempts, please try again later',
});

// Validation rules
const registerValidation = [
  body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
  body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters'),
  body('name').trim().isLength({ min: 2 }).withMessage('Name must be at least 2 characters'),
  body('role').optional().isIn(['admin', 'manager', 'employee']).withMessage('Invalid role'),
];

const loginValidation = [
  body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
  body('password').notEmpty().withMessage('Password is required'),
];

const passwordResetValidation = [
  body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
];

const passwordChangeValidation = [
  body('currentPassword').notEmpty().withMessage('Current password is required'),
  body('newPassword').isLength({ min: 8 }).withMessage('New password must be at least 8 characters'),
];

// Helper functions
const generateAccessToken = (userId) => {
  return jwt.sign(
    { userId, type: 'access' },
    process.env.JWT_SECRET || 'your-secret-key',
    { expiresIn: process.env.JWT_EXPIRES_IN || '24h' }
  );
};

const generateRefreshToken = (userId) => {
  return jwt.sign(
    { userId, type: 'refresh' },
    process.env.JWT_REFRESH_SECRET || 'your-refresh-secret-key',
    { expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d' }
  );
};

const addLoginHistory = async (user, req, success, reason = '') => {
  const loginEntry = {
    timestamp: new Date(),
    ip: req.ip,
    userAgent: req.get('User-Agent'),
    success,
    reason,
  };

  user.loginHistory = user.loginHistory || [];
  user.loginHistory.unshift(loginEntry);
  
  // Keep only last 10 entries
  if (user.loginHistory.length > 10) {
    user.loginHistory = user.loginHistory.slice(0, 10);
  }

  await user.save();
  return loginEntry;
};

// Register
router.post('/register', registerLimiter, registerValidation, async (req, res) => {
  try {
    // Check validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return ResponseFormatter.validationError(res, errors.array());
    }

    const { name, email, password, role = 'employee', department } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      logger.security.loginAttempt(email, req.ip, false, 'Email already exists');
      return ResponseFormatter.conflict(res, 'Bu email ile kayıtlı kullanıcı zaten mevcut', 'email');
    }

    // Create new user
    const user = new User({
      name,
      email,
      password,
      role,
      department,
      profile: {
        firstName: name.split(' ')[0],
        lastName: name.split(' ').slice(1).join(' ') || '',
      },
      loginHistory: [],
      isActive: true,
      emailVerified: false,
      emailVerificationToken: crypto.randomBytes(32).toString('hex'),
    });

    await user.save();

    // Generate tokens
    const accessToken = generateAccessToken(user._id);
    const refreshToken = generateRefreshToken(user._id);

    // Save refresh token to user
    user.refreshTokens = user.refreshTokens || [];
    user.refreshTokens.push(refreshToken);
    await user.save();

    // Log successful registration
    logger.business.orderCreated(user._id, email, 'user_registration');

    return ResponseFormatter.created(res, {
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        department: user.department,
        emailVerified: user.emailVerified,
      },
      tokens: {
        accessToken,
        refreshToken,
        expiresIn: '24h',
      }
    }, 'Kullanıcı başarıyla oluşturuldu');

  } catch (error) {
    logger.logError(error, { endpoint: '/register', ip: req.ip });
    return ResponseFormatter.serverError(res, undefined, error);
  }
});

// Login
router.post('/login', loginLimiter, loginValidation, async (req, res) => {
  try {
    // Check validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return ResponseFormatter.validationError(res, errors.array());
    }

    const { email, password, rememberMe = false } = req.body;

    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      logger.security.loginAttempt(email, req.ip, false, 'User not found');
      return ResponseFormatter.unauthorized(res, 'Geçersiz kullanıcı bilgileri');
    }

    if (!user.isActive) {
      logger.security.loginAttempt(email, req.ip, false, 'Account disabled');
      await addLoginHistory(user, req, false, 'Account disabled');
      return ResponseFormatter.forbidden(res, 'Hesabınız devre dışı bırakılmış');
    }

    // Check password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      logger.security.loginAttempt(email, req.ip, false, 'Invalid password');
      await addLoginHistory(user, req, false, 'Invalid password');
      return ResponseFormatter.unauthorized(res, 'Geçersiz kullanıcı bilgileri');
    }

    // Generate tokens
    const accessToken = generateAccessToken(user._id);
    const refreshToken = generateRefreshToken(user._id);

    // Save refresh token to user
    user.refreshTokens = user.refreshTokens || [];
    user.refreshTokens.push(refreshToken);
    
    // Clean old refresh tokens (keep only last 5)
    if (user.refreshTokens.length > 5) {
      user.refreshTokens = user.refreshTokens.slice(-5);
    }

    // Update last login
    user.lastLogin = new Date();
    user.loginCount = (user.loginCount || 0) + 1;
    
    await user.save();

    // Add to login history
    await addLoginHistory(user, req, true, 'Successful login');

    // Log successful login
    logger.security.loginAttempt(email, req.ip, true, 'Successful login');

    const userData = {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      department: user.department,
      emailVerified: user.emailVerified,
      lastLogin: user.lastLogin,
      loginCount: user.loginCount,
      profile: user.profile,
    };

    const responseData = {
      user: userData,
      tokens: {
        accessToken,
        refreshToken,
        expiresIn: rememberMe ? '7d' : '24h',
      }
    };

    return ResponseFormatter.success(res, responseData, 'Giriş başarılı');

  } catch (error) {
    logger.logError(error, { endpoint: '/login', ip: req.ip });
    return ResponseFormatter.serverError(res, undefined, error);
  }
});

// Get current user
router.get('/me', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password -refreshTokens');
    if (!user) {
      return ResponseFormatter.notFound(res, 'User');
    }

    return ResponseFormatter.success(res, { user }, 'Kullanıcı bilgileri getirildi');
  } catch (error) {
    logger.logError(error, { endpoint: '/me', userId: req.user._id });
    return ResponseFormatter.serverError(res, undefined, error);
  }
});

// Refresh token
router.post('/refresh', async (req, res) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return ResponseFormatter.unauthorized(res, 'Refresh token gerekli');
    }

    // Verify refresh token
    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET || 'your-refresh-secret-key');
    
    if (decoded.type !== 'refresh') {
      return ResponseFormatter.unauthorized(res, 'Geçersiz token türü');
    }

    // Find user and check if refresh token exists
    const user = await User.findById(decoded.userId);
    if (!user || !user.refreshTokens || !user.refreshTokens.includes(refreshToken)) {
      return ResponseFormatter.unauthorized(res, 'Geçersiz refresh token');
    }

    // Generate new tokens
    const newAccessToken = generateAccessToken(user._id);
    const newRefreshToken = generateRefreshToken(user._id);

    // Replace old refresh token with new one
    const tokenIndex = user.refreshTokens.indexOf(refreshToken);
    user.refreshTokens[tokenIndex] = newRefreshToken;
    await user.save();

    return ResponseFormatter.success(res, {
      tokens: {
        accessToken: newAccessToken,
        refreshToken: newRefreshToken,
        expiresIn: '24h',
      }
    }, 'Token yenilendi');

  } catch (error) {
    if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
      return ResponseFormatter.unauthorized(res, 'Geçersiz veya süresi dolmuş token');
    }
    logger.logError(error, { endpoint: '/refresh' });
    return ResponseFormatter.serverError(res, undefined, error);
  }
});

// Logout
router.post('/logout', auth, async (req, res) => {
  try {
    const { refreshToken } = req.body;
    const user = await User.findById(req.user._id);

    if (user && refreshToken && user.refreshTokens) {
      // Remove specific refresh token
      user.refreshTokens = user.refreshTokens.filter(token => token !== refreshToken);
    } else if (user) {
      // Remove all refresh tokens if no specific token provided
      user.refreshTokens = [];
    }

    if (user) {
      await user.save();
      await addLoginHistory(user, req, true, 'Logged out');
    }

    logger.security.loginAttempt(req.user.email, req.ip, true, 'Logged out');

    return ResponseFormatter.success(res, null, 'Başarıyla çıkış yapıldı');
  } catch (error) {
    logger.logError(error, { endpoint: '/logout', userId: req.user._id });
    return ResponseFormatter.serverError(res, undefined, error);
  }
});

// Password reset request
router.post('/password-reset', passwordResetValidation, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return ResponseFormatter.validationError(res, errors.array());
    }

    const { email } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      // Don't reveal that email doesn't exist
      return ResponseFormatter.success(res, null, 'Şifre sıfırlama bağlantısı email adresinize gönderildi');
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenHash = crypto.createHash('sha256').update(resetToken).digest('hex');

    user.passwordResetToken = resetTokenHash;
    user.passwordResetExpires = Date.now() + 10 * 60 * 1000; // 10 minutes
    await user.save();

    logger.security.passwordReset(email, req.ip);

    // In a real app, you would send an email here
    // For now, we'll just return success
    return ResponseFormatter.success(res, null, 'Şifre sıfırlama bağlantısı email adresinize gönderildi');

  } catch (error) {
    logger.logError(error, { endpoint: '/password-reset' });
    return ResponseFormatter.serverError(res, undefined, error);
  }
});

// Password reset confirm
router.post('/password-reset/:token', async (req, res) => {
  try {
    const { token } = req.params;
    const { password } = req.body;

    if (!password || password.length < 8) {
      return ResponseFormatter.validationError(res, [{ message: 'Password must be at least 8 characters' }]);
    }

    // Hash the token to compare with stored hash
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

    const user = await User.findOne({
      passwordResetToken: hashedToken,
      passwordResetExpires: { $gt: Date.now() }
    });

    if (!user) {
      return ResponseFormatter.unauthorized(res, 'Geçersiz veya süresi dolmuş token');
    }

    // Update password
    user.password = password;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    user.refreshTokens = []; // Invalidate all sessions
    await user.save();

    return ResponseFormatter.success(res, null, 'Şifre başarıyla sıfırlandı');

  } catch (error) {
    logger.logError(error, { endpoint: '/password-reset/confirm' });
    return ResponseFormatter.serverError(res, undefined, error);
  }
});

// Change password
router.post('/change-password', auth, passwordChangeValidation, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return ResponseFormatter.validationError(res, errors.array());
    }

    const { currentPassword, newPassword } = req.body;
    const user = await User.findById(req.user._id);

    if (!user) {
      return ResponseFormatter.notFound(res, 'User');
    }

    // Verify current password
    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      return ResponseFormatter.unauthorized(res, 'Mevcut şifre yanlış');
    }

    // Update password
    user.password = newPassword;
    user.refreshTokens = []; // Invalidate all sessions
    await user.save();

    return ResponseFormatter.success(res, null, 'Şifre başarıyla değiştirildi');

  } catch (error) {
    logger.logError(error, { endpoint: '/change-password', userId: req.user._id });
    return ResponseFormatter.serverError(res, undefined, error);
  }
});

// Get login history
router.get('/login-history', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('loginHistory');
    
    if (!user) {
      return ResponseFormatter.notFound(res, 'User');
    }

    return ResponseFormatter.success(res, {
      loginHistory: user.loginHistory || []
    }, 'Login geçmişi getirildi');

  } catch (error) {
    logger.logError(error, { endpoint: '/login-history', userId: req.user._id });
    return ResponseFormatter.serverError(res, undefined, error);
  }
});

// Verify email
router.get('/verify-email/:token', async (req, res) => {
  try {
    const { token } = req.params;
    
    const user = await User.findOne({ emailVerificationToken: token });
    if (!user) {
      return ResponseFormatter.unauthorized(res, 'Geçersiz doğrulama token\'ı');
    }

    user.emailVerified = true;
    user.emailVerificationToken = undefined;
    await user.save();

    return ResponseFormatter.success(res, null, 'Email başarıyla doğrulandı');

  } catch (error) {
    logger.logError(error, { endpoint: '/verify-email' });
    return ResponseFormatter.serverError(res, undefined, error);
  }
});

module.exports = router; 
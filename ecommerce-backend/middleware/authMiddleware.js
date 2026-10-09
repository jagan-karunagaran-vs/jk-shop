const jwt = require('jsonwebtoken');
const User = require('../models/user');

const protect = async (req, res, next) => {
  const authorization = req.headers.authorization;
  const match =
    typeof authorization === 'string'
      ? authorization.match(/^Bearer\s+(\S+)$/i)
      : null;

  if (!match) {
    return res.status(401).json({
      success: false,
      message: 'Not authorized, no valid Bearer token provided',
    });
  }

  let decoded;

  try {
    decoded = jwt.verify(match[1], process.env.JWT_SECRET);
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Token has expired, please log in again',
      });
    }

    if (
      error.name === 'JsonWebTokenError' ||
      error.name === 'NotBeforeError'
    ) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized, invalid token',
      });
    }

    return next(error);
  }

  if (
    !decoded ||
    typeof decoded !== 'object' ||
    typeof decoded.id !== 'string' ||
    !/^[a-f\d]{24}$/i.test(decoded.id)
  ) {
    return res.status(401).json({
      success: false,
      message: 'Not authorized, invalid token',
    });
  }

  try {
    const user = await User.findById(decoded.id).select('-password');

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized, user not found',
      });
    }

    if (!user.isActive) {
      return res.status(403).json({
        success: false,
        message: 'Your account has been deactivated',
      });
    }

    req.user = user;
  } catch (error) {
    // Database errors go to the central error handler.
    return next(error);
  }

  return next();
};

const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized, please log in',
      });
    }

    if (!req.user.isActive || !roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to access this resource',
      });
    }

    return next();
  };
};

const requireAdmin = async (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: 'Not authorized, please log in',
    });
  }

  try {
    const freshUser = await User.findById(req.user._id).select('-password');

    if (
      !freshUser ||
      freshUser.role !== 'admin' ||
      !freshUser.isActive
    ) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to access this resource',
      });
    }

    req.user = freshUser;
  } catch (error) {
    return next(error);
  }

  return next();
};

module.exports = {
  protect,
  authorize,
  requireAdmin,
};
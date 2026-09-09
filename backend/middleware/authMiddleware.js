const jwt = require('jsonwebtoken');
const User = require('../models/User');

const protect = async (req, res, next) => {
  try {
    let token;

    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith('Bearer')
    ) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      res.status(401);
      throw new Error('Not authorized, no token provided');
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findById(decoded.id);

    if (!user) {
      res.status(401);
      throw new Error('Not authorized, user not found');
    }

    // Attach safe user info to the request
    req.user = {
      id: user._id.toString(),
      username: user.username,
    };

    next();
  } catch (error) {
    next(error);
  }
};

// Attach req.user when a valid token is provided, but never block the request.
// Used for the public feed so it can include likedByCurrentUser.
const optionalAuth = async (req, res, next) => {
  try {
    let token;

    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith('Bearer')
    ) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (token) {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.id);

      if (user) {
        req.user = {
          id: user._id.toString(),
          username: user.username,
        };
      }
    }
  } catch (error) {
    // Ignore token errors for public routes
  }

  next();
};

module.exports = { protect, optionalAuth };

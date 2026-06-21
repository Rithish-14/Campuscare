const jwt = require('jsonwebtoken');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const protect = async (req, res, next) => {
  let token;

  // Check authorization header
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      // Get token from header
      token = req.headers.authorization.split(' ')[1];

      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'campus_care_super_secret_jwt_key_98765');

      // Get user from database (excluding password)
      const user = await prisma.user.findUnique({
        where: { id: decoded.id },
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          department: true,
          createdAt: true
        }
      });

      if (!user) {
        return res.status(401).json({ message: 'User belonging to this token no longer exists.' });
      }

      // Grant access to req.user
      req.user = user;
      next();
    } catch (error) {
      console.error('JWT Verification Error:', error);
      return res.status(401).json({ message: 'Not authorized, token failed.' });
    }
  }

  if (!token) {
    return res.status(401).json({ message: 'Not authorized, no token provided.' });
  }
};

const restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({
        message: `Role '${req.user ? req.user.role : 'Guest'}' is not authorized to access this resource.`
      });
    }
    next();
  };
};

module.exports = {
  protect,
  restrictTo
};

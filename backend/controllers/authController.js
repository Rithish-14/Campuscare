const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'campus_care_super_secret_jwt_key_98765', {
    expiresIn: '30d'
  });
};

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
const registerUser = async (req, res) => {
  try {
    const { name, email, password, role, department } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Please provide name, email, and password.' });
    }

    // Check if user already exists
    const userExists = await prisma.user.findUnique({
      where: { email }
    });

    if (userExists) {
      return res.status(400).json({ message: 'User already exists with this email.' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // If it is the first user, default to ADMIN role
    const totalUsers = await prisma.user.count();
    let finalRole = role || 'STUDENT';
    
    if (totalUsers === 0) {
      finalRole = 'ADMIN';
    } else if (email.toLowerCase() === 'admin@campuscare.edu') {
      finalRole = 'ADMIN';
    }

    // Create user
    const user = await prisma.user.create({
      data: {
        name,
        email: email.toLowerCase(),
        password: hashedPassword,
        role: finalRole.toUpperCase(),
        department: department || null
      }
    });

    res.status(201).json({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      department: user.department,
      token: generateToken(user.id)
    });
  } catch (error) {
    console.error('Registration Error:', error);
    res.status(500).json({ message: 'Registration failed. Server error.' });
  }
};

// @desc    Authenticate user & get token
// @route   POST /api/auth/login
// @access  Public
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Please provide email and password.' });
    }

    // Check for user
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() }
    });

    if (user && (await bcrypt.compare(password, user.password))) {
      res.json({
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        department: user.department,
        token: generateToken(user.id)
      });
    } else {
      res.status(401).json({ message: 'Invalid email or password.' });
    }
  } catch (error) {
    console.error('Login Error:', error);
    res.status(500).json({ message: 'Login failed. Server error.' });
  }
};

// @desc    Get user profile
// @route   GET /api/auth/profile
// @access  Private
const getUserProfile = async (req, res) => {
  try {
    res.json(req.user);
  } catch (error) {
    console.error('Profile Retrieval Error:', error);
    res.status(500).json({ message: 'Failed to retrieve profile. Server error.' });
  }
};

module.exports = {
  registerUser,
  loginUser,
  getUserProfile
};

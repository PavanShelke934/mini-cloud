const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const router = express.Router();

const generateToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET || 'fallback_secret', {
    expiresIn: '7d',
  });
};

// POST /api/auth/register
router.post('/register', async (req, res) => {
  console.log('--- REGISTER REQUEST ---');
  console.log('req.body:', req.body);
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      console.log('Validation Error: Email or password missing');
      return res.status(400).json({ error: 'Email and password are required' });
    }

    if (password.length < 6) {
      console.log('Validation Error: Password too short');
      return res.status(400).json({ error: 'Password must be at least 6 characters long' });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      console.log('Validation Error: User already exists');
      return res.status(400).json({ error: 'Email is already registered' });
    }

    const user = new User({ email, password });
    await user.save();
    console.log('User successfully saved to MongoDB:', user.email);

    const token = generateToken(user._id);
    res.status(201).json({ token, user: { id: user._id, email: user.email } });
  } catch (error) {
    console.error('Registration error details:', error);
    res.status(500).json({ error: 'Registration failed: ' + error.message });
  }
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
  console.log('--- LOGIN REQUEST ---');
  console.log('req.body:', req.body);
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      console.log('Validation Error: Email or password missing');
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const user = await User.findOne({ email });
    console.log('User found in DB:', user ? 'Yes' : 'No');
    
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const isMatch = await user.comparePassword(password);
    console.log('Password match result:', isMatch);
    
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const token = generateToken(user._id);
    console.log('Login successful for user:', user.email);
    res.status(200).json({ token, user: { id: user._id, email: user.email } });
  } catch (error) {
    console.error('Login error details:', error);
    res.status(500).json({ error: 'Login failed: ' + error.message });
  }
});

module.exports = router;

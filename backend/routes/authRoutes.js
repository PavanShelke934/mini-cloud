const express = require('express');
const jwt = require('jsonwebtoken');
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const User = require('../models/User');

const router = express.Router();

// Passport Google Strategy setup
passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID || 'placeholder-client-id',
    clientSecret: process.env.GOOGLE_CLIENT_SECRET || 'placeholder-client-secret',
    callbackURL: "http://localhost:5000/api/auth/google/callback"
  },
  async (accessToken, refreshToken, profile, cb) => {
    try {
      // Check if user already exists
      let user = await User.findOne({ googleId: profile.id });
      
      if (user) {
        return cb(null, user);
      }
      
      // Also check if user exists with the same email
      const email = profile.emails && profile.emails[0] ? profile.emails[0].value : null;
      if (email) {
        user = await User.findOne({ email });
        if (user) {
          // Link google id to existing user
          user.googleId = profile.id;
          await user.save();
          return cb(null, user);
        }
      }

      // Create new user
      user = new User({
        googleId: profile.id,
        email: email || `${profile.id}@google.placeholder.com`
      });
      await user.save();
      
      cb(null, user);
    } catch (err) {
      cb(err, null);
    }
  }
));

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (err) {
    done(err, null);
  }
});

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

// GET /api/auth/google
router.get('/google',
  passport.authenticate('google', { scope: ['profile', 'email'] })
);

// GET /api/auth/google/callback
router.get('/google/callback', 
  passport.authenticate('google', { failureRedirect: 'http://localhost:5173/login?error=oauth_failed' }),
  (req, res) => {
    // Successful authentication, generate JWT
    const token = generateToken(req.user._id);
    
    // Redirect to frontend with token in URL (hash or query)
    res.redirect(`http://localhost:5173/?token=${token}&user=${encodeURIComponent(JSON.stringify({ id: req.user._id, email: req.user.email }))}`);
  }
);

module.exports = router;

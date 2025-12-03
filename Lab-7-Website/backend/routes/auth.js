const express = require('express');
const bcrypt = require('bcrypt');
const User = require('../models/User');
const router = express.Router();
const SALT_ROUNDS = 10;

// register user 
router.post('/register', async (req, res) => {
  try {
    const { username, email, password, role } = req.body;
    if (!username || !email || !password) return res.status(400).json({ error: 'Missing fields' });

    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ error: 'Email already registered' });

    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);  // by dedault it is user 
    const user = new User({ username, email, passwordHash, role: role === 'admin' ? 'admin' : 'user' });
    await user.save();

    // session stuff 
    req.session.userId = user._id;
    req.session.userRole = user.role;
    req.session.userName = user.username;

    res.json({ message: 'Registered', user: { id: user._id, username: user.username, email: user.email, role: user.role } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: 'Missing fields' });

    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ error: 'Invalid credentials' });

    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) return res.status(400).json({ error: 'Invalid credentials' });

    req.session.userId = user._id;
    req.session.userRole = user.role;
    req.session.userName = user.username;

    res.json({ message: 'Logged in', user: { id: user._id, username: user.username, email: user.email, role: user.role } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Logout
router.post('/logout', (req, res) => {
  req.session.destroy(err => {
    if (err) return res.status(500).json({ error: 'Could not log out' });
    res.clearCookie('sid');
    res.json({ message: 'Logged out' });
  });
});

// get current session user 
router.get('/me', (req, res) => {
  if (!req.session || !req.session.userId) return res.json({ user: null });
  res.json({
    user: {
      id: req.session.userId,
      username: req.session.userName,
      role: req.session.userRole
    }
  });
});

module.exports = router;

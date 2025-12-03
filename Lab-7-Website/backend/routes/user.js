const express = require('express');
const bcrypt = require('bcrypt');
const User = require('../models/User');
const { isAuthenticated } = require('../middleware/auth');

const router = express.Router();

// get profile
router.get('/profile', isAuthenticated, async (req, res) => {
  const user = await User.findById(req.session.userId).select('-passwordHash');
  res.json({ user });
});

// update profile (username, email, password)
router.put('/profile', isAuthenticated, async (req, res) => {
  const { username, email, password } = req.body;
  try {
    const user = await User.findById(req.session.userId);
    if (!user) return res.status(404).json({ error: 'User not found' });

    if (username) user.username = username;
    if (email) user.email = email;
    if (password) user.passwordHash = await bcrypt.hash(password, 10);

    await user.save();

    // update session name if changed
    req.session.userName = user.username;

    res.json({ message: 'Profile updated', user: { id: user._id, username: user.username, email: user.email }});
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// delete account
router.delete('/profile', isAuthenticated, async (req, res) => {
  try {
    await User.findByIdAndDelete(req.session.userId);
    req.session.destroy(err => {
      if (err) console.error('Session destroy error', err);
    });
    res.clearCookie('sid');
    res.json({ message: 'Account deleted' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;

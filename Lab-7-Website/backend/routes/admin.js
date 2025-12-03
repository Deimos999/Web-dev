const express = require('express');
const bcrypt = require('bcrypt');
const User = require('../models/User');
const { isAuthenticated, isAdmin } = require('../middleware/auth');

const router = express.Router();

// all admin routes 
router.use(isAuthenticated, isAdmin);

// list users 
router.get('/users', async (req, res) => {
  const users = await User.find().select('-passwordHash');
  res.json({ users });
});

// create user 
router.post('/users', async (req, res) => {
  try {
    const { username, email, password, role } = req.body;
    if (!username || !email || !password) return res.status(400).json({ error: 'Missing fields' });
    const exists = await User.findOne({ email });
    if (exists) return res.status(400).json({ error: 'Email already used' });

    const hash = await bcrypt.hash(password, 10);
    const user = new User({ username, email, passwordHash: hash, role: role === 'admin' ? 'admin' : 'user' });
    await user.save();
    res.json({ message: 'User created', user: { id: user._id, username: user.username, email: user.email, role: user.role }});
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Update any user
router.put('/users/:id', async (req, res) => {
  try {
    const id = req.params.id;
    const { username, email, password, role } = req.body;
    const user = await User.findById(id);
    if (!user) return res.status(404).json({ error: 'User not found' });

    if (username) user.username = username;
    if (email) user.email = email;
    if (role) user.role = role;
    if (password) user.passwordHash = await bcrypt.hash(password, 10);

    await user.save();
    res.json({ message: 'User updated', user: { id: user._id, username: user.username, email: user.email, role: user.role }});
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Delete user
router.delete('/users/:id', async (req, res) => {
  try {
    const id = req.params.id;
    await User.findByIdAndDelete(id);
    res.json({ message: 'User deleted' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;

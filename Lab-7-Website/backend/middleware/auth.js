module.exports.isAuthenticated = (req, res, next) => {
  if (req.session && req.session.userId) return next();
  return res.status(401).json({ error: 'Not authenticated' });
};

module.exports.isAdmin = (req, res, next) => {
  if (req.session && req.session.userRole === 'admin') return next();
  return res.status(403).json({ error: 'Admin only' });
};

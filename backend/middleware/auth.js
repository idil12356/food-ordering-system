const jwt = require('jsonwebtoken');
const auth = (req, res, next) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');
  if (!token) return res.status(401).json({ message: 'No token' });
  try { req.user = jwt.verify(token, process.env.JWT_SECRET); next(); }
  catch { res.status(401).json({ message: 'Invalid token' }); }
};
const adminAuth = (req, res, next) => {
  auth(req, res, () => {
    if (req.user.role !== 'admin') return res.status(403).json({ message: 'Admin only' });
    next();
  });
};
module.exports = { auth, adminAuth };

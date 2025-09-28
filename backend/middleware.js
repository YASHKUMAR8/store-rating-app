const jwt = require('jsonwebtoken');
require('dotenv').config();

const verifyToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; 

  if (!token) {
    return res.status(403).json({ message: 'A token is required for authentication' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; 
  } catch (err) {
    return res.status(401).json({ message: 'Invalid Token' });
  }
  
  return next(); 
};

const isAdmin = (req, res, next) => {
    if (req.user && req.user.role === 'System Administrator') {
        next();
    } else {
        res.status(403).json({ message: 'Access denied. Admins only.' });
    }
};

module.exports = { verifyToken, isAdmin };
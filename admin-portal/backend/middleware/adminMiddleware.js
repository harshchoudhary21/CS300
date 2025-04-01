const admin = require('firebase-admin');

const adminMiddleware = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');

    if (!token) {
      return res.status(401).json({ message: 'Not authorized, token missing' });
    }

    const decodedToken = await admin.auth().verifyIdToken(token);
    req.admin = decodedToken;
    next();
  } catch (error) {
    console.error('Error verifying token:', error);
    return res.status(401).json({ message: 'Not authorized, invalid token' });
  }
};

module.exports = adminMiddleware;

// Memory store for active admin sessions (tokens)
const activeSessions = new Set();

const adminAuth = (req, res, next) => {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      success: false,
      message: 'Unauthorized: Missing or invalid token format'
    });
  }

  const token = authHeader.split(' ')[1];

  if (!activeSessions.has(token)) {
    return res.status(401).json({
      success: false,
      message: 'Unauthorized: Session has expired or is invalid'
    });
  }

  // Token is valid, proceed
  next();
};

module.exports = {
  adminAuth,
  activeSessions
};

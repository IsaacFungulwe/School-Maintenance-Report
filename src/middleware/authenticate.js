const jwt = require('jsonwebtoken');

const authenticate = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'No token provided. Please log in.' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // { id, role, name, iat, exp }
    next();
  } catch (err) {
    // This will print the actual underlying error to your terminal!
    console.error("🔴 ACTUAL JWT VERIFY ERROR:", err);

    const message =
      err.name === 'TokenExpiredError'
        ? 'Session expired. Please log in again.'
        : `Invalid token. Reason: ${err.message}`; // Expose the exact message to Bruno
    return res.status(401).json({ error: message });
  }
};

module.exports = authenticate;
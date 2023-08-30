const jwt = require('jsonwebtoken');
const config = require('config');

module.exports = function (req, res, next) {
  // Get the token from the request headers
  const token = req.header('x-auth-token');

  // Check if there is no token
  if (!token) {
    return res.status(401).json({ msg: 'Authorization denied. No token provided.' });
  }

  try {
    // Verify the token
    const decoded = jwt.verify(token, config.get('JWT_SECRET'));

    // Attach the user ID from the token to the request
    req.user = decoded;

    // Proceed to the next middleware
    next();
  } catch (err) {
    res.status(401).json({ msg: 'Token is not valid.' });
  }
};

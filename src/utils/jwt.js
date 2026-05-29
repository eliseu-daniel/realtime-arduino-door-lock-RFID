const jwt = require('jsonwebtoken');

const secret = () => process.env.JWT_SECRET || 'fallback_secret';
const expiresIn = () => process.env.JWT_EXPIRES_IN || '7d';

function generateToken(payload) {
  return jwt.sign(payload, secret(), { expiresIn: expiresIn() });
}

function verifyToken(token) {
  return jwt.verify(token, secret());
}

module.exports = { generateToken, verifyToken };

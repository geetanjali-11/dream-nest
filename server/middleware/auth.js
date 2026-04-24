const jwt = require("jsonwebtoken");
const { jwtSecret } = require("../utils/config");

const requireAuth = (req, res, next) => {
  const authHeader = req.headers.authorization || "";
  const token = authHeader.startsWith("Bearer ")
    ? authHeader.slice(7)
    : null;

  if (!token) {
    return res.status(401).json({ message: "Authentication required." });
  }

  try {
    const decoded = jwt.verify(token, jwtSecret);
    req.auth = decoded;
    return next();
  } catch (error) {
    return res.status(401).json({ message: "Invalid or expired token." });
  }
};

const requireUserMatch = (req, res, next) => {
  if (req.auth?.id !== req.params.userId) {
    return res.status(403).json({ message: "You are not allowed to access this resource." });
  }

  return next();
};

module.exports = { requireAuth, requireUserMatch };

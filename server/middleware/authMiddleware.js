// c:\Users\HP ENVY\Loginhrs\server\middleware\authMiddleware.js
import jwt from "jsonwebtoken";
import User from "../models/User.js";

// Middleware to protect routes (verify token and attach user)
const protect = async (req, res, next) => {
  // ... (keep existing protect function code) ...
  let token;
  const authHeader = req.headers.authorization;

  if (authHeader && authHeader.startsWith("Bearer ")) {
    try {
      token = authHeader.split(" ")[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = await User.findById(decoded.userId).select("-password");
      if (!req.user) {
        return res
          .status(401)
          .json({ message: "Not authorized, user not found" });
      }
      if (!req.user.structureUnit) {
        console.warn(`User ${req.user.id} is missing structureUnit.`);
      }
      next();
    } catch (error) {
      console.error("Token verification failed:", error);
      if (error.name === "TokenExpiredError") {
        return res
          .status(401)
          .json({ message: "Not authorized, token expired" });
      }
      if (error.name === "JsonWebTokenError") {
        return res
          .status(401)
          .json({ message: "Not authorized, invalid token" });
      }
      return res
        .status(500)
        .json({ message: "Authentication failed due to server error" });
    }
  }

  if (!token) {
    res.status(401).json({ message: "Not authorized, no token" });
  }
};

// Middleware to check for Admin role (keep this)
const admin = (req, res, next) => {
  if (req.user && req.user.role === "System Admin") {
    next();
  } else {
    res.status(403).json({ message: "Forbidden: Not authorized as an admin" });
  }
};

// --- ADD THIS NEW MIDDLEWARE ---
// Middleware factory to check for specific roles
const checkRoles = (allowedRoles = []) => {
  return (req, res, next) => {
    // Assumes 'protect' middleware runs first and attaches req.user
    if (!req.user) {
      // Safety check in case protect failed silently or wasn't used
      return res
        .status(401)
        .json({ message: "Not authorized, user data missing for role check" });
    }
    if (allowedRoles.length > 0 && !allowedRoles.includes(req.user.role)) {
      return res
        .status(403)
        .json({ message: "Forbidden: Insufficient permissions" });
    }
    next(); // Role is allowed or no specific roles were required
  };
};
// --- END ADDITION ---

// Export all middleware functions using named exports
export { protect, admin, checkRoles }; // <<< MODIFIED LINE

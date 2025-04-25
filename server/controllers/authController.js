// server/controllers/authController.js (Example Snippet)
const User = require("../models/User");
const AuditLog = require("../models/AuditLog"); // Import the model
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

exports.loginUser = async (req, res) => {
  const { username, password } = req.body;
  const ipAddress = req.ip || req.connection.remoteAddress; // Get IP

  try {
    const user = await User.findOne({ username });

    if (!user) {
      // Log failed attempt (user not found)
      await AuditLog.create({
        eventType: "FAILED_LOGIN",
        performedBy: "System", // Or username if you want to log the attempt under that name
        ipAddress: ipAddress,
        details: { usernameAttempted: username, reason: "User not found" },
      });
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      // Log failed attempt (invalid password)
      await AuditLog.create({
        eventType: "FAILED_LOGIN",
        performedBy: "System", // Or username
        userId: user._id, // We know the user ID here
        ipAddress: ipAddress,
        details: { usernameAttempted: username, reason: "Invalid password" },
      });
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // ... successful login logic ... (generate token, etc.)
  } catch (error) {
    console.error("Login error:", error);
    // Optionally log server errors too
    res.status(500).json({ message: "Server error during login" });
  }
};

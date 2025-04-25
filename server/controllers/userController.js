// server/controllers/userController.js (Example Snippet)
const User = require("../models/User");
const AuditLog = require("../models/AuditLog"); // Import

exports.updateUserRole = async (req, res) => {
  const { userId } = req.params; // ID of user being updated
  const { newRole } = req.body;
  const adminUserId = req.user.id; // ID of admin making the change (from auth middleware)
  const adminUsername = req.user.username; // Get admin username

  try {
    const userToUpdate = await User.findById(userId);
    if (!userToUpdate) {
      return res.status(404).json({ message: "User not found" });
    }

    const oldRole = userToUpdate.role;

    // Prevent changing own role or critical roles if needed (add checks)

    if (oldRole !== newRole) {
      userToUpdate.role = newRole;
      await userToUpdate.save();

      // Log the role change
      await AuditLog.create({
        eventType: "ROLE_CHANGE",
        userId: adminUserId, // Admin who performed action
        performedBy: adminUsername, // Admin's username
        targetUserId: userId, // User whose role was changed
        details: {
          oldRole: oldRole,
          newRole: newRole,
          targetUsername: userToUpdate.username,
        },
      });

      res.json({
        message: "User role updated successfully",
        user: userToUpdate,
      });
    } else {
      res.json({ message: "No changes detected in role.", user: userToUpdate });
    }
  } catch (error) {
    console.error("Role update error:", error);
    // Log error if needed
    res.status(500).json({ message: "Server error updating role" });
  }
};

// Add similar logging for permission changes, user creation/deletion etc.

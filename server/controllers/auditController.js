// server/controllers/auditController.js
// --- MODIFIED IMPORT ---
import AuditLog from "../models/AuditLog.js"; // Use ESM import (ensure AuditLog.js uses export default)
// --- END MODIFICATION ---

// --- MODIFIED EXPORT ---
export const getAuditLogs = async (req, res) => {
  // Use 'export const' for named export
  // --- END MODIFICATION ---
  try {
    // Basic query: Get latest 50 logs. Add pagination/filtering later.
    const limit = parseInt(req.query.limit) || 50;
    const page = parseInt(req.query.page) || 1;
    const skip = (page - 1) * limit;

    const logs = await AuditLog.find()
      .sort({ timestamp: -1 }) // Sort by newest first
      .skip(skip)
      .limit(limit)
      .populate("userId", "username name") // Populate user who performed action
      .populate("targetUserId", "username name"); // Populate user affected

    const totalLogs = await AuditLog.countDocuments();

    res.json({
      logs,
      currentPage: page,
      totalPages: Math.ceil(totalLogs / limit),
      totalLogs,
    });
  } catch (error) {
    console.error("Error fetching audit logs:", error);
    res.status(500).json({ message: "Server error fetching audit logs" });
  }
};

// If you have other functions in this file, export them similarly:
// export const anotherAuditFunction = async (req, res) => { ... };

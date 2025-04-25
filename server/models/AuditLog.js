// server/models/AuditLog.js
// --- MODIFIED IMPORT ---
import mongoose from "mongoose"; // Use ESM import
// --- END MODIFICATION ---

const AuditLogSchema = new mongoose.Schema({
  timestamp: {
    type: Date,
    default: Date.now,
    index: true,
  },
  eventType: {
    type: String,
    required: true,
    enum: [
      "FAILED_LOGIN",
      "ROLE_CHANGE",
      "PERMISSION_CHANGE",
      "USER_CREATED",
      "USER_DELETED",
      "PASSWORD_RESET_REQUEST",
      "PASSWORD_RESET_SUCCESS",
    ],
    index: true,
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    default: null,
  },
  targetUserId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    default: null,
  },
  performedBy: {
    type: String,
    required: true,
  },
  ipAddress: {
    type: String,
    default: null,
  },
  details: {
    type: mongoose.Schema.Types.Mixed,
    default: null,
  },
});

// --- MODIFIED EXPORT ---
export default mongoose.model("AuditLog", AuditLogSchema); // Use ESM export default
// --- END MODIFICATION ---

// server/routes/auditRoutes.js
import express from "express"; // Keep this ESM import
import { getAuditLogs } from "../controllers/auditController.js"; // Keep this ESM import (ensure .js extension)
import { protect, admin } from "../middleware/authMiddleware.js"; // Keep this ESM import (ensure .js extension)

// REMOVE these lines:
// const express = require("express");
// const { getAuditLogs } = require("../controllers/auditController");
// const { protect, admin } = require("../middleware/authMiddleware"); // Assuming you have admin middleware

const router = express.Router(); // Keep this

// GET /api/audit/logs - Protected route, only for admins
router.get("/logs", protect, admin, getAuditLogs); // Keep this

export default router; // Keep this ESM export

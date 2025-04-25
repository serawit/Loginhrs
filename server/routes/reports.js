// server/routes/reports.js
import express from "express";
import multer from "multer";
import Joi from "joi";
import Report from "../models/Report.js";
// --- MODIFIED IMPORT ---
import { protect, checkRoles } from "../middleware/authMiddleware.js"; // Use named imports
// --- END MODIFICATION ---
import path from "path";
import fs from "fs";

// --- Multer Configuration (keep as is) ---
// ... (multer code remains the same) ...
const uploadDir = path.join(process.cwd(), "uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + "-" + file.originalname);
  },
});
const upload = multer({ storage: storage });

// --- Backend Joi Validation Schema (keep as is) ---
// ... (Joi schema remains the same) ...
const reportValidationSchema = Joi.object({
  reportType: Joi.string()
    .valid("Financial Report", "Operational Report")
    .required(),
  reportCode: Joi.string().required(),
  title: Joi.string().required(),
  reportDate: Joi.date().iso().required(),
  reportPeriodStart: Joi.date().iso().required(),
  reportPeriodEnd: Joi.date().iso().required(),
  reportingFrequency: Joi.string()
    .valid("Daily", "Weekly", "Monthly", "Quarterly", "Annually")
    .required(),
}).options({ allowUnknown: true });

const router = express.Router();

// --- POST Route (Create Report) ---
// --- MODIFIED MIDDLEWARE USAGE ---
router.post(
  "/",
  protect, // Use protect for token verification
  upload.single("uploadReport"),
  async (req, res) => {
    // ... (keep existing POST logic, req.user is now set by protect) ...
    try {
      if (!req.user || !req.user.id || !req.user.structureUnit) {
        console.error("Authentication error: User details missing.");
        if (req.file)
          fs.unlink(req.file.path, (err) => {
            if (err) console.error("Error deleting file:", err);
          });
        return res
          .status(401)
          .json({ message: "Authentication error: User details incomplete." });
      }
      const { error, value } = reportValidationSchema.validate(req.body, {
        abortEarly: false,
      });
      if (error) {
        const errorMessages = error.details.map((d) => d.message).join(", ");
        console.error("Backend Validation Error:", error.details);
        if (req.file)
          fs.unlink(req.file.path, (err) => {
            if (err) console.error("Error deleting file:", err);
          });
        return res
          .status(400)
          .json({ message: `Validation failed: ${errorMessages}` });
      }
      const newReport = new Report({
        ...value,
        structureUnit: req.user.structureUnit,
        submittedBy: req.user.id,
        uploadReport: req.file ? req.file.filename : null,
      });
      await newReport.save();
      res
        .status(201)
        .json({ message: "Report submitted successfully", report: newReport });
    } catch (error) {
      console.error("Error creating report:", error);
      if (req.file)
        fs.unlink(req.file.path, (err) => {
          if (err) console.error("Error deleting file:", err);
        });
      if (error.name === "ValidationError") {
        return res
          .status(400)
          .json({ message: "Data validation failed", error: error.message });
      }
      res
        .status(500)
        .json({ message: "Error submitting report", error: error.message });
    }
  }
);
// --- END MODIFICATION ---

// --- GET Route (Fetch Reports) ---
// --- MODIFIED MIDDLEWARE USAGE ---
router.get(
  "/",
  protect, // Use protect for token verification
  async (req, res) => {
    // ... (keep existing GET logic, req.user is set by protect) ...
    try {
      const query = {};
      const reports = await Report.find(query)
        .populate("submittedBy", "name email structureUnit")
        .sort({ createdAt: -1 });
      res.json(reports);
    } catch (error) {
      console.error("Error fetching reports:", error);
      res.status(500).json({ message: "Error fetching reports" });
    }
  }
);
// --- END MODIFICATION ---

// --- PUT Route (Update Status) ---
// --- MODIFIED MIDDLEWARE USAGE ---
router.put(
  "/:id/status",
  protect, // First, verify token
  checkRoles(["Head Office Expert", "District Manager", "System Admin"]), // Then, check roles
  async (req, res) => {
    // ... (keep existing PUT logic, req.user is set by protect) ...
    try {
      const { status } = req.body;
      const allowedStatuses = ["Approved", "Rejected", "Pending"];
      if (!status || !allowedStatuses.includes(status)) {
        return res.status(400).json({ message: "Invalid status provided." });
      }
      const report = await Report.findByIdAndUpdate(
        req.params.id,
        { status },
        { new: true }
      ).populate("submittedBy", "name email structureUnit");
      if (!report) {
        return res.status(404).json({ message: "Report not found." });
      }
      res.json({ message: `Report status updated to ${status}`, report });
    } catch (error) {
      console.error("Error updating report status:", error);
      res
        .status(500)
        .json({
          message: "Error updating report status",
          error: error.message,
        });
    }
  }
);
// --- END MODIFICATION ---

// --- GET Route (Download File) ---
// --- MODIFIED MIDDLEWARE USAGE ---
router.get(
  "/download/:filename",
  protect, // Use protect for token verification
  (req, res) => {
    // ... (keep existing download logic, req.user is set by protect if needed) ...
    try {
      const filename = req.params.filename;
      const safeFilename = path.basename(filename);
      if (safeFilename !== filename) {
        return res.status(400).json({ message: "Invalid filename." });
      }
      const filePath = path.join(uploadDir, safeFilename);
      if (fs.existsSync(filePath)) {
        res.download(filePath, safeFilename, (err) => {
          if (err) {
            if (!res.headersSent) {
              console.error("Error downloading file:", err);
              return res
                .status(500)
                .json({ message: "Could not download the file." });
            } else {
              console.warn("Error after starting file download:", err.message);
            }
          }
        });
      } else {
        return res.status(404).json({ message: "File not found." });
      }
    } catch (error) {
      console.error("Error in file download route:", error);
      if (!res.headersSent) {
        return res
          .status(500)
          .json({ message: "Server error during file download." });
      }
    }
  }
);
// --- END MODIFICATION ---

export default router;

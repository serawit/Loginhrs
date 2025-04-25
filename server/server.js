import dotenv from "dotenv";
dotenv.config(); // Load environment variables from .env (MUST BE AT THE TOP)
import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import reportRoutes from "./routes/reports.js";
import authRouter from "./routes/auth.js";
import departmentRouter from "./routes/departments.js";
import path from "path";
import { fileURLToPath } from "url";
import userRouter from "./routes/users.js"; // Ensure this is imported to avoid errors in the routes
import auditRoutes from "./routes/auditRoutes.js"; // Verify this path is correct

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Connect to MongoDB
mongoose
  .connect(process.env.MONGODB_URI) // Now this should work
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.error("Error connecting to MongoDB:", err));

// Routes
app.use("/api/reports", reportRoutes);
app.use("/api/auth", authRouter);
app.use("/api/departments", departmentRouter);
app.use("/api/users", userRouter); // Ensure this is included to handle user management routes
// Make sure the path '/api/audit' is correct
app.use("/api/audit", auditRoutes);

// Serve static files from the 'uploads' directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Error handling middleware
app.use((err, req, res, next) => {
  console.error("Error:", err);
  res.status(500).json({ message: "Server error", error: err.message });
});

// Start the server
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

export default app;

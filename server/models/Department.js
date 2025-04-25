import express from "express";
import User from "./User.js"; // Import the User model
import Department from "./Department.js"; // Import the Department model
// --- MODIFIED IMPORT ---
import { protect, checkRoles } from "../middleware/authMiddleware.js"; // Use named imports
// --- END MODIFICATION ---

const router = express.Router();

// --- MODIFIED MIDDLEWARE USAGE ---
router.post(
  "/",
  protect, // Use protect for token verification
  checkRoles(["Head Office Expert"]), // Use checkRoles for role check
  async (req, res) => {
    // --- END MODIFICATION ---
    try {
      const { name, manager } = req.body;

      // Check if the manager exists and has the correct role
      const managerExists = await User.findById(manager);
      // Adjusted role check based on previous context (allow District Manager or System Admin)
      if (
        !managerExists ||
        !["District Manager", "System Admin"].includes(managerExists.role)
      ) {
        // Use json response for consistency
        return res.status(400).json({ message: "Invalid manager specified" });
      }

      const department = new Department({ name, manager });
      await department.save();

      // Use json response for consistency
      res.status(201).json({ message: "Department created successfully" });
    } catch (err) {
      console.error("Error creating department:", err); // Log error
      // Use json response for consistency
      res.status(500).json({ message: "Error creating department" });
    }
  }
);

// --- MODIFIED MIDDLEWARE USAGE ---
router.put(
  "/:id/employees",
  protect, // Use protect for token verification
  checkRoles(["Head Office Expert"]), // Use checkRoles for role check
  async (req, res) => {
    // --- END MODIFICATION ---
    try {
      const { employees } = req.body; // Array of employee IDs
      const department = await Department.findById(req.params.id);
      // Use json response for consistency
      if (!department)
        return res.status(404).json({ message: "Department not found" });

      // Optional: Add validation to ensure employee IDs exist and have appropriate roles
      department.employees = employees;
      await department.save();

      // Use json response for consistency
      res.json({ message: "Employees assigned to department successfully" });
    } catch (err) {
      console.error("Error assigning employees:", err); // Log error
      // Use json response for consistency
      res.status(500).json({ message: "Error assigning employees" });
    }
  }
);

// Get all departments (No auth needed? If needed, add 'protect')
router.get("/", async (req, res) => {
  // If auth is needed: router.get("/", protect, async (req, res) => { ... });
  try {
    const departments = await Department.find()
      .populate("manager", "name email") // Populate manager details
      .populate("employees", "name email"); // Populate employee details
    res.json(departments);
  } catch (error) {
    console.error("Error fetching departments:", error);
    res.status(500).json({ message: "Error fetching departments" });
  }
});

export default router; // Use export default

import express from "express";
import Joi from "joi";
import User from "../models/User.js";
// --- MODIFIED IMPORT ---
import { protect, admin } from "../middleware/authMiddleware.js"; // Use named imports (protect and admin)
// --- END MODIFICATION ---

const router = express.Router();

// Define validation schema for user data (keep as is)
const userValidationSchema = Joi.object({
  name: Joi.string().required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(6).optional(), // Password is optional for editing
  phone: Joi.string().required(),
  role: Joi.string()
    .valid(
      "System Admin",
      "Head Office Expert",
      "District Manager",
      "District Expert",
      "Operation Manager",
      "Customer Relation Manager"
    )
    .required(), // Removed default here as it's handled in frontend/creation logic
  jobPosition: Joi.string().required(),
  structureUnit: Joi.string().required(),
});

// Get all users (System Admin only)
// --- MODIFIED MIDDLEWARE USAGE ---
router.get("/", protect, admin, async (req, res) => {
  // --- END MODIFICATION ---
  try {
    // Exclude passwords from the result
    const users = await User.find().select("-password");
    res.json(users);
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({ message: "Server error fetching users" }); // More specific message
  }
});

// Create a new user (System Admin only)
// --- MODIFIED MIDDLEWARE USAGE ---
router.post("/", protect, admin, async (req, res) => {
  // --- END MODIFICATION ---
  try {
    // Validate the request body
    const { error, value } = userValidationSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ message: error.details[0].message });
    }

    const { name, email, password, phone, role, jobPosition, structureUnit } =
      value;

    // Check if the email already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "Email already exists" });
    }
    // Check if the phone number already exists
    const existingPhone = await User.findOne({ phone });
    if (existingPhone) {
      return res.status(400).json({ message: "Phone number already exists" });
    }

    // Create a new user
    const newUser = new User({
      name,
      email,
      password, // The password will be hashed by the pre('save') middleware
      phone,
      role,
      jobPosition,
      structureUnit,
    });

    // Save the new user to the database
    await newUser.save();

    // Respond without sending back sensitive info like password hash
    res
      .status(201)
      .json({ message: "User created successfully", userId: newUser._id });
  } catch (error) {
    console.error("Error creating user:", error);
    // Handle potential duplicate key errors from DB if validation missed something
    if (error.code === 11000) {
      return res
        .status(400)
        .json({ message: "Email or phone number already exists." });
    }
    res.status(500).json({ message: "Server error creating user" }); // More specific message
  }
});

// Update a user (System Admin only)
// --- MODIFIED MIDDLEWARE USAGE ---
router.put("/:id", protect, admin, async (req, res) => {
  // --- END MODIFICATION ---
  try {
    // Validate the request body (allow password to be missing)
    const { error, value } = userValidationSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ message: error.details[0].message });
    }

    const { name, email, password, phone, role, jobPosition, structureUnit } =
      value;

    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Check for email/phone conflicts if they are being changed
    if (email !== user.email) {
      const existingEmail = await User.findOne({ email: email });
      if (existingEmail && existingEmail._id.toString() !== req.params.id) {
        return res
          .status(400)
          .json({ message: "Email already in use by another user." });
      }
    }
    if (phone !== user.phone) {
      const existingPhone = await User.findOne({ phone: phone });
      if (existingPhone && existingPhone._id.toString() !== req.params.id) {
        return res
          .status(400)
          .json({ message: "Phone number already in use by another user." });
      }
    }

    // Update the user's fields
    user.name = name;
    user.email = email;
    user.phone = phone;
    user.role = role;
    user.jobPosition = jobPosition;
    user.structureUnit = structureUnit;
    // Only update password if a new one was provided
    if (password) {
      user.password = password; // Hashing is handled by pre-save hook
    }

    await user.save();

    // Respond without sending back sensitive info
    res.json({ message: "User updated successfully", userId: user._id });
  } catch (error) {
    console.error("Error updating user:", error);
    if (error.code === 11000) {
      return res
        .status(400)
        .json({ message: "Email or phone number already exists." });
    }
    res.status(500).json({ message: "Server error updating user" }); // More specific message
  }
});

// Delete a user (System Admin only)
// --- MODIFIED MIDDLEWARE USAGE ---
router.delete("/:id", protect, admin, async (req, res) => {
  // --- END MODIFICATION ---
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    // Optionally: Log user deletion in AuditLog here
    // await AuditLog.create({ eventType: 'USER_DELETED', ... });
    res.json({ message: "User deleted successfully", userId: req.params.id });
  } catch (error) {
    console.error("Error deleting user:", error);
    res.status(500).json({ message: "Server error deleting user" }); // More specific message
  }
});

export default router;

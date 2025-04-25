import express from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import Joi from "joi";
import User from "../models/User.js";

const router = express.Router();

// Define validation schema for register
const registerValidationSchema = Joi.object({
  name: Joi.string().required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
  phone: Joi.string().required(),
  structureUnit: Joi.string().required(),
  role: Joi.string()
    .valid(
      "System Admin",
      "Head Office Expert",
      "District Manager",
      "District Expert",
      "Operation Manager",
      "Customer Relation Manager"
    )
    .default("District Expert"),
  jobPosition: Joi.string().required(), // Added job position
});

// Define validation schema for login
const loginValidationSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required(),
});

router.post("/register", async (req, res) => {
  try {
    // Validate the request body
    const { error, value } = registerValidationSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ message: error.details[0].message });
    }

    const { name, email, password, role, structureUnit, phone, jobPosition } =
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
      role,
      structureUnit,
      phone,
      jobPosition, // Added job position
    });

    // Save the new user to the database
    await newUser.save();

    // Generate a JWT
    const token = jwt.sign(
      {
        userId: newUser._id,
        role: newUser.role,
        name: newUser.name,
        email: newUser.email,
      },
      process.env.JWT_SECRET
    );

    // Send the token and the user data back to the client
    res.status(201).json({
      token,
      user: {
        role: newUser.role,
        userId: newUser._id,
        name: newUser.name,
        email: newUser.email,
        jobPosition: newUser.jobPosition, // Added job position
      },
    });
  } catch (error) {
    console.error("Error registering user:", error);
    if (error.name === "ValidationError") {
      return res.status(400).json({ message: error.message });
    }
    res.status(500).json({ message: "Server error" });
  }
});

router.post("/login", async (req, res) => {
  try {
    // Validate the request body
    const { error, value } = loginValidationSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ message: error.details[0].message });
    }
    const { email, password } = value;

    // Find the user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    // Compare the password
    const validPassword = await user.comparePassword(password);
    if (!validPassword) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    // Generate a JWT
    const token = jwt.sign(
      { userId: user._id, role: user.role, name: user.name, email: user.email },
      process.env.JWT_SECRET
    );

    // Send the token and the user data back to the client
    res.json({
      token,
      user: {
        role: user.role,
        userId: user._id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (error) {
    console.error("Error logging in user:", error);
    res.status(500).json({ message: "Server error" });
  }
});

export default router;

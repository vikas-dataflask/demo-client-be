// src/controllers/authController.js
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/userModel.js";

const signup = async (req, res) => {
  try {
    // Destructure new fields along with existing ones
    const {
      firstName,
      lastName,
      email,
      username,
      contactNumber,
      password,
      confirmPassword,
    } = req.body;

    // --- Server-side validation for confirmPassword ---
    if (password !== confirmPassword) {
      return res.status(400).json({ message: "Passwords do not match." });
    }

    // --- Optional: Add more comprehensive validation here for other fields ---
    // Example: Check if email or username already exists before hashing password
    const existingUser = await User.findOne({ $or: [{ email }, { username }] });
    if (existingUser) {
      return res
        .status(409)
        .json({ message: "User with that email or username already exists." });
    }

    const hashPassword = await bcrypt.hash(password, 10);
    const newUser = new User({
      firstName, // Save firstName
      lastName, // Save lastName
      email,
      username,
      contactNumber, // Save contactNumber (will be null if not provided and schema allows)
      password: hashPassword,
    });
    await newUser.save();

    res
      .status(201)
      .json({ message: `${email} ${username} successfully registered` });
  } catch (error) {
    console.error("Signup error:", error); // Log the actual error for debugging
    res
      .status(500)
      .json({ message: error.message || "An error occurred during signup." });
  }
};

const login = async (req, res) => {
  try {
    const { identifier, password } = req.body;

    const user = await User.findOne({
      $or: [{ email: identifier }, { username: identifier }],
    });

    if (!user) {
      return res.status(400).json({ message: `User ${identifier} not found` });
    }

    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return res.status(400).json({ message: "Incorrect password" });
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "1d",
    });

    res.status(200).json({
      message: "Login successful",
      token,
      email: user.email,
      username: user.username,
      user_id: user._id,
      profilePicUrl: user.profilePicUrl,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export { signup, login };

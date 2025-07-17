import express from "express";
import verifyToken from "../middlewares/authMiddleware.js";
import {
  changePassword,
  deleteProfilePic,
  getProfile,
  updateProfile,
  uploadProfilePic,
} from "../controllers/userController.js";
import upload from "../utils/upload.js"; // Your Multer setup for file uploads

const router = express.Router();

// Route to get user profile details
router.get("/profile", verifyToken, getProfile);

// Route to update user profile details
router.put("/profile", verifyToken, updateProfile);

// Route for profile picture upload
router.post(
  "/upload-profile-pic",
  verifyToken,
  upload.single("profilePic"), // Multer middleware to handle file
  uploadProfilePic
);

// Route to delete profile picture
router.delete("/delete-profile-pic", verifyToken, deleteProfilePic);

// Route for changing user password
router.put("/change-password", verifyToken, changePassword);

export default router;

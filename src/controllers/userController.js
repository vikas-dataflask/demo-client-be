import User from "../models/userModel.js";
import bcrypt from "bcryptjs";
import path from "path";
import fs from "fs"; // Ensure fs is imported
import mongoose from "mongoose"; // Keeping this import for consistency, though not strictly required for current findById usage

// @desc    Get user profile
// @route   GET /api/user/profile
// @access  Private
const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({
      _id: user._id,
      email: user.email,
      username: user.username,
      firstName: user.firstName,
      lastName: user.lastName,
      contactNumber: user.contactNumber,
      profilePicUrl: user.profilePicUrl,
    });
  } catch (error) {
    console.error("Error fetching profile:", error);
    res.status(500).json({ message: "Server error fetching profile" });
  }
};

// @desc    Update user profile
// @route   PUT /api/user/profile
// @access  Private
const updateProfile = async (req, res) => {
  // Use req.user.id to ensure a user can only update their own profile
  const userId = req.user.id;
  const { firstName, lastName, contactNumber, email, username } = req.body;

  try {
    // Find the current user to check for uniqueness against other users
    const currentUser = await User.findById(userId);
    if (!currentUser) {
      return res.status(404).json({ message: "User not found." });
    }

    // Check for unique email and username (only against *other* users)
    if (email && email !== currentUser.email) {
      const emailExists = await User.findOne({ email });
      if (emailExists) {
        return res
          .status(409)
          .json({
            message: "This email is already in use by another account.",
          });
      }
    }

    if (username && username !== currentUser.username) {
      const usernameExists = await User.findOne({ username });
      if (usernameExists) {
        return res
          .status(409)
          .json({
            message: "This username is already taken by another account.",
          });
      }
    }

    // Update the user's fields
    currentUser.firstName = firstName || currentUser.firstName;
    currentUser.lastName = lastName || currentUser.lastName;
    currentUser.contactNumber = contactNumber || currentUser.contactNumber;
    currentUser.email = email || currentUser.email;
    currentUser.username = username || currentUser.username;

    const updatedUser = await currentUser.save();

    // Return the updated user object
    res.status(200).json({
      message: "Profile updated successfully!",
      data: {
        _id: updatedUser._id,
        email: updatedUser.email,
        username: updatedUser.username,
        firstName: updatedUser.firstName,
        lastName: updatedUser.lastName,
        contactNumber: updatedUser.contactNumber,
        profilePicUrl: updatedUser.profilePicUrl,
      },
    });
  } catch (error) {
    console.error("Error updating profile:", error);
    res.status(500).json({ message: "Server error updating profile." });
  }
};

// @desc    Upload profile picture
// @route   POST /api/user/upload-profile-pic
// @access  Private
const uploadProfilePic = async (req, res) => {
  try {
    const user = await User.findById(req.user.id); // Use req.user.id

    if (!user) {
      // If user is not found, delete the newly uploaded file to prevent orphans
      if (req.file) {
        fs.unlinkSync(req.file.path); // req.file.path is the temporary path where multer saved it
      }
      return res.status(404).json({ message: "User not found." });
    }

    // Delete old profile picture if it exists
    if (user.profilePicUrl) {
      // Logic to get filename from URL like /uploads/filename.ext or /public/uploads/filename.ext
      const fileNameInUploads = user.profilePicUrl.startsWith("/uploads/")
        ? user.profilePicUrl.replace("/uploads/", "")
        : user.profilePicUrl.replace("/public/uploads/", "");

      const fullOldPath = path.resolve(
        process.cwd(),
        "uploads",
        fileNameInUploads
      ); // Assuming 'uploads' is parallel to 'src'

      if (fs.existsSync(fullOldPath)) {
        fs.unlinkSync(fullOldPath);
      }
    }

    // Update user with new profile picture URL
    if (req.file) {
      // Store the URL that matches your static serve path (e.g., /uploads/filename.ext)
      user.profilePicUrl = `/uploads/${req.file.filename}`;
    } else {
      // Handle case where no file was uploaded, if applicable (e.g., set to null or return error)
      return res.status(400).json({ message: "No file uploaded." });
    }

    await user.save();

    res.status(200).json({
      message: "Profile picture updated successfully!",
      data: {
        _id: user._id,
        email: user.email,
        username: user.username,
        firstName: user.firstName,
        lastName: user.lastName,
        contactNumber: user.contactNumber,
        profilePicUrl: user.profilePicUrl,
      },
    });
  } catch (error) {
    console.error("Error uploading profile picture:", error);
    // If an error occurs, try to clean up the newly uploaded file too
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    res
      .status(500)
      .json({ message: "Server error during profile picture upload." });
  }
};

// @desc    Delete profile picture
// @route   DELETE /api/user/delete-profile-pic
// @access  Private
const deleteProfilePic = async (req, res) => {
  try {
    const userIdFromToken = req.user.id;
    const user = await User.findById(userIdFromToken);

    if (!user) {
      return res
        .status(404)
        .json({ message: "User not found or ID mismatch." });
    }

    const oldPicPath = user.profilePicUrl;
    if (oldPicPath) {
      // Logic to get filename from URL like /uploads/filename.ext or /public/uploads/filename.ext
      const fileNameInUploads = oldPicPath.startsWith("/uploads/")
        ? oldPicPath.replace("/uploads/", "")
        : oldPicPath.replace("/public/uploads/", "");

      const fullOldPath = path.resolve(
        process.cwd(),
        "uploads",
        fileNameInUploads
      ); // Assuming 'uploads' is parallel to 'src'

      if (fs.existsSync(fullOldPath)) {
        fs.unlinkSync(fullOldPath);
      }
    }

    user.profilePicUrl = null; // Set to null in the database
    await user.save();

    res.status(200).json({
      message: "Profile picture removed successfully!",
      data: {
        _id: user._id,
        email: user.email,
        username: user.username,
        firstName: user.firstName,
        lastName: user.lastName,
        contactNumber: user.contactNumber,
        profilePicUrl: user.profilePicUrl, // Will be null
      },
    });
  } catch (error) {
    console.error("Error in deleteProfilePic controller:", error);
    if (error.name === "CastError" && error.kind === "ObjectId") {
      res.status(400).json({ message: "Invalid user ID format in token." });
    } else {
      res
        .status(500)
        .json({ message: "Server error during profile picture deletion." });
    }
  }
};

// @desc    Change user password
// @route   PUT /api/user/change-password
// @access  Private
const changePassword = async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  if (!currentPassword || !newPassword) {
    return res
      .status(400)
      .json({ message: "Please provide current and new passwords." });
  }

  try {
    const user = await User.findById(req.user.id); // Use req.user.id

    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    // Check if current password matches
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid current password." });
    }

    // Hash the new password
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);

    await user.save();

    res.status(200).json({ message: "Password updated successfully!" });
  } catch (error) {
    console.error("Error changing password:", error);
    res.status(500).json({ message: "Server error during password change." });
  }
};

export {
  getProfile,
  updateProfile,
  uploadProfilePic,
  deleteProfilePic,
  changePassword,
};

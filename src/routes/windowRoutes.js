import express from "express";
import {
  createWindow,
  getWindowsByRoom,
  getWindowsByWall,
  getWindowById,
  updateWindow,
  deleteWindow
} from "../controllers/windowController.js";

const router = express.Router();

// Create a new window
router.post("/", createWindow);

// Get windows for a specific room
router.get("/room/:roomId", getWindowsByRoom);

// Get windows for a specific wall
router.get("/wall/:wallId", getWindowsByWall);

// Get a specific window by ID
router.get("/:id", getWindowById);

// Update window properties
router.put("/:id", updateWindow);

// Delete window
router.delete("/:id", deleteWindow);

export default router; 
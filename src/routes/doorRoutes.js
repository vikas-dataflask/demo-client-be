import express from "express";
import {
  createDoor,
  getDoorsByRoom,
  getDoorsByWall,
  getDoorById,
  updateDoor,
  deleteDoor
} from "../controllers/doorController.js";

const router = express.Router();

// Create a new door
router.post("/", createDoor);

// Get doors for a specific room
router.get("/room/:roomId", getDoorsByRoom);

// Get doors for a specific wall
router.get("/wall/:wallId", getDoorsByWall);

// Get a specific door by ID
router.get("/:id", getDoorById);

// Update door properties
router.put("/:id", updateDoor);

// Delete door
router.delete("/:id", deleteDoor);

export default router; 
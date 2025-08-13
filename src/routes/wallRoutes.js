import express from "express";
import {
  createWall,
  getWallsByRoom,
  getWallsByFloor,
  updateWall,
  deleteWall,
  processRoomWalls,
  getWallStats
} from "../controllers/wallController.js";

const router = express.Router();

// Create a new wall
router.post("/", createWall);

// Get walls for a specific room
router.get("/room/:roomId", getWallsByRoom);

// Get all walls for a floor
router.get("/floor/:projectId/:floorId", getWallsByFloor);

// Get wall statistics for a floor
router.get("/stats/:projectId/:floorId", getWallStats);

// Process room walls (extract walls from room geometry)
router.post("/process-room", processRoomWalls);

// Update wall properties
router.put("/:id", updateWall);

// Delete wall
router.delete("/:id", deleteWall);

export default router; 
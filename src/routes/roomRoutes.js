import express from "express";
import {
  createRoom,
  getRoomsByFloor,
  getRoomById,
  updateRoom,
  deleteRoom,
  addWallToRoom,
  addDoorToRoom,
  addWindowToRoom,
  updateWallInRoom,
  updateDoorInRoom,
  updateWindowInRoom,
  removeWallFromRoom,
  removeDoorFromRoom,
  removeWindowFromRoom,
  markWallAsShared,
  getRoomsWithSharedWalls,
  generateWallsFromGeometry
} from "../controllers/roomController.js";

const router = express.Router();

// Room CRUD operations
router.post("/", createRoom); // Create new room
router.get("/", getRoomsByFloor); // Get all rooms for a floor (query: floorId)
router.get("/:roomId", getRoomById); // Get specific room
router.patch("/:roomId", updateRoom); // Update room properties
router.delete("/:roomId", deleteRoom); // Delete room

// Wall operations
router.post("/:roomId/walls", addWallToRoom); // Add wall to room
router.patch("/:roomId/walls/:wallId", updateWallInRoom); // Update wall in room
router.delete("/:roomId/walls/:wallId", removeWallFromRoom); // Remove wall from room
router.patch("/:roomId/walls/:wallId/share", markWallAsShared); // Mark wall as shared

// Door operations
router.post("/:roomId/doors", addDoorToRoom); // Add door to room
router.patch("/:roomId/doors/:doorId", updateDoorInRoom); // Update door in room
router.delete("/:roomId/doors/:doorId", removeDoorFromRoom); // Remove door from room

// Window operations
router.post("/:roomId/windows", addWindowToRoom); // Add window to room
router.patch("/:roomId/windows/:windowId", updateWindowInRoom); // Update window in room
router.delete("/:roomId/windows/:windowId", removeWindowFromRoom); // Remove window from room

// Utility operations
router.get("/floor/:floorId/shared-walls", getRoomsWithSharedWalls); // Get rooms with shared walls
router.post("/:roomId/generate-walls", generateWallsFromGeometry); // Generate walls from geometry

export default router; 
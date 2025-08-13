import express from "express";
import verifyToken from "../middlewares/authMiddleware.js";
import {
  createFloor,
  getFloorsByProject,
  getFloorById,
  updateFloor,
  deleteFloor
} from "../controllers/floorController.js";

const router = express.Router();

// Apply authentication middleware to all routes
// router.use(verifyToken);

// Floor CRUD operations
router.post("/", createFloor); // Create new floor
router.get("/", getFloorsByProject); // Get all floors for a project (query: projectId)
router.get("/:floorId", getFloorById); // Get specific floor
router.patch("/:floorId", updateFloor); // Update floor
router.delete("/:floorId", deleteFloor); // Delete floor

export default router; 
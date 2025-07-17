import express from "express";
import verifyToken from "../middlewares/authMiddleware.js";
import {
  saveAhuPressureDropData,
  getAhuPressureDropData,
  updateAhuPressureDropData,
} from "../controllers/ahuPressureDropController.js";

const router = express.Router();

// Save AHU pressure drop data
router.post("/save", verifyToken, saveAhuPressureDropData);

// Get AHU pressure drop data by project_id and room (for autofill)
router.get("/:project_id/:room", verifyToken, getAhuPressureDropData);

// Update AHU pressure drop data
router.put("/:project_id/:room", verifyToken, updateAhuPressureDropData);

export default router; 
import express from "express";
import verifyToken from "../middlewares/authMiddleware.js";
import {
  saveAhuPressureDropData,
  getAhuPressureDropData,
  updateAhuPressureDropData,
  calculateTotalSystemPressureDrop,
} from "../controllers/ahuPressureDropController.js";

const router = express.Router();

// Save AHU pressure drop data
router.post("/save", verifyToken, saveAhuPressureDropData);

// Get AHU pressure drop data by project_id (for autofill)
router.get("/:project_id", verifyToken, getAhuPressureDropData);

// Update AHU pressure drop data
router.put("/:project_id", verifyToken, updateAhuPressureDropData);

// Calculate total system pressure drop for multiple equipment
router.post("/calculate-total-system", verifyToken, calculateTotalSystemPressureDrop);

export default router; 
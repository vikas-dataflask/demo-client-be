import express from "express";
import verifyToken from "../middlewares/authMiddleware.js";
import {
  saveChillerPressureDropData,
  getChillerPressureDropData,
  updateChillerPressureDropData,
} from "../controllers/chillerPressureDropController.js";

const router = express.Router();

// Save chiller pressure drop data
router.post("/save", verifyToken, saveChillerPressureDropData);

// Get chiller pressure drop data by project_id and room (for autofill)
router.get("/:project_id/:room", verifyToken, getChillerPressureDropData);

// Update chiller pressure drop data
router.put("/:project_id/:room", verifyToken, updateChillerPressureDropData);

export default router; 
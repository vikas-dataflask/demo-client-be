import express from "express";
import verifyToken from "../middlewares/authMiddleware.js";
import {
  saveVentilationData,
  getVentilationData,
  updateVentilationData,
} from "../controllers/ventilationController.js";

const router = express.Router();

// Save ventilation data
router.post("/save", verifyToken, saveVentilationData);

// Get ventilation data by project_id and room (for autofill)
router.get("/:project_id/:room", verifyToken, getVentilationData);

// Update ventilation data
router.put("/:project_id/:room", verifyToken, updateVentilationData);

export default router; 
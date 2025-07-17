import express from "express";
import verifyToken from "../middlewares/authMiddleware.js";
import {
  saveDuctSizingData,
  getDuctSizingData,
  updateDuctSizingData,
} from "../controllers/ductSizingController.js";

const router = express.Router();

// Save duct sizing data
router.post("/save", verifyToken, saveDuctSizingData);

// Get duct sizing data by project_id and room (for autofill)
router.get("/:project_id/:room", verifyToken, getDuctSizingData);

// Update duct sizing data
router.put("/:project_id/:room", verifyToken, updateDuctSizingData);

export default router; 
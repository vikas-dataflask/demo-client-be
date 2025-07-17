import express from "express";
import verifyToken from "../middlewares/authMiddleware.js";
import {
  saveCondenserData,
  getCondenserData,
  updateCondenserData,
} from "../controllers/condenserController.js";

const router = express.Router();

// Save condenser calculation data
router.post("/save", verifyToken, saveCondenserData);

// Get condenser calculation data by project_id (for autofill)
router.get("/:project_id", verifyToken, getCondenserData);

// Update condenser calculation data
router.put("/:project_id", verifyToken, updateCondenserData);

export default router;

import express from "express";
import {
  saveWaterSupplyPipeData,
  getWaterSupplyPipeData,
} from "../controllers/waterSupplyPipeController.js";

const router = express.Router();

// POST - Save Calculation Data
router.post("/", saveWaterSupplyPipeData);

// GET - Get previous calculations by project_id
router.get("/:project_id", getWaterSupplyPipeData);

export default router;

import express from "express";
import {
  storeHeatLoad,
  getHeatLoadByProjectAndRoom,
  updateHeatLoad,
} from "../controllers/heatLoadController.js";

const router = express.Router();

router.post("/store", storeHeatLoad); // Save calculation
router.get("/autofill", getHeatLoadByProjectAndRoom); // Autofill for same room/project
router.put("/update", updateHeatLoad); // Update existing calculation

export default router;

import express from "express";
import {
  getAllBuildingStandardsController,
  saveOrUpdateWaterDemandController,
  getWaterDemandByProjectController,
  calculateAllSelectedBuildingsController,
} from "../controllers/waterDemandControllerV2.js";

const router = express.Router();

// ✅ Get All Building Types (Standard)
router.get("/standards", getAllBuildingStandardsController);

// ✅ Save or Update Water Demand (Calculation + Save)
router.post("/save-or-update", saveOrUpdateWaterDemandController);

// ✅ Get Saved Water Demand (Autofill by projectId & buildingType)
router.get("/get", getWaterDemandByProjectController);

// ✅ Calculate Multiple Buildings (No DB save)
router.post("/calculate-multiple", calculateAllSelectedBuildingsController);

export default router;

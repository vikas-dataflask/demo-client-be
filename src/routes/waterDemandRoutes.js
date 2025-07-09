import express from "express";
import {
  getBuildingTypesController,
  calculateWaterDemandController,
  calculateMultipleBuildingsController,
  validateBuildingTypeController,
} from "../controllers/waterDemandController.js";

const router = express.Router();

// Get available building types
router.get("/building-types", getBuildingTypesController);

// Calculate water demand for single building
router.post("/calculate", calculateWaterDemandController);

// Calculate water demand for multiple buildings
router.post("/calculate-multiple", calculateMultipleBuildingsController);

// Validate building type
router.get("/validate/:buildingType", validateBuildingTypeController);

export default router;

import express from "express";

import verifyToken from "../middlewares/authMiddleware.js";
import {
  calculateFireHeadLossHandler,
  calculateFirePumpHandler,
} from "../controllers/calculations/firefightController.js";
import {
  calculateAHUHandler,
  calculateChillerHandler,
  calculateCondenserHandler,
  calculateHeatLoadHandler,
  calculateVentilationHandler,
} from "../controllers/calculations/hvacController.js";
import {
  calculateDrainagePipesHandler,
  calculatePlumbingHeadlossHandler,
  calculatePlumbingPumpHandler,
  calculateRainwaterDropSizingHandler,
  calculateRWHSizingHandler,
  calculateWaterDemandHandler,
  calculateWaterSupplyPipesHandler,
} from "../controllers/calculations/plumbingController.js";
import { calculateRWHVolumeHandler } from "../controllers/calculations/rwhController.js";

const router = express.Router();

//Fire Fight
router.post("/fireheadloss", verifyToken, calculateFireHeadLossHandler);
router.post("/firepump", verifyToken, calculateFirePumpHandler);

//HVAC
router.post("/heatload", verifyToken, calculateHeatLoadHandler);
router.post("/ventilation", verifyToken, calculateVentilationHandler);
router.post("/ahu", verifyToken, calculateAHUHandler); // New AHU route
router.post("/chiller", verifyToken, calculateChillerHandler); // Added for Chiller
router.post("/condenser/calculate", verifyToken, calculateCondenserHandler); // New: Add Condenser calculation route
//Plumbing
router.post("/waterdemand", verifyToken, calculateWaterDemandHandler);
router.post("/watersupplypipes", verifyToken, calculateWaterSupplyPipesHandler);
router.post("/drainagepipes", verifyToken, calculateDrainagePipesHandler);
router.post("/plumbingheadloss", verifyToken, calculatePlumbingHeadlossHandler);
router.post("/plumbingpump", verifyToken, calculatePlumbingPumpHandler);
router.post("/rwhsizing", verifyToken, calculateRWHSizingHandler);
router.post(
  "/rainwaterdropsizing",
  verifyToken,
  calculateRainwaterDropSizingHandler
);
router.post("/rwh/calculate", calculateRWHVolumeHandler);

export default router;

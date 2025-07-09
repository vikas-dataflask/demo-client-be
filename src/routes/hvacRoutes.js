import express from "express";
const router = express.Router();
import verifyToken from "../middlewares/authMiddleware.js";
import {
  // calculateHeatLoadController,
  // getTestCasesController,
  // validateHeatLoadInputController,
  calculateChillerPressureDropController,
  getFluidPropertiesController,
  getFluidTypesController,
} from "../controllers/hvacController.js";
import {
  calculateGrilleSizeHandler,
  getGrilleTestCasesHandler,
} from "../controllers/grilleController.js";
import {
  calculateFittingLossesHandler,
  calculateTotalAHUPressureDropHandler,
  getStandardFittingsHandler,
  getFittingTestCasesHandler,
} from "../controllers/fittingLossController.js";

/**
 * @route   POST /api/hvac/heat-load
 * @desc    Calculate heat load for HVAC system design
 * @access  Public
 */
// router.post("/heat-load", calculateHeatLoadController);

/**
 * @route   GET /api/hvac/heat-load/test-cases
 * @desc    Get heat load calculation test cases
 * @access  Public
 */
// router.get("/heat-load/test-cases", getTestCasesController);

/**
 * @route   POST /api/hvac/heat-load/validate
 * @desc    Validate heat load input data
 * @access  Public
 */
// router.post("/heat-load/validate", validateHeatLoadInputController);

/**
 * @route   POST /api/hvac/grille-size
 * @desc    Calculate grille size based on airflow, face velocity, and free area
 * @access  Public
 */
router.post("/grille-size", calculateGrilleSizeHandler);

/**
 * @route   GET /api/hvac/grille-size/test-cases
 * @desc    Get grille sizing calculation test cases
 * @access  Public
 */
// router.get("/grille-size/test-cases", getGrilleTestCasesHandler);

/**
 * @route   POST /api/hvac/fitting-losses
 * @desc    Calculate fitting losses based on fittings array, air velocity, and air density
 * @access  Public
 */
router.post("/fitting-losses", verifyToken, calculateFittingLossesHandler);

/**
 * @route   POST /api/hvac/total-pressure-drop
 * @desc    Calculate total AHU pressure drop including coil, filter, fittings, and additional losses
 * @access  Public
 */
router.post(
  "/total-pressure-drop",
  verifyToken,
  calculateTotalAHUPressureDropHandler
);

/**
 * @route   GET /api/hvac/standard-fittings
 * @desc    Get standard fitting types and their K values
 * @access  Public
 */
router.get("/standard-fittings", verifyToken, getStandardFittingsHandler);

/**
 * @route   GET /api/hvac/fitting-losses/test-cases
 * @desc    Get fitting loss calculation test cases
 * @access  Public
 */
router.get("/fitting-losses/test-cases", getFittingTestCasesHandler);

/**
 * @route   POST /api/hvac/chiller-pressure-drop
 * @desc    Calculate chiller pressure drop using data or theoretical mode
 * @access  Public
 */
router.post("/chiller-pressure-drop", calculateChillerPressureDropController);

/**
 * @route   GET /api/hvac/fluid-properties
 * @desc    Get fluid properties for specified fluid type and temperature
 * @access  Public
 */
router.get("/fluid-properties", getFluidPropertiesController);

/**
 * @route   GET /api/hvac/fluid-types
 * @desc    Get available fluid types and their properties
 * @access  Public
 */
router.get("/fluid-types", getFluidTypesController);

export default router;

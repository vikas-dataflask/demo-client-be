import { calculateAHU } from "../services/calculations/HVAC/AHUCalculation.js";
import { calculateChiller } from "../services/calculations/HVAC/ChillerCalculation.js";
import { calculateCondenser } from "../services/calculations/HVAC/CondenserCalculation.js";
// import { calculateHeatLoad as calculateHeatLoadService } from "../services/calculations/HVAC/HeatLoad.js";
import { calculateVentilation } from "../services/calculations/HVAC/Ventilation.js";
// import {
//   calculateHeatLoad,
//   testCase1,
//   testCase2,
// } from "../../utils/heatLoadCalc.js";
import {
  calculateChillerPressureDrop,
  getFluidProperties,
} from "../utils/chillerPressureDrop.js";

export const calculateHeatLoadHandler = (req, res) => {
  try {
    const inputData = req.body;

    if (!inputData || typeof inputData !== "object") {
      return res
        .status(400)
        .json({ success: false, message: "Invalid input data" });
    }

    // Use the utility function that handles optional fields
    const result = calculateHeatLoad(inputData);

    res.json({
      success: true,
      data: result,
      message: "Heat load calculated successfully",
    });
  } catch (error) {
    console.error("Heat load calculation error:", error);
    res.status(500).json({
      success: false,
      message: "Error processing heat load data",
      error: error.message,
    });
  }
};

export const calculateVentilationHandler = (req, res) => {
  try {
    const rooms = req.body.rooms;
    if (!rooms || !Array.isArray(rooms)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid input data" });
    }

    const results = calculateVentilation(rooms);
    res.json({ success: true, data: results });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error processing data",
      error: error.message,
    });
  }
};
// New handler for AHU calculations
export const calculateAHUHandler = (req, res) => {
  try {
    const inputData = req.body;

    if (!inputData || typeof inputData !== "object") {
      return res
        .status(400)
        .json({ success: false, message: "Invalid input data" });
    }

    const result = calculateAHU(inputData);
    res.json({ success: true, data: result });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error processing AHU data",
      error: error.message,
    });
  }
};
// New handler for Chiller calculations
export const calculateChillerHandler = (req, res) => {
  try {
    const inputData = req.body;

    if (!inputData || typeof inputData !== "object") {
      return res
        .status(400)
        .json({ success: false, message: "Invalid input data" });
    }

    const result = calculateChiller(inputData);
    res.json({ success: true, data: result });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error processing Chiller data",
      error: error.message,
    });
  }
};
// New: Condenser Calculation Handler
export const calculateCondenserHandler = (req, res) => {
  try {
    const inputData = req.body;

    if (!inputData || typeof inputData !== "object") {
      return res
        .status(400)
        .json({ success: false, message: "Invalid input data" });
    }

    const result = calculateCondenser(inputData);
    res.json({ success: true, data: result });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error processing condenser data",
      error: error.message,
    });
  }
};

/**
 * Calculate heat load for HVAC system design
 * @route POST /api/hvac/heat-load
 * @access Public
 */
export const calculateHeatLoadController = async (req, res) => {
  try {
    const inputData = req.body;

    // Validate input data
    if (!inputData || typeof inputData !== "object") {
      return res.status(400).json({
        success: false,
        message: "Invalid input: Request body must be a valid JSON object",
        error: "MISSING_INPUT_DATA",
      });
    }

    // Check for minimum required data
    const hasWalls =
      inputData.walls &&
      Array.isArray(inputData.walls) &&
      inputData.walls.length > 0;
    const hasPeople =
      inputData.people &&
      Array.isArray(inputData.people) &&
      inputData.people.length > 0;

    if (!hasWalls && !hasPeople) {
      return res.status(400).json({
        success: false,
        message:
          "At least walls or people data is required for heat load calculation",
        error: "INSUFFICIENT_DATA",
      });
    }

    // Perform heat load calculation
    const result = calculateHeatLoad(inputData);

    // Return successful response
    return res.status(200).json({
      success: true,
      message: "Heat load calculated successfully",
      data: {
        ...result,
        timestamp: new Date().toISOString(),
        inputSummary: {
          wallsCount: inputData.walls?.length || 0,
          windowsCount: inputData.windows?.length || 0,
          peopleCount:
            inputData.people?.reduce((sum, p) => sum + (p.count || 0), 0) || 0,
          equipmentCount: inputData.equipment?.length || 0,
          hasRoof: !!inputData.roof,
          hasLighting: !!inputData.lighting,
          hasInfiltration: !!inputData.infiltrate,
        },
      },
    });
  } catch (error) {
    console.error("Heat load calculation error:", error);

    return res.status(400).json({
      success: false,
      message: error.message || "Error calculating heat load",
      error: "CALCULATION_ERROR",
    });
  }
};

/**
 * Get heat load calculation test cases
 * @route GET /api/hvac/heat-load/test-cases
 * @access Public
 */
export const getTestCasesController = async (req, res) => {
  try {
    // Calculate results for test cases
    const testCase1Result = calculateHeatLoad(testCase1);
    const testCase2Result = calculateHeatLoad(testCase2);

    return res.status(200).json({
      success: true,
      message: "Test cases retrieved successfully",
      data: {
        testCase1: {
          input: testCase1,
          result: testCase1Result,
        },
        testCase2: {
          input: testCase2,
          result: testCase2Result,
        },
      },
    });
  } catch (error) {
    console.error("Test cases error:", error);

    return res.status(500).json({
      success: false,
      message: "Error retrieving test cases",
      error: "TEST_CASES_ERROR",
    });
  }
};

/**
 * Validate heat load input data
 * @route POST /api/hvac/heat-load/validate
 * @access Public
 */
export const validateHeatLoadInputController = async (req, res) => {
  try {
    const inputData = req.body;
    const validationErrors = [];

    // Validate walls
    if (inputData.walls) {
      if (!Array.isArray(inputData.walls)) {
        validationErrors.push("Walls must be an array");
      } else {
        inputData.walls.forEach((wall, index) => {
          if (!wall.area || !wall.uValue || !wall.deltaT) {
            validationErrors.push(
              `Wall ${index + 1}: Missing area, uValue, or deltaT`
            );
          }
        });
      }
    }

    // Validate windows
    if (inputData.windows) {
      if (!Array.isArray(inputData.windows)) {
        validationErrors.push("Windows must be an array");
      } else {
        inputData.windows.forEach((window, index) => {
          if (!window.area || !window.sc || !window.shgf) {
            validationErrors.push(
              `Window ${index + 1}: Missing area, sc, or shgf`
            );
          }
        });
      }
    }

    // Validate roof
    if (inputData.roof) {
      if (
        !inputData.roof.area ||
        !inputData.roof.uValue ||
        !inputData.roof.deltaT
      ) {
        validationErrors.push("Roof: Missing area, uValue, or deltaT");
      }
    }

    // Validate people
    if (inputData.people) {
      if (!Array.isArray(inputData.people)) {
        validationErrors.push("People must be an array");
      } else {
        inputData.people.forEach((person, index) => {
          if (!person.count || !person.sensible || !person.latent) {
            validationErrors.push(
              `Person ${index + 1}: Missing count, sensible, or latent`
            );
          }
        });
      }
    }

    // Validate equipment
    if (inputData.equipment) {
      if (!Array.isArray(inputData.equipment)) {
        validationErrors.push("Equipment must be an array");
      } else {
        inputData.equipment.forEach((equip, index) => {
          if (!equip.power || !equip.diversity) {
            validationErrors.push(
              `Equipment ${index + 1}: Missing power or diversity`
            );
          }
        });
      }
    }

    // Validate lighting
    if (inputData.lighting) {
      if (
        !inputData.lighting.watts ||
        !inputData.lighting.cuf ||
        !inputData.lighting.llf
      ) {
        validationErrors.push("Lighting: Missing watts, cuf, or llf");
      }
    }

    // Validate infiltration
    if (inputData.infiltrate) {
      if (
        !inputData.infiltrate.ach ||
        !inputData.infiltrate.volume ||
        !inputData.infiltrate.deltaT
      ) {
        validationErrors.push("Infiltration: Missing ach, volume, or deltaT");
      }
    }

    return res.status(200).json({
      success: true,
      message: "Input validation completed",
      data: {
        isValid: validationErrors.length === 0,
        errors: validationErrors,
        inputSummary: {
          hasWalls: !!inputData.walls?.length,
          hasWindows: !!inputData.windows?.length,
          hasRoof: !!inputData.roof,
          hasPeople: !!inputData.people?.length,
          hasEquipment: !!inputData.equipment?.length,
          hasLighting: !!inputData.lighting,
          hasInfiltration: !!inputData.infiltrate,
        },
      },
    });
  } catch (error) {
    console.error("Validation error:", error);

    return res.status(500).json({
      success: false,
      message: "Error validating input data",
      error: "VALIDATION_ERROR",
    });
  }
};

/**
 * Calculate chiller pressure drop
 * @route POST /api/hvac/chiller-pressure-drop
 * @access Public
 */
export const calculateChillerPressureDropController = async (req, res) => {
  try {
    const {
      chillerTonnage,
      flowRateLps,
      pipeInnerDiameterMm,
      fluidDensity,
      fluidViscosity,
      mode = "data",
    } = req.body;

    const input = {
      chillerTonnage,
      flowRateLps,
      pipeInnerDiameterMm,
      fluidDensity,
      fluidViscosity,
    };

    // Remove undefined values
    Object.keys(input).forEach((key) => {
      if (input[key] === undefined) {
        delete input[key];
      }
    });

    const result = calculateChillerPressureDrop(input, mode);

    res.json({
      success: true,
      message: "Chiller pressure drop calculated successfully",
      data: result,
    });
  } catch (error) {
    console.error("Error calculating chiller pressure drop:", error);
    res.status(400).json({
      success: false,
      message: error.message || "Failed to calculate chiller pressure drop",
      error: error.message,
    });
  }
};

/**
 * Get available fluid properties
 * @route GET /api/hvac/fluid-properties
 * @access Public
 */
export const getFluidPropertiesController = async (req, res) => {
  try {
    const { fluidType = "water", temperatureC = 25 } = req.query;

    const properties = getFluidProperties(fluidType, parseInt(temperatureC));

    res.json({
      success: true,
      message: "Fluid properties retrieved successfully",
      data: properties,
    });
  } catch (error) {
    console.error("Error getting fluid properties:", error);
    res.status(400).json({
      success: false,
      message: error.message || "Failed to get fluid properties",
      error: error.message,
    });
  }
};

/**
 * Get available fluid types
 * @route GET /api/hvac/fluid-types
 * @access Public
 */
export const getFluidTypesController = async (req, res) => {
  try {
    const fluidTypes = [
      {
        type: "water",
        name: "Water",
        description: "Standard water for HVAC systems",
        temperatures: [10, 25, 40],
      },
      {
        type: "glycol_30",
        name: "30% Glycol Solution",
        description: "30% ethylene glycol, 70% water",
        temperatures: [10, 25, 40],
      },
      {
        type: "glycol_50",
        name: "50% Glycol Solution",
        description: "50% ethylene glycol, 50% water",
        temperatures: [10, 25, 40],
      },
    ];

    res.json({
      success: true,
      message: "Fluid types retrieved successfully",
      data: fluidTypes,
    });
  } catch (error) {
    console.error("Error getting fluid types:", error);
    res.status(500).json({
      success: false,
      message: "Failed to get fluid types",
      error: error.message,
    });
  }
};

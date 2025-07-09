import {
  calculateFittingLosses,
  calculateTotalAHUPressureDrop,
  standardFittings,
} from "../utils/fittingLossCalculator.js";

/**
 * Calculate fitting losses based on fittings array, air velocity, and air density
 * @route POST /api/hvac/fitting-losses
 * @access Public
 */
export const calculateFittingLossesHandler = async (req, res) => {
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

    // Validate required fields
    const { fittingsArray, airVelocity, airDensity = 1.2 } = inputData;

    if (
      !fittingsArray ||
      !Array.isArray(fittingsArray) ||
      fittingsArray.length === 0
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Missing required field: fittingsArray must be a non-empty array",
        error: "MISSING_REQUIRED_FIELDS",
      });
    }

    if (!airVelocity || airVelocity <= 0) {
      return res.status(400).json({
        success: false,
        message:
          "Missing required field: airVelocity must be a positive number",
        error: "MISSING_REQUIRED_FIELDS",
      });
    }

    // Perform fitting loss calculation
    const result = calculateFittingLosses(
      fittingsArray,
      airVelocity,
      airDensity
    );

    // Return successful response
    return res.status(200).json({
      success: true,
      message: "Fitting losses calculated successfully",
      data: {
        ...result,
        timestamp: new Date().toISOString(),
        inputSummary: {
          totalFittings: fittingsArray.reduce(
            (sum, fitting) => sum + fitting.quantity,
            0
          ),
          airVelocity: result.calculationSummary.airVelocity,
          airDensity: result.calculationSummary.airDensity,
        },
      },
    });
  } catch (error) {
    console.error("Fitting loss calculation error:", error);

    return res.status(400).json({
      success: false,
      message: error.message || "Error calculating fitting losses",
      error: "CALCULATION_ERROR",
    });
  }
};

/**
 * Calculate total AHU pressure drop including coil, filter, fittings, and additional losses
 * @route POST /api/hvac/total-pressure-drop
 * @access Public
 */
export const calculateTotalAHUPressureDropHandler = async (req, res) => {
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

    // Validate required fields
    const {
      coilDrop = 0,
      filterDrop = 0,
      fittingsArray = [],
      airVelocity = 5,
      airDensity = 1.2,
      additionalLosses = 0,
    } = inputData;

    if (airVelocity <= 0) {
      return res.status(400).json({
        success: false,
        message: "Air velocity must be a positive number",
        error: "INVALID_INPUT",
      });
    }

    // Perform total AHU pressure drop calculation
    const result = calculateTotalAHUPressureDrop({
      coilDrop,
      filterDrop,
      fittingsArray,
      airVelocity,
      airDensity,
      additionalLosses,
    });

    // Return successful response
    return res.status(200).json({
      success: true,
      message: "Total AHU pressure drop calculated successfully",
      data: {
        ...result,
        timestamp: new Date().toISOString(),
        inputSummary: {
          coilDrop: result.breakdown.coilDrop,
          filterDrop: result.breakdown.filterDrop,
          totalFittings: fittingsArray.reduce(
            (sum, fitting) => sum + fitting.quantity,
            0
          ),
          airVelocity: result.calculationSummary.airVelocity,
          airDensity: result.calculationSummary.airDensity,
          additionalLosses: result.breakdown.additionalLosses,
        },
      },
    });
  } catch (error) {
    console.error("Total AHU pressure drop calculation error:", error);

    return res.status(400).json({
      success: false,
      message: error.message || "Error calculating total AHU pressure drop",
      error: "CALCULATION_ERROR",
    });
  }
};

/**
 * Get standard fitting types and their K values
 * @route GET /api/hvac/standard-fittings
 * @access Public
 */
export const getStandardFittingsHandler = async (req, res) => {
  try {
    return res.status(200).json({
      success: true,
      message: "Standard fittings retrieved successfully",
      data: {
        standardFittings,
        totalFittingTypes: Object.keys(standardFittings).length,
        categories: {
          elbows: Object.keys(standardFittings).filter((key) =>
            key.includes("elbow")
          ).length,
          transitions: Object.keys(standardFittings).filter(
            (key) => key.includes("transition") || key.includes("sudden")
          ).length,
          tees: Object.keys(standardFittings).filter((key) =>
            key.includes("tee")
          ).length,
          entries: Object.keys(standardFittings).filter((key) =>
            key.includes("entry")
          ).length,
          dampers: Object.keys(standardFittings).filter((key) =>
            key.includes("damper")
          ).length,
          others: Object.keys(standardFittings).filter(
            (key) =>
              !key.includes("elbow") &&
              !key.includes("transition") &&
              !key.includes("sudden") &&
              !key.includes("tee") &&
              !key.includes("entry") &&
              !key.includes("damper")
          ).length,
        },
      },
    });
  } catch (error) {
    console.error("Standard fittings error:", error);

    return res.status(500).json({
      success: false,
      message: "Error retrieving standard fittings",
      error: "STANDARD_FITTINGS_ERROR",
    });
  }
};

/**
 * Get fitting loss calculation test cases
 * @route GET /api/hvac/fitting-losses/test-cases
 * @access Public
 */
export const getFittingTestCasesHandler = async (req, res) => {
  try {
    const { testFittings1, testFittings2 } = await import(
      "../utils/fittingLossCalculator.js"
    );

    // Calculate results for test cases
    const testCase1Result = calculateFittingLosses(testFittings1, 5, 1.2);
    const testCase2Result = calculateFittingLosses(testFittings2, 6, 1.2);

    return res.status(200).json({
      success: true,
      message: "Test cases retrieved successfully",
      data: {
        testCase1: {
          input: {
            fittingsArray: testFittings1,
            airVelocity: 5,
            airDensity: 1.2,
          },
          result: testCase1Result,
        },
        testCase2: {
          input: {
            fittingsArray: testFittings2,
            airVelocity: 6,
            airDensity: 1.2,
          },
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

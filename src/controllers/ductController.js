import { calculateDuctSize } from "../utils/ductSizer.js";

/**
 * Calculate duct size using velocity method
 * @route POST /api/duct/size
 * @access Public
 */
export const calculateDuctSizeHandler = async (req, res) => {
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
      airflowCFM,
      maxVelocity,
      shape,
      aspectRatio,
      room,
      heatLoadCapacity,
    } = inputData;

    if (!airflowCFM || !maxVelocity || !shape) {
      return res.status(400).json({
        success: false,
        message:
          "Missing required fields: airflowCFM, maxVelocity, and shape are required",
        error: "MISSING_REQUIRED_FIELDS",
      });
    }

    // Perform duct sizing calculation
    const result = calculateDuctSize(inputData);

    // Return successful response
    return res.status(200).json({
      success: true,
      message: "Duct sizing calculated successfully",
      data: {
        ...result,
        timestamp: new Date().toISOString(),
        inputSummary: {
          airflowCFM: result.airflowCFM,
          velocity: result.velocity,
          shape: shape,
          aspectRatio: aspectRatio || "N/A",
          room: room || "N/A",
          heatLoadCapacity: heatLoadCapacity || "N/A",
        },
      },
    });
  } catch (error) {
    console.error("Duct sizing calculation error:", error);

    return res.status(400).json({
      success: false,
      message: error.message || "Error calculating duct size",
      error: "CALCULATION_ERROR",
    });
  }
};

/**
 * Get duct sizing calculation test cases
 * @route GET /api/duct/size/test-cases
 * @access Public
 */
export const getDuctTestCasesHandler = async (req, res) => {
  try {
    const { testCase1, testCase2, testCase3 } = await import(
      "../utils/ductSizer.js"
    );

    // Calculate results for test cases
    const testCase1Result = calculateDuctSize(testCase1);
    const testCase2Result = calculateDuctSize(testCase2);
    const testCase3Result = calculateDuctSize(testCase3);

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
        testCase3: {
          input: testCase3,
          result: testCase3Result,
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

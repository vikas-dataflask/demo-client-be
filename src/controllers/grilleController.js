import { calculateGrilleSize } from "../utils/grilleSizer.js";

/**
 * Calculate grille size based on airflow, face velocity, and free area
 * @route POST /api/hvac/grille-size
 * @access Public
 */
export const calculateGrilleSizeHandler = async (req, res) => {
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
    const { cfm, faceVelocity, freeAreaPercent } = inputData;

    if (!cfm) {
      return res.status(400).json({
        success: false,
        message: "Missing required field: cfm is required",
        error: "MISSING_REQUIRED_FIELDS",
      });
    }

    // Perform grille sizing calculation
    const result = calculateGrilleSize(inputData);

    // Return successful response
    return res.status(200).json({
      success: true,
      message: "Grille sizing calculated successfully",
      data: {
        ...result,
        timestamp: new Date().toISOString(),
        inputSummary: {
          cfm: result.cfm,
          faceVelocity: result.faceVelocity,
          freeAreaPercent: result.freeAreaPercent,
        },
      },
    });
  } catch (error) {
    console.error("Grille sizing calculation error:", error);

    return res.status(400).json({
      success: false,
      message: error.message || "Error calculating grille size",
      error: "CALCULATION_ERROR",
    });
  }
};

/**
 * Get grille sizing calculation test cases
 * @route GET /api/hvac/grille-size/test-cases
 * @access Public
 */
export const getGrilleTestCasesHandler = async (req, res) => {
  try {
    const { grilleTestCase1, grilleTestCase2, grilleTestCase3 } = await import(
      "../utils/grilleSizer.js"
    );

    // Calculate results for test cases
    const testCase1Result = calculateGrilleSize(grilleTestCase1);
    const testCase2Result = calculateGrilleSize(grilleTestCase2);
    const testCase3Result = calculateGrilleSize(grilleTestCase3);

    return res.status(200).json({
      success: true,
      message: "Test cases retrieved successfully",
      data: {
        testCase1: {
          input: grilleTestCase1,
          result: testCase1Result,
        },
        testCase2: {
          input: grilleTestCase2,
          result: testCase2Result,
        },
        testCase3: {
          input: grilleTestCase3,
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

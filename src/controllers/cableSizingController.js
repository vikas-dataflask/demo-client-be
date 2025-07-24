import {
  calculateCableSize,
  getAvailableCableSizes,
  getAvailableMCBRatings
} from '../utils/cableSizingCalculator.js';
import CableCalculation from '../models/CableCalculation.js';

/**
 * Save calculation result to DB
 */
const saveCalculationToDB = async (userId, projectId, input, result) => {
  try {
    const newCalculation = new CableCalculation({
      userId,
      projectId,
      ...input,
      result
    });
    await newCalculation.save();
  } catch (error) {
    console.error('Error saving calculation to DB:', error);
  }
};

/**
 * Calculate cable size for a given load
 * @route POST /api/cable-sizing/calculate
 */
const calculateCableSizeAPI = async (req, res) => {
  try {
    const { loadWatts, cableLengthMeters, voltage = 230, projectId } = req.body;
    const userId = req.user.id; // from verifyToken

    if (!loadWatts || !cableLengthMeters) {
      return res.status(400).json({
        success: false,
        message: 'loadWatts and cableLengthMeters are required'
      });
    }

    if (!projectId) {
      return res.status(400).json({
        success: false,
        message: 'projectId is required'
      });
    }

    const result = calculateCableSize(loadWatts, cableLengthMeters, voltage);

    // Save to DB
    await saveCalculationToDB(userId, projectId, { loadWatts, cableLengthMeters, voltage }, result);

    res.status(200).json({
      success: true,
      data: result,
      message: 'Cable size calculation completed successfully'
    });
  } catch (error) {
    console.error('Cable sizing calculation error:', error);
    res.status(400).json({
      success: false,
      message: error.message || 'Error calculating cable size'
    });
  }
};

/**
 * Get available cable sizes
 * @route GET /api/cable-sizing/cable-sizes
 */
const getCableSizes = async (req, res) => {
  try {
    const cableSizes = getAvailableCableSizes();
    res.status(200).json({
      success: true,
      data: cableSizes,
      message: 'Available cable sizes retrieved successfully'
    });
  } catch (error) {
    console.error('Get cable sizes error:', error);
    res.status(500).json({
      success: false,
      message: 'Error retrieving cable sizes'
    });
  }
};

/**
 * Get available MCB ratings
 * @route GET /api/cable-sizing/mcb-ratings
 */
const getMCBRatings = async (req, res) => {
  try {
    const mcbRatings = getAvailableMCBRatings();
    res.status(200).json({
      success: true,
      data: mcbRatings,
      message: 'Available MCB ratings retrieved successfully'
    });
  } catch (error) {
    console.error('Get MCB ratings error:', error);
    res.status(500).json({
      success: false,
      message: 'Error retrieving MCB ratings'
    });
  }
};

/**
 * Calculate cable size for multiple circuits
 * @route POST /api/cable-sizing/bulk-calculate
 */
const bulkCalculateCableSize = async (req, res) => {
  try {
    const { circuits, projectId } = req.body;
    const userId = req.user.id;

    if (!Array.isArray(circuits) || circuits.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'circuits array is required and must not be empty'
      });
    }

    if (!projectId) {
      return res.status(400).json({
        success: false,
        message: 'projectId is required'
      });
    }

    const results = [];
    const errors = [];

    for (let i = 0; i < circuits.length; i++) {
      const circuit = circuits[i];
      const {
        loadWatts,
        cableLengthMeters,
        voltage = 230,
        circuitName = `Circuit ${i + 1}`
      } = circuit;

      try {
        if (!loadWatts || !cableLengthMeters) {
          errors.push({
            index: i,
            circuitName,
            error: 'loadWatts and cableLengthMeters are required'
          });
          continue;
        }

        const result = calculateCableSize(loadWatts, cableLengthMeters, voltage);

        // Save to DB
        await saveCalculationToDB(
          userId,
          projectId,
          { circuitName, loadWatts, cableLengthMeters, voltage },
          result
        );

        results.push({
          index: i,
          circuitName,
          ...result
        });
      } catch (error) {
        errors.push({
          index: i,
          circuitName,
          error: error.message
        });
      }
    }

    res.status(200).json({
      success: true,
      data: {
        results,
        errors,
        summary: {
          total: circuits.length,
          successful: results.length,
          failed: errors.length
        }
      },
      message: `Bulk calculation completed. ${results.length} successful, ${errors.length} failed.`
    });
  } catch (error) {
    console.error('Bulk cable sizing calculation error:', error);
    res.status(500).json({
      success: false,
      message: 'Error in bulk cable size calculation'
    });
  }
};

/**
 * Get cable sizing reference data
 * @route GET /api/cable-sizing/reference
 */
const getReferenceData = async (req, res) => {
  try {
    const referenceData = {
      cableSizes: getAvailableCableSizes(),
      mcbRatings: getAvailableMCBRatings(),
      voltageDropLimit: 3,
      defaultVoltage: 230,
      resistanceValues: {
        '1.0': 18.1,
        '1.5': 12.1,
        '2.5': 7.41,
        '4.0': 4.61,
        '6.0': 3.08
      },
      currentLimits: {
        '1.0': 6,
        '1.5': 10,
        '2.5': 16,
        '4.0': 25,
        '6.0': 'Above 25A'
      }
    };

    res.status(200).json({
      success: true,
      data: referenceData,
      message: 'Reference data retrieved successfully'
    });
  } catch (error) {
    console.error('Get reference data error:', error);
    res.status(500).json({
      success: false,
      message: 'Error retrieving reference data'
    });
  }
};

/**
 * Save cable sizing data for a project
 * @route POST /api/cable-sizing/save
 */
const saveCableSizingData = async (req, res) => {
  try {
    const { projectId, formData, result, bulkMode, bulkCircuits } = req.body;
    const userId = req.user.id;

    if (!projectId) {
      return res.status(400).json({
        success: false,
        message: 'projectId is required'
      });
    }

    // Find existing data for this project
    let existingData = await CableCalculation.findOne({ projectId, userId });

    if (existingData) {
      // Update existing data
      existingData.formData = formData;
      existingData.result = result;
      existingData.bulkMode = bulkMode;
      if (bulkCircuits) {
        existingData.bulkCircuits = bulkCircuits;
      }
      await existingData.save();
    } else {
      // Create new data
      existingData = await CableCalculation.create({
        userId,
        projectId,
        formData,
        result,
        bulkMode,
        bulkCircuits
      });
    }

    res.status(200).json({
      success: true,
      data: existingData,
      message: 'Cable sizing data saved successfully'
    });
  } catch (error) {
    console.error('Save cable sizing data error:', error);
    res.status(500).json({
      success: false,
      message: 'Error saving cable sizing data'
    });
  }
};

/**
 * Get cable sizing data for a project (autofill)
 * @route GET /api/cable-sizing/:projectId
 */
const getCableSizingByProject = async (req, res) => {
  try {
    const { projectId } = req.params;
    const userId = req.user.id;

    const cableData = await CableCalculation.findOne({ projectId, userId });

    if (!cableData) {
      return res.status(404).json({
        success: false,
        message: 'No cable sizing data found for this project'
      });
    }

    res.status(200).json({
      success: true,
      data: cableData,
      message: 'Cable sizing data retrieved successfully'
    });
  } catch (error) {
    console.error('Get cable sizing by project error:', error);
    res.status(500).json({
      success: false,
      message: 'Error retrieving cable sizing data'
    });
  }
};

export {
  calculateCableSizeAPI,
  getCableSizes,
  getMCBRatings,
  bulkCalculateCableSize,
  getReferenceData,
  saveCableSizingData,
  getCableSizingByProject
};

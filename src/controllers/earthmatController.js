import Earthmat from "../models/earthmatModel.js";
import {
  calculateEarthmat,
  getAvailableMaterials,
  getStandardConductorSizes,
  MATERIAL_CONSTANTS,
} from "../utils/earthmatCalculator.js";

/**
 * ✅ Calculate & Save Earthmat Calculation
 * POST /api/earthmat/calculate
 */
const calculateEarthmatAPI = async (req, res) => {
  try {
    const {
      projectId,
      faultCurrent,
      faultDuration,
      soilResistivity,
      gridArea,
      burialDepth,
      rodDepth,
      numberOfRods,
      material,
      gridSpacing,
    } = req.body;

    if (!projectId) {
      return res.status(400).json({
        success: false,
        message: "Project ID is required",
      });
    }

    const result = calculateEarthmat({
      faultCurrent,
      faultDuration,
      soilResistivity,
      gridArea,
      burialDepth,
      rodDepth,
      numberOfRods,
      material,
      gridSpacing,
    });

    if (!result.success) {
      return res.status(400).json({
        success: false,
        message: result.error,
      });
    }

    // Save input + result to DB
    const saved = await Earthmat.create({
      projectId,
      userId: req.user.id, // from verifyToken middleware
      input: {
        faultCurrent,
        faultDuration,
        soilResistivity,
        gridArea,
        burialDepth,
        rodDepth,
        numberOfRods,
        material,
        gridSpacing,
      },
      result: result.data,
    });

    res.json({
      success: true,
      data: saved,
      message: "Earthmat calculation saved successfully",
    });
  } catch (error) {
    console.error("Earthmat calculation error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error during calculation",
    });
  }
};

/**
 * ✅ Autofill - Get latest saved Earthmat by Project
 * GET /api/earthmat/autofill/:projectId
 */
const autofillEarthmat = async (req, res) => {
  try {
    const { projectId } = req.params;

    const lastEntry = await Earthmat.findOne({ projectId })
      .sort({ createdAt: -1 })
      .lean();

    if (!lastEntry) {
      return res.status(404).json({
        success: false,
        message: "No Earthmat data found for this project",
      });
    }

    res.json({
      success: true,
      data: lastEntry,
      message: "Autofill data retrieved successfully",
    });
  } catch (error) {
    console.error("Autofill error:", error);
    res.status(500).json({
      success: false,
      message: "Error retrieving autofill data",
    });
  }
};

/**
 * ✅ Update Existing Earthmat Calculation
 * PUT /api/earthmat/update/:id
 */
const updateEarthmat = async (req, res) => {
  try {
    const { id } = req.params;

    const {
      faultCurrent,
      faultDuration,
      soilResistivity,
      gridArea,
      burialDepth,
      rodDepth,
      numberOfRods,
      material,
      gridSpacing,
    } = req.body;

    const result = calculateEarthmat({
      faultCurrent,
      faultDuration,
      soilResistivity,
      gridArea,
      burialDepth,
      rodDepth,
      numberOfRods,
      material,
      gridSpacing,
    });

    if (!result.success) {
      return res.status(400).json({
        success: false,
        message: result.error,
      });
    }

    const updated = await Earthmat.findByIdAndUpdate(
      id,
      {
        input: {
          faultCurrent,
          faultDuration,
          soilResistivity,
          gridArea,
          burialDepth,
          rodDepth,
          numberOfRods,
          material,
          gridSpacing,
        },
        result: result.data,
      },
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({
        success: false,
        message: "Earthmat record not found",
      });
    }

    res.json({
      success: true,
      data: updated,
      message: "Earthmat calculation updated successfully",
    });
  } catch (error) {
    console.error("Update error:", error);
    res.status(500).json({
      success: false,
      message: "Error updating calculation",
    });
  }
};

/**
 * ✅ Get Reference Data (Materials, Sizes, Standards)
 * GET /api/earthmat/reference
 */
const getEarthmatReference = async (req, res) => {
  try {
    const referenceData = {
      materials: getAvailableMaterials(),
      standardSizes: getStandardConductorSizes(),
      materialConstants: MATERIAL_CONSTANTS,
      standards: {
        ieee80: {
          name: "IEEE 80",
          description: "IEEE Guide for Safety in AC Substation Grounding",
          year: "2013",
        },
        is3043: {
          name: "IS 3043",
          description: "Code of Practice for Earthing",
          year: "2018",
        },
      },
      guidelines: {
        gridSpacing: {
          min: 5,
          max: 15,
          default: 7.5,
          unit: "meters",
        },
        burialDepth: {
          min: 0.5,
          max: 1.0,
          default: 0.6,
          unit: "meters",
        },
        rodDepth: {
          min: 2,
          max: 6,
          default: 3,
          unit: "meters",
        },
        safetyMargin: {
          min: 20,
          recommended: 30,
          unit: "percent",
        },
      },
      soilTypes: [
        {
          type: "Wet Organic",
          resistivity: 10,
          description: "Very low resistivity soil",
        },
        {
          type: "Moist Soil",
          resistivity: 100,
          description: "Typical soil conditions",
        },
        {
          type: "Dry Soil",
          resistivity: 1000,
          description: "High resistivity soil",
        },
        {
          type: "Bedrock",
          resistivity: 10000,
          description: "Very high resistivity",
        },
      ],
    };

    res.json({
      success: true,
      data: referenceData,
      message: "Reference data retrieved successfully",
    });
  } catch (error) {
    console.error("Error fetching earthmat reference:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching reference data",
    });
  }
};

export {
  calculateEarthmatAPI,
  autofillEarthmat,
  updateEarthmat,
  getEarthmatReference,
};

import {
  calculateWaterDemand,
  getBuildingTypes,
  calculateMultipleBuildings,
} from "../utils/waterDemandCalculator.js";

// Get available building types
export const getBuildingTypesController = async (req, res) => {
  try {
    const buildingTypes = getBuildingTypes();
    res.json({
      success: true,
      data: buildingTypes,
      message: "Building types retrieved successfully",
    });
  } catch (error) {
    console.error("Error getting building types:", error);
    res.status(500).json({
      success: false,
      message: "Failed to retrieve building types",
      error: error.message,
    });
  }
};

// Calculate water demand for single building
export const calculateWaterDemandController = async (req, res) => {
  try {
    const {
      buildingType,
      unitCount,
      areaM2,
      landscapeM2 = 0,
      ufwPercentage = 15,
      kitchenLaundryPercentage = 10,
    } = req.body;

    // Validate required fields
    if (!buildingType) {
      return res.status(400).json({
        success: false,
        message: "Building type is required",
      });
    }

    // Calculate water demand
    const result = calculateWaterDemand({
      buildingType,
      unitCount,
      areaM2,
      landscapeM2,
      ufwPercentage,
      kitchenLaundryPercentage,
    });

    res.json({
      success: true,
      data: result,
      message: "Water demand calculated successfully",
    });
  } catch (error) {
    console.error("Error calculating water demand:", error);
    res.status(400).json({
      success: false,
      message: error.message || "Failed to calculate water demand",
    });
  }
};

// Calculate water demand for multiple buildings
export const calculateMultipleBuildingsController = async (req, res) => {
  try {
    const { buildings } = req.body;

    if (!buildings || !Array.isArray(buildings) || buildings.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Buildings array is required and must not be empty",
      });
    }

    // Calculate water demand for multiple buildings
    const result = calculateMultipleBuildings(buildings);

    res.json({
      success: true,
      data: result,
      message: "Multiple buildings water demand calculated successfully",
    });
  } catch (error) {
    console.error("Error calculating multiple buildings water demand:", error);
    res.status(400).json({
      success: false,
      message:
        error.message || "Failed to calculate multiple buildings water demand",
    });
  }
};

// Validate building type
export const validateBuildingTypeController = async (req, res) => {
  try {
    const { buildingType } = req.params;

    if (!buildingType) {
      return res.status(400).json({
        success: false,
        message: "Building type is required",
      });
    }

    const buildingTypes = getBuildingTypes();
    const isValid = buildingTypes.some((type) => type.type === buildingType);

    res.json({
      success: true,
      data: {
        buildingType,
        isValid,
        buildingInfo:
          buildingTypes.find((type) => type.type === buildingType) || null,
      },
      message: isValid ? "Building type is valid" : "Building type is invalid",
    });
  } catch (error) {
    console.error("Error validating building type:", error);
    res.status(500).json({
      success: false,
      message: "Failed to validate building type",
      error: error.message,
    });
  }
};

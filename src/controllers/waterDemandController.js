// import {
//   calculateWaterDemand,
//   getBuildingTypes,
//   calculateMultipleBuildings,
// } from "../utils/waterDemandCalculator.js";

// // Get available building types
// export const getBuildingTypesController = async (req, res) => {
//   try {
//     const buildingTypes = getBuildingTypes();
//     res.json({
//       success: true,
//       data: buildingTypes,
//       message: "Building types retrieved successfully",
//     });
//   } catch (error) {
//     console.error("Error getting building types:", error);
//     res.status(500).json({
//       success: false,
//       message: "Failed to retrieve building types",
//       error: error.message,
//     });
//   }
// };

// // Calculate water demand for single building
// export const calculateWaterDemandController = async (req, res) => {
//   try {
//     const {
//       buildingType,
//       unitCount,
//       areaM2,
//       landscapeM2 = 0,
//       ufwPercentage = 15,
//       kitchenLaundryPercentage = 10,
//     } = req.body;

//     // Validate required fields
//     if (!buildingType) {
//       return res.status(400).json({
//         success: false,
//         message: "Building type is required",
//       });
//     }

//     // Calculate water demand
//     const result = calculateWaterDemand({
//       buildingType,
//       unitCount,
//       areaM2,
//       landscapeM2,
//       ufwPercentage,
//       kitchenLaundryPercentage,
//     });

//     res.json({
//       success: true,
//       data: result,
//       message: "Water demand calculated successfully",
//     });
//   } catch (error) {
//     console.error("Error calculating water demand:", error);
//     res.status(400).json({
//       success: false,
//       message: error.message || "Failed to calculate water demand",
//     });
//   }
// };

// // Calculate water demand for multiple buildings
// export const calculateMultipleBuildingsController = async (req, res) => {
//   try {
//     const { buildings } = req.body;

//     if (!buildings || !Array.isArray(buildings) || buildings.length === 0) {
//       return res.status(400).json({
//         success: false,
//         message: "Buildings array is required and must not be empty",
//       });
//     }

//     // Calculate water demand for multiple buildings
//     const result = calculateMultipleBuildings(buildings);

//     res.json({
//       success: true,
//       data: result,
//       message: "Multiple buildings water demand calculated successfully",
//     });
//   } catch (error) {
//     console.error("Error calculating multiple buildings water demand:", error);
//     res.status(400).json({
//       success: false,
//       message:
//         error.message || "Failed to calculate multiple buildings water demand",
//     });
//   }
// };

// // Validate building type
// export const validateBuildingTypeController = async (req, res) => {
//   try {
//     const { buildingType } = req.params;

//     if (!buildingType) {
//       return res.status(400).json({
//         success: false,
//         message: "Building type is required",
//       });
//     }

//     const buildingTypes = getBuildingTypes();
//     const isValid = buildingTypes.some((type) => type.type === buildingType);

//     res.json({
//       success: true,
//       data: {
//         buildingType,
//         isValid,
//         buildingInfo:
//           buildingTypes.find((type) => type.type === buildingType) || null,
//       },
//       message: isValid ? "Building type is valid" : "Building type is invalid",
//     });
//   } catch (error) {
//     console.error("Error validating building type:", error);
//     res.status(500).json({
//       success: false,
//       message: "Failed to validate building type",
//       error: error.message,
//     });
//   }
// };

import {
  calculateWaterDemand,
  calculateBuildingWaterDemand,
  calculateMultipleBuildings,
  getBuildingTypes,
  getBuildingList,
} from "../utils/waterDemandCalculator.js";

// ✅ Get available building types (Base Types like Residential, Office, etc.)
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

// ✅ Get available building names (Metro Elevated, Hotel, Mall, etc.)
export const getBuildingListController = async (req, res) => {
  try {
    const buildingList = getBuildingList();
    res.json({
      success: true,
      data: buildingList,
      message: "Building list retrieved successfully",
    });
  } catch (error) {
    console.error("Error getting building list:", error);
    res.status(500).json({
      success: false,
      message: "Failed to retrieve building list",
      error: error.message,
    });
  }
};

// ✅ Calculate water demand for BASE building type (old functionality)
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

    if (!buildingType) {
      return res.status(400).json({
        success: false,
        message: "Building type is required",
      });
    }

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

// ✅ NEW: Calculate FULL water demand for a specific building name (with mapped demands)
export const calculateBuildingWaterDemandController = async (req, res) => {
  try {
    const {
      buildingName, // e.g., "Hotel"
      baseBuildingType, // e.g., "Hotel" or "Residential" (maps to demandFactors)
      unitCount,
      areaM2,
      landscapeM2 = 0,
      ufwPercentage = 15,
      kitchenLaundryPercentage = 10,
    } = req.body;

    if (!buildingName || !baseBuildingType) {
      return res.status(400).json({
        success: false,
        message: "Building name and base building type are required",
      });
    }

    const result = calculateBuildingWaterDemand({
      buildingName,
      baseBuildingType,
      unitCount,
      areaM2,
      landscapeM2,
      ufwPercentage,
      kitchenLaundryPercentage,
    });

    res.json({
      success: true,
      data: result,
      message:
        "Building water demand (with mapped demands) calculated successfully",
    });
  } catch (error) {
    console.error("Error calculating building water demand:", error);
    res.status(400).json({
      success: false,
      message: error.message || "Failed to calculate building water demand",
    });
  }
};

// ✅ Calculate water demand for multiple BASE buildings (old functionality)
export const calculateMultipleBuildingsController = async (req, res) => {
  try {
    const { buildings } = req.body;

    if (!buildings || !Array.isArray(buildings) || buildings.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Buildings array is required and must not be empty",
      });
    }

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

// ✅ Validate if base building type is valid
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

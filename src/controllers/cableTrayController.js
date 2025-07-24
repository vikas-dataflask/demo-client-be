import {
  calculateTraySize,
  getAvailableCableSizes,
  getAvailableTraySizes,
  getAvailableTrayTypes,
  isValidCableSize,
  getCableOD,
  normalizeCableSize,
  TRAY_TYPES,
} from "../utils/cableTrayCalculator.js";

import TrayCalculation from "../models/TrayCalculation.js";

/**
 * ✅ Existing API: Calculate tray size (no DB save)
 */
const calculateTraySizeAPI = async (req, res) => {
  try {
    const {
      cableList,
      fillFactor = 0.4,
      trayType = TRAY_TYPES.PERFORATED,
    } = req.body;

    if (!cableList) {
      return res
        .status(400)
        .json({ success: false, message: "cableList is required" });
    }

    // Normalize cable sizes for consistency
    const normalizedCableList = cableList.map(cable => ({
      ...cable,
      size: normalizeCableSize(cable.size)
    }));

    const result = calculateTraySize(normalizedCableList, fillFactor, trayType);

    if (result.success) {
      res.status(200).json({
        success: true,
        data: result,
        message: "Cable tray size calculation completed successfully",
      });
    } else {
      res.status(400).json({
        success: false,
        data: result,
        message: result.error || "Calculation failed",
      });
    }
  } catch (error) {
    console.error("Cable tray calculation error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * ✅ NEW: Save tray calculation (runs calculation first, then saves)
 * @route POST /api/cable-tray/save
 */
const saveTrayCalculation = async (req, res) => {
  try {
    const {
      projectId,
      cableList,
      fillFactor = 0.4,
      trayType = TRAY_TYPES.PERFORATED,
    } = req.body;

    if (!projectId) {
      return res
        .status(400)
        .json({ success: false, message: "projectId is required" });
    }
    if (!cableList) {
      return res
        .status(400)
        .json({ success: false, message: "cableList is required" });
    }

    // Normalize cable sizes for consistency
    const normalizedCableList = cableList.map(cable => ({
      ...cable,
      size: normalizeCableSize(cable.size)
    }));

    // Run calculation
    const result = calculateTraySize(normalizedCableList, fillFactor, trayType);

    // Save to DB
    const savedData = await TrayCalculation.create({
      projectId,
      trayType: result.trayType,
      fillFactor: parseFloat(fillFactor),
      totalCableCount: result.totalCableCount,
      totalCableArea: result.totalCableArea,
      requiredTrayArea: result.requiredTrayArea,
      recommendedTraySize: result.recommendedTraySize,
      actualFillPercentage: result.actualFillPercentage,
      trayArea: result.trayArea,
      success: result.success,
      warning: result.warning,
      largestStandardTray: result.largestStandardTray,
      cableList: result.cableDetails,
    });

    res.status(201).json({
      success: true,
      data: savedData,
      message: "Tray calculation saved successfully",
    });
  } catch (error) {
    console.error("Save tray calculation error:", error);
    res
      .status(500)
      .json({ success: false, message: "Error saving tray calculation" });
  }
};

/**
 * ✅ NEW: Autofill existing tray calculation by projectId
 * @route GET /api/cable-tray/get/:projectId
 */
const getTrayCalculation = async (req, res) => {
  try {
    const { projectId } = req.params;

    const calculation = await TrayCalculation.findOne({ projectId }).sort({
      updatedAt: -1,
    });

    if (!calculation) {
      return res
        .status(404)
        .json({
          success: false,
          message: "No calculation found for this project",
        });
    }

    res.status(200).json({
      success: true,
      data: calculation,
      message: "Tray calculation retrieved successfully",
    });
  } catch (error) {
    console.error("Get tray calculation error:", error);
    res
      .status(500)
      .json({ success: false, message: "Error retrieving tray calculation" });
  }
};

/**
 * ✅ NEW: Update existing tray calculation by projectId
 * @route PUT /api/cable-tray/update/:projectId
 */
const updateTrayCalculation = async (req, res) => {
  try {
    const { projectId } = req.params;
    const {
      cableList,
      fillFactor = 0.4,
      trayType = TRAY_TYPES.PERFORATED,
    } = req.body;

    const existingRecord = await TrayCalculation.findOne({ projectId });
    if (!existingRecord) {
      return res
        .status(404)
        .json({ success: false, message: "No calculation found to update" });
    }

    // Normalize cable sizes for consistency
    const normalizedCableList = cableList.map(cable => ({
      ...cable,
      size: normalizeCableSize(cable.size)
    }));

    const result = calculateTraySize(normalizedCableList, fillFactor, trayType);

    existingRecord.trayType = result.trayType;
    existingRecord.fillFactor = parseFloat(fillFactor);
    existingRecord.totalCableCount = result.totalCableCount;
    existingRecord.totalCableArea = result.totalCableArea;
    existingRecord.requiredTrayArea = result.requiredTrayArea;
    existingRecord.recommendedTraySize = result.recommendedTraySize;
    existingRecord.actualFillPercentage = result.actualFillPercentage;
    existingRecord.trayArea = result.trayArea;
    existingRecord.success = result.success;
    existingRecord.warning = result.warning;
    existingRecord.largestStandardTray = result.largestStandardTray;
    existingRecord.cableList = result.cableDetails;

    await existingRecord.save();

    res.status(200).json({
      success: true,
      data: existingRecord,
      message: "Tray calculation updated successfully",
    });
  } catch (error) {
    console.error("Update tray calculation error:", error);
    res
      .status(500)
      .json({ success: false, message: "Error updating tray calculation" });
  }
};

// ✅ Keep the existing other controller methods unchanged
const getCableSizes = async (req, res) => {
  try {
    const cableSizes = getAvailableCableSizes();
    res
      .status(200)
      .json({
        success: true,
        data: cableSizes,
        message: "Available cable sizes retrieved successfully",
      });
  } catch {
    res
      .status(500)
      .json({ success: false, message: "Error retrieving cable sizes" });
  }
};

const getTraySizes = async (req, res) => {
  try {
    const traySizes = getAvailableTraySizes();
    res
      .status(200)
      .json({
        success: true,
        data: traySizes,
        message: "Available tray sizes retrieved successfully",
      });
  } catch {
    res
      .status(500)
      .json({ success: false, message: "Error retrieving tray sizes" });
  }
};

const getTrayTypes = async (req, res) => {
  try {
    const trayTypes = getAvailableTrayTypes();
    res
      .status(200)
      .json({
        success: true,
        data: trayTypes,
        message: "Available tray types retrieved successfully",
      });
  } catch {
    res
      .status(500)
      .json({ success: false, message: "Error retrieving tray types" });
  }
};

const validateCableSize = async (req, res) => {
  try {
    const { size } = req.body;
    if (!size) {
      return res
        .status(400)
        .json({ success: false, message: "Cable size is required" });
    }
    const normalizedSize = normalizeCableSize(size);
    const isValid = isValidCableSize(normalizedSize);
    const od = getCableOD(normalizedSize);
    res.status(200).json({
      success: true,
      data: { 
        originalSize: size, 
        normalizedSize: normalizedSize, 
        isValid, 
        outerDiameter: od, 
        unit: "mm" 
      },
      message: isValid ? "Cable size is valid" : "Cable size is not valid",
    });
  } catch {
    res
      .status(500)
      .json({ success: false, message: "Error validating cable size" });
  }
};

const getReferenceData = async (req, res) => {
  try {
    const referenceData = {
      cableSizes: getAvailableCableSizes(),
      traySizes: getAvailableTraySizes(),
      trayTypes: getAvailableTrayTypes(),
      defaultFillFactor: 0.4,
      fillFactorRange: { min: 0.1, max: 1.0, recommended: 0.4 },
      units: {
        cableSize: "mm²",
        outerDiameter: "mm",
        traySize: "mm",
        area: "mm²",
      },
    };
    res
      .status(200)
      .json({
        success: true,
        data: referenceData,
        message: "Reference data retrieved successfully",
      });
  } catch {
    res
      .status(500)
      .json({ success: false, message: "Error retrieving reference data" });
  }
};

export {
  calculateTraySizeAPI,
  saveTrayCalculation,
  getTrayCalculation,
  updateTrayCalculation,
  getCableSizes,
  getTraySizes,
  getTrayTypes,
  validateCableSize,
  getReferenceData,
};

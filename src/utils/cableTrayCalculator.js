/**
 * Cable Tray Sizing Calculator Utility
 * Calculates appropriate cable tray size based on cable quantity and types
 */

// Cable outer diameters (OD) in mm for different sizes
const CABLE_OD_MAP = {
  "1.0": 5.5,
  "1": 5.5,
  1.5: 6.5,
  "1.5": 6.5,
  2.5: 8.5,
  "2.5": 8.5,
  "4.0": 10.0,
  "4": 10.0,
  "6.0": 12.0,
  "6": 12.0,
  "10.0": 15.0,
  "10": 15.0,
  "16.0": 18.0,
  "16": 18.0,
  "25.0": 22.0,
  "25": 22.0,
  "35.0": 26.0,
  "35": 26.0,
  "50.0": 30.0,
  "50": 30.0,
  "70.0": 35.0,
  "70": 35.0,
  "95.0": 40.0,
  "95": 40.0,
  "120.0": 45.0,
  "120": 45.0,
  "150.0": 50.0,
  "150": 50.0,
  "185.0": 55.0,
  "185": 55.0,
  "240.0": 62.0,
  "240": 62.0,
  "300.0": 68.0,
  "300": 68.0,
  "400.0": 75.0,
  "400": 75.0,
  "500.0": 82.0,
  "500": 82.0,
  "630.0": 90.0,
  "630": 90.0,
};

// Standard tray sizes (width x height in mm)
const TRAY_SIZES = [
  { width: 100, height: 50, area: 5000 },
  { width: 150, height: 50, area: 7500 },
  { width: 200, height: 50, area: 10000 },
  { width: 300, height: 50, area: 15000 },
  { width: 400, height: 50, area: 20000 },
  { width: 500, height: 50, area: 25000 },
  { width: 600, height: 50, area: 30000 },
  { width: 100, height: 75, area: 7500 },
  { width: 150, height: 75, area: 11250 },
  { width: 200, height: 75, area: 15000 },
  { width: 300, height: 75, area: 22500 },
  { width: 400, height: 75, area: 30000 },
  { width: 500, height: 75, area: 37500 },
  { width: 600, height: 75, area: 45000 },
];

// Default fill factor (40%)
const DEFAULT_FILL_FACTOR = 0.4;

// Tray types
const TRAY_TYPES = {
  PERFORATED: "Perforated",
  LADDER: "Ladder",
  SOLID: "Solid",
  WIRE_MESH: "Wire Mesh",
};

/**
 * Calculate cable tray size based on cable list
 * @param {Array} cableList - Array of cable objects with size and quantity
 * @param {number} fillFactor - Fill factor (default: 0.4 = 40%)
 * @param {string} trayType - Type of tray (default: "Perforated")
 * @returns {Object} Calculation results
 */
const calculateTraySize = (
  cableList,
  fillFactor = DEFAULT_FILL_FACTOR,
  trayType = TRAY_TYPES.PERFORATED
) => {
  try {
    // Input validation
    if (!Array.isArray(cableList) || cableList.length === 0) {
      throw new Error("Cable list must be a non-empty array");
    }

    if (fillFactor <= 0 || fillFactor > 1) {
      throw new Error("Fill factor must be between 0 and 1");
    }

    // Validate each cable in the list
    const invalidCables = cableList.filter((cable) => {
      return (
        !cable.size ||
        !cable.quantity ||
        !CABLE_OD_MAP[cable.size] ||
        cable.quantity <= 0
      );
    });

    if (invalidCables.length > 0) {
      const invalidSizes = invalidCables
        .filter(cable => !CABLE_OD_MAP[cable.size])
        .map(cable => cable.size);
      
      if (invalidSizes.length > 0) {
        const availableSizes = getAvailableCableSizes().join(", ");
        throw new Error(`Invalid cable size(s): ${invalidSizes.join(", ")}. Available sizes: ${availableSizes}`);
      } else {
        throw new Error(`Invalid cable data: ${JSON.stringify(invalidCables)}`);
      }
    }

    // Calculate total cable area
    let totalCableArea = 0;
    let totalCableCount = 0;
    const cableDetails = [];

    for (const cable of cableList) {
      const od = CABLE_OD_MAP[cable.size];
      const cableArea = Math.PI * Math.pow(od / 2, 2);
      const totalAreaForSize = cableArea * cable.quantity;

      totalCableArea += totalAreaForSize;
      totalCableCount += cable.quantity;

      cableDetails.push({
        size: cable.size,
        quantity: cable.quantity,
        od: od,
        areaPerCable: parseFloat(cableArea.toFixed(2)),
        totalAreaForSize: parseFloat(totalAreaForSize.toFixed(2)),
      });
    }

    // Calculate required tray area
    const requiredTrayArea = totalCableArea / fillFactor;

    // Find the smallest tray that meets the required area
    const sortedTrays = [...TRAY_SIZES].sort((a, b) => a.area - b.area);
    const recommendedTray = sortedTrays.find(
      (tray) => tray.area >= requiredTrayArea
    );

    if (!recommendedTray) {
      // No standard tray size fits, return warning
      return {
        success: false,
        totalCableArea: parseFloat(totalCableArea.toFixed(2)),
        requiredTrayArea: parseFloat(requiredTrayArea.toFixed(2)),
        recommendedTraySize: "Custom size required",
        fillFactor: `${(fillFactor * 100).toFixed(0)}%`,
        trayType: trayType,
        totalCableCount: totalCableCount,
        cableDetails: cableDetails,
        warning: `Required area (${parseFloat(
          requiredTrayArea.toFixed(2)
        )} mm²) exceeds largest standard tray (${Math.max(
          ...TRAY_SIZES.map((t) => t.area)
        )} mm²)`,
        largestStandardTray: `${Math.max(
          ...TRAY_SIZES.map((t) => t.width)
        )} x ${Math.max(...TRAY_SIZES.map((t) => t.height))} mm`,
      };
    }

    // Calculate actual fill percentage
    const actualFillPercentage = (totalCableArea / recommendedTray.area) * 100;

    return {
      success: true,
      totalCableArea: parseFloat(totalCableArea.toFixed(2)),
      requiredTrayArea: parseFloat(requiredTrayArea.toFixed(2)),
      recommendedTraySize: `${recommendedTray.width} x ${recommendedTray.height} mm`,
      trayArea: recommendedTray.area,
      fillFactor: `${(fillFactor * 100).toFixed(0)}%`,
      actualFillPercentage: parseFloat(actualFillPercentage.toFixed(2)),
      trayType: trayType,
      totalCableCount: totalCableCount,
      cableDetails: cableDetails,
      calculations: {
        fillFactor: fillFactor,
        requiredArea: parseFloat(requiredTrayArea.toFixed(2)),
        selectedTrayArea: recommendedTray.area,
      },
    };
  } catch (error) {
    return {
      success: false,
      error: error.message,
      totalCableArea: 0,
      requiredTrayArea: 0,
      recommendedTraySize: "Calculation failed",
      fillFactor: `${(fillFactor * 100).toFixed(0)}%`,
      trayType: trayType,
    };
  }
};

/**
 * Get available cable sizes
 * @returns {Array} Array of available cable sizes
 */
const getAvailableCableSizes = () => {
  // Get unique cable sizes (remove duplicates from both formats)
  const uniqueSizes = new Set();
  Object.keys(CABLE_OD_MAP).forEach(size => {
    const numSize = parseFloat(size);
    if (!isNaN(numSize)) {
      uniqueSizes.add(numSize);
    }
  });
  
  return Array.from(uniqueSizes)
    .sort((a, b) => a - b)
    .map(size => size.toString());
};

/**
 * Get available tray sizes
 * @returns {Array} Array of available tray sizes
 */
const getAvailableTraySizes = () => {
  return TRAY_SIZES.map((tray) => ({
    size: `${tray.width} x ${tray.height} mm`,
    width: tray.width,
    height: tray.height,
    area: tray.area,
  }));
};

/**
 * Get available tray types
 * @returns {Array} Array of available tray types
 */
const getAvailableTrayTypes = () => {
  return Object.values(TRAY_TYPES);
};

/**
 * Validate cable size
 * @param {string} size - Cable size to validate
 * @returns {boolean} True if cable size is valid
 */
const isValidCableSize = (size) => {
  return CABLE_OD_MAP.hasOwnProperty(size);
};

/**
 * Get cable outer diameter
 * @param {string} size - Cable size
 * @returns {number|null} Outer diameter in mm or null if invalid
 */
const getCableOD = (size) => {
  return CABLE_OD_MAP[size] || null;
};

/**
 * Normalize cable size to ensure consistent format
 * @param {string} size - Cable size
 * @returns {string} Normalized cable size
 */
const normalizeCableSize = (size) => {
  if (!size) return size;
  const numSize = parseFloat(size);
  if (isNaN(numSize)) return size;
  return numSize.toString();
};

export {
  calculateTraySize,
  getAvailableCableSizes,
  getAvailableTraySizes,
  getAvailableTrayTypes,
  isValidCableSize,
  getCableOD,
  normalizeCableSize,
  CABLE_OD_MAP,
  TRAY_SIZES,
  TRAY_TYPES,
  DEFAULT_FILL_FACTOR,
};

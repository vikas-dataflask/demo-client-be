/**
 * Cable Sizing Calculator Utility
 * Calculates cable size, current, MCB rating, and voltage drop for lighting circuits
 */

// Cable resistance values (Ω/km) for different sizes
const CABLE_RESISTANCE = {
  '1.0': 18.1,
  '1.5': 12.1,
  '2.5': 7.41,
  '4.0': 4.61,
  '6.0': 3.08,
};

// Cable size mapping based on current
const CABLE_SIZE_MAPPING = [
  { maxCurrent: 6, size: "1.0" },
  { maxCurrent: 10, size: "1.5" },
  { maxCurrent: 16, size: "2.5" },
  { maxCurrent: 25, size: "4.0" },
  { maxCurrent: Infinity, size: "6.0" },
];

// MCB ratings available
const MCB_RATINGS = [6, 10, 16, 20, 25];

/**
 * Calculate cable size, current, MCB rating, and voltage drop
 * @param {number} loadWatts - Load in watts
 * @param {number} cableLengthMeters - Cable length in meters
 * @param {number} voltage - Voltage (default: 230V)
 * @returns {Object} Calculation results
 */
const calculateCableSize = (loadWatts, cableLengthMeters, voltage = 230) => {
  // Input validation
  if (!loadWatts || loadWatts <= 0) {
    throw new Error("Load watts must be a positive number");
  }

  if (!cableLengthMeters || cableLengthMeters <= 0) {
    throw new Error("Cable length must be a positive number");
  }

  if (!voltage || voltage <= 0) {
    throw new Error("Voltage must be a positive number");
  }

  // Calculate current (Amps)
  const current = loadWatts / voltage;

  // Determine cable size based on current
  let recommendedCableSize = "6.0";
  for (const mapping of CABLE_SIZE_MAPPING) {
    if (current <= mapping.maxCurrent) {
      recommendedCableSize = mapping.size;
      break;
    }
  }

  // Select MCB rating (nearest higher match)
  let mcb = "25A";
  for (const rating of MCB_RATINGS) {
    if (current <= rating) {
      mcb = `${rating}A`;
      break;
    }
  }

  // Calculate voltage drop
  const resistance = CABLE_RESISTANCE[recommendedCableSize];
  const voltageDrop = (2 * current * cableLengthMeters * resistance) / 1000;

  // Check if voltage drop is acceptable (3% of voltage)
  const voltageDropLimit = voltage * 0.03;
  const isDropAcceptable = voltageDrop <= voltageDropLimit;

  return {
    current: parseFloat(current.toFixed(2)),
    recommendedCableSize: `${recommendedCableSize} Sq.mm`,
    mcb,
    voltageDrop: parseFloat(voltageDrop.toFixed(2)),
    voltageDropLimit: parseFloat(voltageDropLimit.toFixed(2)),
    isDropAcceptable,
    voltageDropPercentage: parseFloat(
      ((voltageDrop / voltage) * 100).toFixed(2)
    ),
    calculations: {
      loadWatts,
      cableLengthMeters,
      voltage,
      resistance: parseFloat(resistance.toFixed(2)),
    },
  };
};

/**
 * Get all available cable sizes
 * @returns {Array} Array of cable sizes
 */
const getAvailableCableSizes = () => {
  return Object.keys(CABLE_RESISTANCE).map((size) => `${size} Sq.mm`);
};

/**
 * Get all available MCB ratings
 * @returns {Array} Array of MCB ratings
 */
const getAvailableMCBRatings = () => {
  return MCB_RATINGS.map((rating) => `${rating}A`);
};

/**
 * Validate cable size for a given current
 * @param {number} current - Current in amps
 * @param {string} cableSize - Cable size (e.g., "2.5 Sq.mm")
 * @returns {boolean} True if cable size is adequate
 */
const validateCableSize = (current, cableSize) => {
  const size = cableSize.replace(" Sq.mm", "");
  const mapping = CABLE_SIZE_MAPPING.find((m) => m.size === size);

  if (!mapping) {
    return false;
  }

  return current <= mapping.maxCurrent;
};

export {
  calculateCableSize,
  getAvailableCableSizes,
  getAvailableMCBRatings,
  validateCableSize,
  CABLE_RESISTANCE,
  CABLE_SIZE_MAPPING,
  MCB_RATINGS,
};

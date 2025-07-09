/**
 * Standard pipe capacity table for rainwater downpipe sizing
 * Based on British Standard BS EN 12056-3:2000
 * Capacities in liters per second (L/s)
 */
export const PIPE_CAPACITIES = [
  { diameter: 75, maxLps: 4, description: "75mm - Standard domestic" },
  { diameter: 100, maxLps: 8, description: "100mm - Medium capacity" },
  { diameter: 125, maxLps: 14, description: "125mm - High capacity" },
  { diameter: 150, maxLps: 21, description: "150mm - Commercial/Industrial" },
  { diameter: 200, maxLps: 35, description: "200mm - Large commercial" },
  { diameter: 250, maxLps: 55, description: "250mm - Industrial" },
  { diameter: 300, maxLps: 80, description: "300mm - Large industrial" },
];

/**
 * Default values for rainwater calculations
 */
export const DEFAULT_VALUES = {
  COEFFICIENT_DISCHARGE: 0.9, // Standard coefficient for roof drainage
  MIN_ROOF_AREA: 1, // Minimum roof area in m²
  MAX_ROOF_AREA: 10000, // Maximum roof area in m²
  MIN_RAINFALL_INTENSITY: 1, // Minimum rainfall intensity in mm/hr
  MAX_RAINFALL_INTENSITY: 500, // Maximum rainfall intensity in mm/hr
  MIN_PIPE_COUNT: 1, // Minimum number of pipes
  MAX_PIPE_COUNT: 50, // Maximum number of pipes
};

/**
 * Validation messages
 */
export const VALIDATION_MESSAGES = {
  ROOF_AREA_REQUIRED: "Roof area is required",
  ROOF_AREA_RANGE: `Roof area must be between ${DEFAULT_VALUES.MIN_ROOF_AREA} and ${DEFAULT_VALUES.MAX_ROOF_AREA} m²`,
  RAINFALL_INTENSITY_REQUIRED: "Rainfall intensity is required",
  RAINFALL_INTENSITY_RANGE: `Rainfall intensity must be between ${DEFAULT_VALUES.MIN_RAINFALL_INTENSITY} and ${DEFAULT_VALUES.MAX_RAINFALL_INTENSITY} mm/hr`,
  PIPE_COUNT_REQUIRED: "Number of pipes is required",
  PIPE_COUNT_RANGE: `Number of pipes must be between ${DEFAULT_VALUES.MIN_PIPE_COUNT} and ${DEFAULT_VALUES.MAX_PIPE_COUNT}`,
  PREFERRED_PIPE_SIZE_INVALID: "Invalid preferred pipe size",
};

/**
 * Get pipe capacity by diameter
 * @param {number} diameter - Pipe diameter in mm
 * @returns {object|null} Pipe capacity object or null if not found
 */
export const getPipeCapacity = (diameter) => {
  return PIPE_CAPACITIES.find((pipe) => pipe.diameter === diameter) || null;
};

/**
 * Get recommended pipe size based on discharge
 * @param {number} dischargeLps - Discharge in liters per second
 * @returns {object} Recommended pipe size and number of pipes needed
 */
export const getRecommendedPipeSize = (dischargeLps) => {
  // Find the smallest pipe that can handle the discharge
  const suitablePipe = PIPE_CAPACITIES.find(
    (pipe) => pipe.maxLps >= dischargeLps
  );

  if (!suitablePipe) {
    // If no single pipe can handle the discharge, calculate number of pipes needed
    const maxDischargePerPipe =
      PIPE_CAPACITIES[PIPE_CAPACITIES.length - 1].maxLps;
    const numberOfPipes = Math.ceil(dischargeLps / maxDischargePerPipe);
    return {
      diameter: PIPE_CAPACITIES[PIPE_CAPACITIES.length - 1].diameter,
      numberOfPipes,
      warning: `Discharge exceeds maximum single pipe capacity. ${numberOfPipes} pipes required.`,
    };
  }

  return {
    diameter: suitablePipe.diameter,
    numberOfPipes: 1,
    warning: null,
  };
};

/**
 * Validate preferred pipe size against discharge
 * @param {number} preferredDiameter - Preferred pipe diameter in mm
 * @param {number} dischargeLps - Discharge in liters per second
 * @returns {object} Validation result with recommendations
 */
export const validatePreferredPipeSize = (preferredDiameter, dischargeLps) => {
  const pipeCapacity = getPipeCapacity(preferredDiameter);

  if (!pipeCapacity) {
    return {
      isValid: false,
      warning: `Invalid pipe size: ${preferredDiameter}mm. Please select a standard size.`,
      recommendation: getRecommendedPipeSize(dischargeLps),
    };
  }

  if (pipeCapacity.maxLps < dischargeLps) {
    const recommendation = getRecommendedPipeSize(dischargeLps);
    return {
      isValid: false,
      warning: `${preferredDiameter}mm pipe insufficient. Required: ${dischargeLps.toFixed(
        2
      )} L/s, Available: ${pipeCapacity.maxLps} L/s`,
      recommendation,
    };
  }

  return {
    isValid: true,
    warning: null,
    recommendation: {
      diameter: preferredDiameter,
      numberOfPipes: 1,
      warning: null,
    },
  };
};

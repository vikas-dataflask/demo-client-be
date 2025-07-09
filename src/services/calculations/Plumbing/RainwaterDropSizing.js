import {
  PIPE_CAPACITIES,
  DEFAULT_VALUES,
  VALIDATION_MESSAGES,
  getRecommendedPipeSize,
  validatePreferredPipeSize,
} from "../../../utils/pipeCapacities.js";

/**
 * Calculate rainwater downpipe sizing based on roof area and rainfall intensity
 * @param {object} params - Input parameters
 * @param {number} params.roofAreaM2 - Roof area in square meters
 * @param {number} params.rainfallIntensityMmHr - Rainfall intensity in mm/hr
 * @param {number} [params.preferredPipeSize] - Preferred pipe diameter in mm (optional)
 * @param {number} [params.coefficientDischarge] - Coefficient of discharge (default: 0.9)
 * @returns {object} Calculation results
 */
export const calculateRainwaterDropSizing = ({
  roofAreaM2,
  rainfallIntensityMmHr,
  preferredPipeSize = null,
  coefficientDischarge = DEFAULT_VALUES.COEFFICIENT_DISCHARGE,
}) => {
  // Input validation
  if (!roofAreaM2 || roofAreaM2 <= 0) {
    throw new Error(VALIDATION_MESSAGES.ROOF_AREA_REQUIRED);
  }

  if (
    roofAreaM2 < DEFAULT_VALUES.MIN_ROOF_AREA ||
    roofAreaM2 > DEFAULT_VALUES.MAX_ROOF_AREA
  ) {
    throw new Error(VALIDATION_MESSAGES.ROOF_AREA_RANGE);
  }

  if (!rainfallIntensityMmHr || rainfallIntensityMmHr <= 0) {
    throw new Error(VALIDATION_MESSAGES.RAINFALL_INTENSITY_REQUIRED);
  }

  if (
    rainfallIntensityMmHr < DEFAULT_VALUES.MIN_RAINFALL_INTENSITY ||
    rainfallIntensityMmHr > DEFAULT_VALUES.MAX_RAINFALL_INTENSITY
  ) {
    throw new Error(VALIDATION_MESSAGES.RAINFALL_INTENSITY_RANGE);
  }

  if (coefficientDischarge <= 0 || coefficientDischarge > 1) {
    throw new Error("Coefficient of discharge must be between 0 and 1");
  }

  // Calculate discharge using the formula: Q = (A × R) / 3600
  // Where: A = roof area (m²), R = rainfall intensity (mm/hr)
  const dischargeLps =
    (roofAreaM2 * rainfallIntensityMmHr * coefficientDischarge) / 3600;

  // Get recommended pipe size based on discharge
  const recommendation = getRecommendedPipeSize(dischargeLps);

  // Validate preferred pipe size if provided
  let preferredPipeValidation = null;
  if (preferredPipeSize) {
    preferredPipeValidation = validatePreferredPipeSize(
      preferredPipeSize,
      dischargeLps
    );
  }

  // Calculate additional metrics
  const dischargeM3Hr = dischargeLps * 3.6; // Convert L/s to m³/hr
  const dischargeLpm = dischargeLps * 60; // Convert L/s to L/min

  // Calculate theoretical pipe diameter using Manning's formula (for reference)
  const theoreticalDiameterMm =
    Math.pow(
      (dischargeLps * 1000) / (0.084 * Math.sqrt(0.02)), // Assuming 2% slope
      2 / 5
    ) * 1000; // Convert to mm

  // Find the closest standard pipe size
  const closestPipeSize = PIPE_CAPACITIES.reduce((prev, curr) => {
    return Math.abs(curr.diameter - theoreticalDiameterMm) <
      Math.abs(prev.diameter - theoreticalDiameterMm)
      ? curr
      : prev;
  });

  return {
    // Input parameters
    roofAreaM2: parseFloat(roofAreaM2.toFixed(2)),
    rainfallIntensityMmHr: parseFloat(rainfallIntensityMmHr.toFixed(2)),
    coefficientDischarge: parseFloat(coefficientDischarge.toFixed(3)),

    // Calculated discharge values
    dischargeLps: parseFloat(dischargeLps.toFixed(3)),
    dischargeM3Hr: parseFloat(dischargeM3Hr.toFixed(2)),
    dischargeLpm: parseFloat(dischargeLpm.toFixed(1)),

    // Recommended pipe sizing
    recommendedPipeSize: recommendation.diameter,
    numberOfPipes: recommendation.numberOfPipes,
    warning: recommendation.warning,

    // Theoretical calculations
    theoreticalDiameterMm: parseFloat(theoreticalDiameterMm.toFixed(1)),
    closestStandardPipeSize: closestPipeSize.diameter,
    closestStandardCapacity: closestPipeSize.maxLps,

    // Preferred pipe validation (if provided)
    preferredPipeSize: preferredPipeSize,
    preferredPipeValidation: preferredPipeValidation,

    // Additional information
    calculationMethod: "British Standard BS EN 12056-3:2000",
    timestamp: new Date().toISOString(),
  };
};

/**
 * Legacy function for backward compatibility
 * @deprecated Use calculateRainwaterDropSizing instead
 */
export const calculateRainwaterDropSizingLegacy = ({
  roof_area_m2,
  num_pipes,
  intensity_rainfall_mm_h,
  coefficient_discharge_c,
}) => {
  if (
    !roof_area_m2 ||
    !num_pipes ||
    !intensity_rainfall_mm_h ||
    !coefficient_discharge_c
  ) {
    throw new Error("Missing required input values");
  }

  // Catchment area per pipe
  const catchment_area_per_pipe_m2 = roof_area_m2 / num_pipes;

  // Discharge flow (m³/hr)
  const discharge_flow_m3_hr =
    (10 *
      num_pipes *
      catchment_area_per_pipe_m2 *
      intensity_rainfall_mm_h *
      coefficient_discharge_c) /
    10000;

  // Pipe diameter (mm)
  const pipe_diameter_mm = Math.pow(
    (catchment_area_per_pipe_m2 * intensity_rainfall_mm_h) / 0.084,
    2 / 5
  );

  return {
    catchment_area_per_pipe_m2,
    discharge_flow_m3_hr,
    pipe_diameter_mm: parseFloat(pipe_diameter_mm.toFixed(2)),
  };
};

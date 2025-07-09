/**
 * Chiller Pressure Drop Calculator
 *
 * Calculates pressure drop across chiller heat exchangers using two methods:
 * 1. Data Mode: Rule-of-thumb estimation based on flow rate and tonnage
 * 2. Theoretical Mode: Darcy-Weisbach equation using flow velocity and pipe size
 *
 * @author HVAC Design System
 * @version 1.0.0
 */

/**
 * Calculate chiller pressure drop using specified mode
 * @param {Object} input - Input parameters
 * @param {number} input.chillerTonnage - Chiller capacity in tons (required for 'data' mode)
 * @param {number} input.flowRateLps - Flow rate in liters per second (required)
 * @param {number} input.pipeInnerDiameterMm - Pipe inner diameter in mm (required for 'theoretical' mode)
 * @param {number} input.fluidDensity - Fluid density in kg/m³ (default: 997 for water @25°C)
 * @param {number} input.fluidViscosity - Fluid viscosity in Pa.s (default: 0.00089 for water @25°C)
 * @param {string} mode - Calculation mode: 'data' or 'theoretical' (default: 'data')
 * @returns {Object} Calculation results with pressure drop in kPa
 */
function calculateChillerPressureDrop(input, mode = "data") {
  // Input validation
  const validationResult = validateInput(input, mode);
  if (!validationResult.isValid) {
    throw new Error(validationResult.error);
  }

  const {
    chillerTonnage,
    flowRateLps,
    pipeInnerDiameterMm,
    fluidDensity = 997, // Water at 25°C
    fluidViscosity = 0.00089, // Water at 25°C
  } = input;

  if (mode === "data") {
    return calculateDataMode(flowRateLps, chillerTonnage);
  } else if (mode === "theoretical") {
    return calculateTheoreticalMode(
      flowRateLps,
      pipeInnerDiameterMm,
      fluidDensity,
      fluidViscosity
    );
  } else {
    throw new Error(`Invalid mode: ${mode}. Must be 'data' or 'theoretical'`);
  }
}

/**
 * Validate input parameters based on calculation mode
 * @param {Object} input - Input parameters
 * @param {string} mode - Calculation mode
 * @returns {Object} Validation result
 */
function validateInput(input, mode) {
  const { chillerTonnage, flowRateLps, pipeInnerDiameterMm } = input;

  // Check required flow rate
  if (!flowRateLps || flowRateLps <= 0) {
    return {
      isValid: false,
      error: "Flow rate (flowRateLps) is required and must be positive",
    };
  }

  // Mode-specific validation
  if (mode === "data") {
    if (!chillerTonnage || chillerTonnage <= 0) {
      return {
        isValid: false,
        error: "Chiller tonnage is required for data mode and must be positive",
      };
    }
  } else if (mode === "theoretical") {
    if (!pipeInnerDiameterMm || pipeInnerDiameterMm <= 0) {
      return {
        isValid: false,
        error:
          "Pipe inner diameter is required for theoretical mode and must be positive",
      };
    }
  }

  return { isValid: true };
}

/**
 * Calculate pressure drop using data mode (rule-of-thumb)
 * @param {number} flowRateLps - Flow rate in L/s
 * @param {number} chillerTonnage - Chiller capacity in tons
 * @returns {Object} Calculation results
 */
function calculateDataMode(flowRateLps, chillerTonnage) {
  // Rule-of-thumb: pressure drop = 0.4 × flow rate (L/s)
  // This gives reasonable estimates for typical chiller applications
  const estimatedDropKpa = 0.4 * flowRateLps;

  // Validate against typical ranges (30-80 kPa for most applications)
  const minExpectedKpa = 30;
  const maxExpectedKpa = 80;

  let warning = null;
  if (estimatedDropKpa < minExpectedKpa) {
    warning = `Estimated pressure drop (${estimatedDropKpa.toFixed(
      1
    )} kPa) is below typical minimum (${minExpectedKpa} kPa). Consider verifying system design.`;
  } else if (estimatedDropKpa > maxExpectedKpa) {
    warning = `Estimated pressure drop (${estimatedDropKpa.toFixed(
      1
    )} kPa) is above typical maximum (${maxExpectedKpa} kPa). Consider verifying system design.`;
  }

  return {
    mode: "data",
    estimatedDropKpa: Math.round(estimatedDropKpa * 10) / 10, // Round to 1 decimal
    flowRateLps,
    chillerTonnage,
    assumptionsUsed: {
      method: "Rule-of-thumb estimation",
      formula: "Pressure Drop (kPa) = 0.4 × Flow Rate (L/s)",
      typicalRange: `${minExpectedKpa}-${maxExpectedKpa} kPa`,
      notes: "Based on typical chiller heat exchanger characteristics",
    },
    warning,
    units: {
      pressureDrop: "kPa",
      flowRate: "L/s",
      tonnage: "tons",
    },
  };
}

/**
 * Calculate pressure drop using theoretical mode (Darcy-Weisbach)
 * @param {number} flowRateLps - Flow rate in L/s
 * @param {number} pipeInnerDiameterMm - Pipe inner diameter in mm
 * @param {number} fluidDensity - Fluid density in kg/m³
 * @param {number} fluidViscosity - Fluid viscosity in Pa.s
 * @returns {Object} Calculation results
 */
function calculateTheoreticalMode(
  flowRateLps,
  pipeInnerDiameterMm,
  fluidDensity,
  fluidViscosity
) {
  // Convert units
  const flowRateM3s = flowRateLps / 1000; // Convert L/s to m³/s
  const pipeDiameterM = pipeInnerDiameterMm / 1000; // Convert mm to m
  const pipeRadiusM = pipeDiameterM / 2;

  // Calculate pipe cross-sectional area
  const pipeAreaM2 = Math.PI * Math.pow(pipeRadiusM, 2);

  // Calculate flow velocity
  const velocityMs = flowRateM3s / pipeAreaM2;

  // Darcy-Weisbach parameters
  const chillerLengthM = 10; // Typical chiller heat exchanger length
  const frictionFactor = 0.02; // Clean pipe assumption

  // Calculate Reynolds number for validation
  const reynoldsNumber =
    (fluidDensity * velocityMs * pipeDiameterM) / fluidViscosity;

  // Darcy-Weisbach equation: ΔP = f × (L/D) × (ρv²/2)
  const pressureDropPa =
    frictionFactor *
    (chillerLengthM / pipeDiameterM) *
    ((fluidDensity * Math.pow(velocityMs, 2)) / 2);

  // Convert to kPa
  const pressureDropKpa = pressureDropPa / 1000;

  // Validate Reynolds number (should be turbulent for accurate friction factor)
  let warning = null;
  if (reynoldsNumber < 4000) {
    warning = `Reynolds number (${reynoldsNumber.toFixed(
      0
    )}) indicates laminar flow. Friction factor assumption may not be accurate.`;
  } else if (reynoldsNumber > 100000) {
    warning = `Reynolds number (${reynoldsNumber.toFixed(
      0
    )}) is very high. Consider checking for potential cavitation.`;
  }

  return {
    mode: "theoretical",
    estimatedDropKpa: Math.round(pressureDropKpa * 10) / 10, // Round to 1 decimal
    velocity: Math.round(velocityMs * 100) / 100, // Round to 2 decimals
    reynoldsNumber: Math.round(reynoldsNumber),
    flowRateLps,
    pipeInnerDiameterMm,
    fluidDensity,
    fluidViscosity,
    assumptionsUsed: {
      method: "Darcy-Weisbach equation",
      formula: "ΔP = f × (L/D) × (ρv²/2)",
      chillerLength: `${chillerLengthM} m`,
      frictionFactor: frictionFactor,
      flowRegime: reynoldsNumber > 4000 ? "Turbulent" : "Laminar",
    },
    warning,
    units: {
      pressureDrop: "kPa",
      velocity: "m/s",
      flowRate: "L/s",
      pipeDiameter: "mm",
      fluidDensity: "kg/m³",
      fluidViscosity: "Pa.s",
    },
  };
}

/**
 * Get default fluid properties for common HVAC fluids
 * @param {string} fluidType - Fluid type ('water', 'glycol_30', 'glycol_50')
 * @param {number} temperatureC - Temperature in Celsius (default: 25)
 * @returns {Object} Fluid properties
 */
function getFluidProperties(fluidType = "water", temperatureC = 25) {
  const properties = {
    water: {
      25: { density: 997, viscosity: 0.00089 },
      10: { density: 999.7, viscosity: 0.00131 },
      40: { density: 992.2, viscosity: 0.00065 },
    },
    glycol_30: {
      25: { density: 1030, viscosity: 0.0024 },
      10: { density: 1035, viscosity: 0.0042 },
      40: { density: 1020, viscosity: 0.0015 },
    },
    glycol_50: {
      25: { density: 1060, viscosity: 0.0045 },
      10: { density: 1065, viscosity: 0.008 },
      40: { density: 1050, viscosity: 0.0028 },
    },
  };

  const fluid = properties[fluidType];
  if (!fluid) {
    throw new Error(`Unsupported fluid type: ${fluidType}`);
  }

  // Find closest temperature or use 25°C as default
  const temp = fluid[temperatureC] ? temperatureC : 25;

  return {
    fluidDensity: fluid[temp].density,
    fluidViscosity: fluid[temp].viscosity,
    temperatureC: temp,
    fluidType,
  };
}

export { calculateChillerPressureDrop, getFluidProperties, validateInput };

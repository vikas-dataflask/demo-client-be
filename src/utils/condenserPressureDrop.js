/**
 * Condenser Pressure Drop Calculator (PA VERSION)
 *
 * Calculates pressure drop across condenser water system sections using:
 * 1. Data Mode: Rule-of-thumb estimation based on flow rate and tonnage
 * 2. Theoretical Mode: Darcy-Weisbach equation using flow velocity and pipe size
 *
 * Includes user input for:
 * - System Loss
 * - Pipe Friction Loss
 * - Cooling Tower Loss (EXTRA for condenser system)
 * - Fitting Loss (calculated separately)
 *
 * @version 1.0.0
 */

/**
 * Calculate condenser pressure drop using specified mode
 * @param {Object} input - Input parameters
 * @param {number} input.chillerTonnage - Condenser capacity in tons (required for 'data' mode)
 * @param {number} input.flowRateLps - Flow rate in liters per second (required)
 * @param {number} input.pipeInnerDiameterMm - Pipe inner diameter in mm (required for 'theoretical' mode)
 * @param {number} input.fluidDensity - Fluid density in kg/m³ (default: 997 for water @25°C)
 * @param {number} input.fluidViscosity - Fluid viscosity in Pa.s (default: 0.00089 for water @25°C)
 * @param {number} input.systemLoss - System loss in Pa (user input)
 * @param {number} input.pipeFrictionLoss - Pipe friction loss in Pa (user input)
 * @param {number} input.coolingTowerLoss - Cooling Tower loss in Pa (EXTRA FIELD)
 * @param {number} input.fittingLossPa - Fitting loss in Pa (sum of all fitting losses)
 * @param {string} mode - Calculation mode: 'data' or 'theoretical' (default: 'data')
 * @returns {Object} Calculation results with pressure drop in Pa
 */
function calculateCondenserPressureDrop(input, mode = "data") {
  const validationResult = validateCondenserInput(input, mode);
  if (!validationResult.isValid) {
    throw new Error(validationResult.error);
  }

  const {
    chillerTonnage,
    flowRateLps,
    pipeInnerDiameterMm,
    fluidDensity = 997,
    fluidViscosity = 0.00089,
    systemLoss = 0,
    pipeFrictionLoss = 0,
    coolingTowerLoss = 0, // ✅ NEW
    fittingLossPa = 0,
  } = input;

  let baseResult;
  if (mode === "data") {
    baseResult = calculateCondenserDataMode(flowRateLps, chillerTonnage);
  } else if (mode === "theoretical") {
    baseResult = calculateCondenserTheoreticalMode(
      flowRateLps,
      pipeInnerDiameterMm,
      fluidDensity,
      fluidViscosity
    );
  } else {
    throw new Error(`Invalid mode: ${mode}. Must be 'data' or 'theoretical'`);
  }

  // Total pressure drop (Pa)
  const totalPressureDropPa =
    systemLoss + pipeFrictionLoss + coolingTowerLoss + fittingLossPa;

  return {
    ...baseResult,
    systemLoss,
    pipeFrictionLoss,
    coolingTowerLoss, // ✅ NEW
    fittingLossPa,
    totalPressureDropPa: Math.round(totalPressureDropPa * 100) / 100,
    units: {
      pressureDrop: "Pa",
      flowRate: "L/s",
      tonnage: "tons",
    },
  };
}

/**
 * Validate input parameters based on calculation mode
 */
function validateCondenserInput(input, mode) {
  const { chillerTonnage, flowRateLps, pipeInnerDiameterMm } = input;

  if (!flowRateLps || flowRateLps <= 0) {
    return {
      isValid: false,
      error: "Flow rate (flowRateLps) is required and must be positive",
    };
  }

  if (mode === "data") {
    if (!chillerTonnage || chillerTonnage <= 0) {
      return {
        isValid: false,
        error:
          "Condenser tonnage is required for data mode and must be positive",
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
 * Data Mode: Rule-of-thumb estimation (now in Pa)
 */
function calculateCondenserDataMode(flowRateLps, chillerTonnage) {
  // Rule-of-thumb: pressure drop = 0.4 × flow rate (L/s) in kPa → convert to Pa
  const estimatedDropPa = 0.4 * flowRateLps * 1000;

  const minExpectedPa = 30 * 1000;
  const maxExpectedPa = 80 * 1000;

  let warning = null;
  if (estimatedDropPa < minExpectedPa) {
    warning = `Estimated pressure drop (${estimatedDropPa.toFixed(
      0
    )} Pa) is below typical minimum (${minExpectedPa} Pa). Check system design.`;
  } else if (estimatedDropPa > maxExpectedPa) {
    warning = `Estimated pressure drop (${estimatedDropPa.toFixed(
      0
    )} Pa) exceeds typical maximum (${maxExpectedPa} Pa). Check system design.`;
  }

  return {
    mode: "data",
    estimatedDropPa: Math.round(estimatedDropPa * 100) / 100,
    flowRateLps,
    chillerTonnage,
    assumptionsUsed: {
      method: "Rule-of-thumb estimation",
      formula: "Pressure Drop (Pa) = 0.4 × Flow Rate (L/s) × 1000",
      typicalRange: `${minExpectedPa}-${maxExpectedPa} Pa`,
    },
    warning,
    units: {
      pressureDrop: "Pa",
      flowRate: "L/s",
      tonnage: "tons",
    },
  };
}

/**
 * Theoretical Mode: Darcy-Weisbach (Pa)
 */
function calculateCondenserTheoreticalMode(
  flowRateLps,
  pipeInnerDiameterMm,
  fluidDensity,
  fluidViscosity
) {
  const flowRateM3s = flowRateLps / 1000;
  const pipeDiameterM = pipeInnerDiameterMm / 1000;
  const pipeRadiusM = pipeDiameterM / 2;

  const pipeAreaM2 = Math.PI * Math.pow(pipeRadiusM, 2);
  const velocityMs = flowRateM3s / pipeAreaM2;

  const condenserLengthM = 10; // Typical condenser heat exchanger length
  const frictionFactor = 0.02;

  const reynoldsNumber =
    (fluidDensity * velocityMs * pipeDiameterM) / fluidViscosity;

  const pressureDropPa =
    frictionFactor *
    (condenserLengthM / pipeDiameterM) *
    ((fluidDensity * Math.pow(velocityMs, 2)) / 2);

  let warning = null;
  if (reynoldsNumber < 4000) {
    warning = `Reynolds number (${reynoldsNumber.toFixed(
      0
    )}) indicates laminar flow. Friction factor may not be accurate.`;
  } else if (reynoldsNumber > 100000) {
    warning = `Reynolds number (${reynoldsNumber.toFixed(
      0
    )}) is very high. Check for potential cavitation.`;
  }

  return {
    mode: "theoretical",
    estimatedDropPa: Math.round(pressureDropPa * 100) / 100,
    velocity: Math.round(velocityMs * 100) / 100,
    reynoldsNumber: Math.round(reynoldsNumber),
    flowRateLps,
    pipeInnerDiameterMm,
    fluidDensity,
    fluidViscosity,
    assumptionsUsed: {
      method: "Darcy-Weisbach equation",
      formula: "ΔP (Pa) = f × (L/D) × (ρv²/2)",
      condenserLength: `${condenserLengthM} m`,
      frictionFactor: frictionFactor,
      flowRegime: reynoldsNumber > 4000 ? "Turbulent" : "Laminar",
    },
    warning,
    units: {
      pressureDrop: "Pa",
      velocity: "m/s",
      flowRate: "L/s",
      pipeDiameter: "mm",
      fluidDensity: "kg/m³",
      fluidViscosity: "Pa.s",
    },
  };
}

export {
  calculateCondenserPressureDrop,
  validateCondenserInput,
  calculateCondenserDataMode,
  calculateCondenserTheoreticalMode,
};

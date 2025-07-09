/**
 * Fire Fighting Piping Loop Head Loss Calculator
 * Uses Hazen-Williams equation: h_f = 10.67 × (L / C^1.852) × (Q^1.852 / D^4.87)
 *
 * @param {Object} params - Input parameters
 * @param {number} params.pipeLength - Pipe length in meters
 * @param {number} params.flowRate - Flow rate (L/min or L/s based on flowRateUnit)
 * @param {string} params.flowRateUnit - 'L/min' or 'L/s' (default: 'L/min')
 * @param {number} params.pipeDiameter - Pipe internal diameter in mm
 * @param {string} params.pipeMaterial - Pipe material for Hazen-Williams coefficient
 * @param {Object} params.fittings - Fitting counts by type
 * @param {number} params.staticElevation - Static elevation difference in meters (positive for uphill)
 * @param {number} params.requiredPressure - Required outlet pressure in bar
 * @returns {Object} Calculation results
 */

// Hazen-Williams coefficients for different pipe materials
const HAZEN_WILLIAMS_COEFFICIENTS = {
  Steel: 120,
  "Cast Iron": 100,
  "Galvanized Iron": 120,
  GI: 120,
  CI: 100,
  PVC: 150,
  HDPE: 150,
  Copper: 130,
  Brass: 130,
  "Asbestos Cement": 140,
  Concrete: 130,
  "Ductile Iron": 120,
};

// Equivalent length factors for fittings (in pipe diameters)
const FITTING_EQUIVALENT_LENGTHS = {
  "90° Elbow": 30,
  "45° Elbow": 16,
  "Tee (through)": 20,
  "Tee (branch)": 60,
  "Gate Valve (open)": 8,
  "Gate Valve (3/4)": 35,
  "Gate Valve (1/2)": 160,
  "Globe Valve": 340,
  "Check Valve": 100,
  "Butterfly Valve": 40,
  "Ball Valve": 3,
  "Reducer (2:1)": 15,
  "Enlargement (1:2)": 20,
  "Entrance (sharp)": 30,
  "Entrance (rounded)": 10,
  Exit: 20,
};

/**
 * Calculate fire fighting piping loop head loss
 * @param {Object} params - Input parameters
 * @returns {Object} Calculation results
 */
function calculateFireLoopHeadLoss(params) {
  try {
    // Input validation
    const {
      pipeLength = 0,
      flowRate = 0,
      flowRateUnit = "L/min",
      pipeDiameter = 0,
      pipeMaterial = "Steel",
      fittings = {},
      staticElevation = 0,
      requiredPressure = 0,
    } = params;

    // Validate required inputs
    if (pipeLength <= 0) {
      throw new Error("Pipe length must be greater than 0");
    }
    if (flowRate <= 0) {
      throw new Error("Flow rate must be greater than 0");
    }
    if (pipeDiameter <= 0) {
      throw new Error("Pipe diameter must be greater than 0");
    }
    if (!HAZEN_WILLIAMS_COEFFICIENTS[pipeMaterial]) {
      throw new Error(
        `Unsupported pipe material: ${pipeMaterial}. Supported materials: ${Object.keys(
          HAZEN_WILLIAMS_COEFFICIENTS
        ).join(", ")}`
      );
    }

    // Get Hazen-Williams coefficient
    const C = HAZEN_WILLIAMS_COEFFICIENTS[pipeMaterial];

    // Convert flow rate to L/s if needed
    const flowRateLps = flowRateUnit === "L/min" ? flowRate / 60 : flowRate;

    // Convert pipe diameter from mm to meters
    const D = pipeDiameter / 1000;

    // Calculate equivalent length for fittings
    let fittingsEquivalentLength = 0;
    const fittingsDetails = [];

    for (const [fittingType, count] of Object.entries(fittings)) {
      if (count > 0 && FITTING_EQUIVALENT_LENGTHS[fittingType]) {
        const equivalentLength =
          FITTING_EQUIVALENT_LENGTHS[fittingType] * D * count;
        fittingsEquivalentLength += equivalentLength;
        fittingsDetails.push({
          type: fittingType,
          count: count,
          equivalentLength: equivalentLength,
          equivalentLengthPerFitting:
            FITTING_EQUIVALENT_LENGTHS[fittingType] * D,
        });
      }
    }

    // Calculate total equivalent length
    const totalEquivalentLength = pipeLength + fittingsEquivalentLength;

    // Calculate friction head loss using Hazen-Williams equation
    // h_f = 10.67 × (L / C^1.852) × (Q^1.852 / D^4.87)
    const frictionHeadLoss =
      (10.67 *
        (totalEquivalentLength / Math.pow(C, 1.852)) *
        Math.pow(flowRateLps, 1.852)) /
      Math.pow(D, 4.87);

    // Calculate static head (elevation difference)
    const staticHead = staticElevation;

    // Calculate required pressure head (1 bar = 10.2 meters of water)
    const pressureHead = requiredPressure * 10.2;

    // Calculate total head required
    const totalHead = frictionHeadLoss + staticHead + pressureHead;

    // Convert total head to pump pressure (bar)
    const pumpPressure = totalHead / 10.2;

    // Calculate velocity (Q = A × v, where A = π × D²/4)
    const pipeArea = (Math.PI * Math.pow(D, 2)) / 4; // m²
    const velocity = flowRateLps / 1000 / pipeArea; // m/s

    // Calculate Reynolds number for validation (Re = v × D / ν, where ν = 1.006 × 10⁻⁶ m²/s for water at 20°C)
    const kinematicViscosity = 1.006e-6; // m²/s for water at 20°C
    const reynoldsNumber = (velocity * D) / kinematicViscosity;

    return {
      // Input parameters
      input: {
        pipeLength,
        flowRate,
        flowRateUnit,
        pipeDiameter,
        pipeMaterial,
        fittings,
        staticElevation,
        requiredPressure,
      },

      // Intermediate calculations
      intermediate: {
        hazensWilliamsCoefficient: C,
        flowRateLps,
        pipeDiameterM: D,
        pipeArea,
        velocity,
        reynoldsNumber,
        fittingsEquivalentLength,
        totalEquivalentLength,
        fittingsDetails,
      },

      // Head loss components
      headLoss: {
        frictionHeadLoss: parseFloat(frictionHeadLoss.toFixed(3)),
        staticHead: parseFloat(staticHead.toFixed(3)),
        pressureHead: parseFloat(pressureHead.toFixed(3)),
        totalHead: parseFloat(totalHead.toFixed(3)),
      },

      // Pressure results
      pressure: {
        pumpPressure: parseFloat(pumpPressure.toFixed(3)),
        totalPressureBar: parseFloat(pumpPressure.toFixed(3)),
      },

      // Validation
      validation: {
        isLaminar: reynoldsNumber < 2300,
        isTurbulent: reynoldsNumber > 4000,
        reynoldsNumber: parseFloat(reynoldsNumber.toFixed(0)),
        hazensWilliamsApplicable: reynoldsNumber > 4000, // Hazen-Williams is valid for turbulent flow
      },

      // Units
      units: {
        length: "meters",
        flowRate: "L/s",
        diameter: "meters",
        head: "meters",
        pressure: "bar",
        velocity: "m/s",
      },
    };
  } catch (error) {
    throw new Error(`Fire loop head loss calculation failed: ${error.message}`);
  }
}

/**
 * Calculate equivalent length for a specific fitting
 * @param {string} fittingType - Type of fitting
 * @param {number} pipeDiameter - Pipe diameter in mm
 * @returns {number} Equivalent length in meters
 */
function getFittingEquivalentLength(fittingType, pipeDiameter) {
  const D = pipeDiameter / 1000; // Convert to meters
  return FITTING_EQUIVALENT_LENGTHS[fittingType]
    ? FITTING_EQUIVALENT_LENGTHS[fittingType] * D
    : 0;
}

/**
 * Get available pipe materials
 * @returns {Array} Array of available pipe materials
 */
function getAvailablePipeMaterials() {
  return Object.keys(HAZEN_WILLIAMS_COEFFICIENTS);
}

/**
 * Get available fitting types
 * @returns {Array} Array of available fitting types
 */
function getAvailableFittingTypes() {
  return Object.keys(FITTING_EQUIVALENT_LENGTHS);
}

export {
  calculateFireLoopHeadLoss,
  getFittingEquivalentLength,
  getAvailablePipeMaterials,
  getAvailableFittingTypes,
  HAZEN_WILLIAMS_COEFFICIENTS,
  FITTING_EQUIVALENT_LENGTHS,
};

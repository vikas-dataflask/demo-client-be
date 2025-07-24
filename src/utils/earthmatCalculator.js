/**
 * Earthmat/Grid Earthing Calculator
 * Based on IEEE 80 and IS 3043 standards
 * Calculates grid resistance, touch voltage, and conductor sizing
 */

// Material constants for conductor sizing
const MATERIAL_CONSTANTS = {
  GI: {
    k: 80, // Thermal capacity factor for GI
    resistivity: 1.7e-7, // Resistivity in ohm-meters
    name: "Galvanized Iron",
  },
  Cu: {
    k: 143, // Thermal capacity factor for Copper
    resistivity: 1.7e-8, // Resistivity in ohm-meters
    name: "Copper",
  },
};

// Default grid spacing (meters)
const DEFAULT_GRID_SPACING = 7.5;

/**
 * Calculate Earthmat/Grid Earthing parameters
 * @param {Object} params - Input parameters
 * @param {number} params.faultCurrent - Fault current in Amps
 * @param {number} params.faultDuration - Fault duration in seconds
 * @param {number} params.soilResistivity - Soil resistivity in ohm-meters
 * @param {Object} params.gridArea - Grid area dimensions
 * @param {number} params.gridArea.length - Grid length in meters
 * @param {number} params.gridArea.width - Grid width in meters
 * @param {number} params.burialDepth - Burial depth in meters
 * @param {number} params.rodDepth - Rod depth in meters
 * @param {number} params.numberOfRods - Number of vertical rods
 * @param {string} params.material - Conductor material ("GI" or "Cu")
 * @param {number} [params.gridSpacing] - Optional grid spacing in meters
 * @returns {Object} Calculation results
 */
const calculateEarthmat = (params) => {
  try {
    // Input validation
    const validation = validateInputs(params);
    if (!validation.isValid) {
      throw new Error(validation.error);
    }

    const {
      faultCurrent,
      faultDuration,
      soilResistivity,
      gridArea,
      burialDepth,
      rodDepth,
      numberOfRods,
      material,
      gridSpacing = DEFAULT_GRID_SPACING,
    } = params;

    const materialProps = MATERIAL_CONSTANTS[material];
    if (!materialProps) {
      throw new Error(`Invalid material: ${material}. Use 'GI' or 'Cu'`);
    }

    // 1. Calculate Permissible Touch Voltage (IEEE 80)
    const permissibleTouchVoltage = calculatePermissibleTouchVoltage(
      faultDuration,
      soilResistivity
    );

    // 2. Calculate Grid Geometry
    const gridGeometry = calculateGridGeometry(gridArea, gridSpacing);

    // 3. Calculate Grid Resistance
    const gridResistance = calculateGridResistance(
      soilResistivity,
      gridGeometry.totalLength,
      gridArea,
      burialDepth,
      numberOfRods,
      rodDepth
    );

    // 4. Calculate Actual Touch Voltage
    const actualTouchVoltage = faultCurrent * gridResistance;

    // 5. Calculate Required Conductor Size
    const requiredConductorSize = calculateConductorSize(
      faultCurrent,
      faultDuration,
      materialProps.k
    );

    // 6. Determine Safety Status
    const isSafe = actualTouchVoltage <= permissibleTouchVoltage;

    // 7. Generate Recommendations
    const recommendation = generateRecommendation(
      isSafe,
      actualTouchVoltage,
      permissibleTouchVoltage,
      gridGeometry,
      numberOfRods
    );

    return {
      success: true,
      data: {
        // Input parameters (for reference)
        input: {
          faultCurrent,
          faultDuration,
          soilResistivity,
          gridArea,
          burialDepth,
          rodDepth,
          numberOfRods,
          material,
          gridSpacing,
        },

        // Calculated results
        permissibleTouchVoltage: parseFloat(permissibleTouchVoltage.toFixed(1)),
        actualTouchVoltage: parseFloat(actualTouchVoltage.toFixed(1)),
        gridResistance: parseFloat(gridResistance.toFixed(4)),
        requiredConductorSize: `${requiredConductorSize} mm² ${material}`,
        conductorSize: requiredConductorSize,
        material: materialProps.name,

        // Grid geometry
        gridGeometry: {
          totalLength: parseFloat(gridGeometry.totalLength.toFixed(1)),
          perimeter: parseFloat(gridGeometry.perimeter.toFixed(1)),
          internalLength: parseFloat(gridGeometry.internalLength.toFixed(1)),
          gridSpacing: gridSpacing,
          area: parseFloat(gridGeometry.area.toFixed(1)),
        },

        // Safety assessment
        isSafe,
        safetyMargin: parseFloat(
          (
            ((permissibleTouchVoltage - actualTouchVoltage) /
              permissibleTouchVoltage) *
            100
          ).toFixed(1)
        ),
        recommendation,

        // Additional calculations
        calculations: {
          permissibleTouchVoltage,
          actualTouchVoltage,
          gridResistance,
          requiredConductorSize,
        },
      },
    };
  } catch (error) {
    return {
      success: false,
      error: error.message,
      data: null,
    };
  }
};

/**
 * Validate input parameters
 */
const validateInputs = (params) => {
  const required = [
    "faultCurrent",
    "faultDuration",
    "soilResistivity",
    "gridArea",
    "burialDepth",
    "rodDepth",
    "numberOfRods",
    "material",
  ];

  for (const field of required) {
    if (!params[field]) {
      return { isValid: false, error: `Missing required field: ${field}` };
    }
  }

  if (params.faultCurrent <= 0) {
    return { isValid: false, error: "Fault current must be positive" };
  }

  if (params.faultDuration <= 0) {
    return { isValid: false, error: "Fault duration must be positive" };
  }

  if (params.soilResistivity <= 0) {
    return { isValid: false, error: "Soil resistivity must be positive" };
  }

  if (params.gridArea.length <= 0 || params.gridArea.width <= 0) {
    return { isValid: false, error: "Grid dimensions must be positive" };
  }

  if (params.burialDepth <= 0) {
    return { isValid: false, error: "Burial depth must be positive" };
  }

  if (params.rodDepth <= 0) {
    return { isValid: false, error: "Rod depth must be positive" };
  }

  if (params.numberOfRods <= 0) {
    return { isValid: false, error: "Number of rods must be positive" };
  }

  if (!["GI", "Cu"].includes(params.material)) {
    return { isValid: false, error: 'Material must be "GI" or "Cu"' };
  }

  return { isValid: true };
};

/**
 * Calculate permissible touch voltage (IEEE 80)
 */
const calculatePermissibleTouchVoltage = (faultDuration, soilResistivity) => {
  // IEEE 80 formula for permissible touch voltage
  const sqrtT = Math.sqrt(faultDuration);
  const sqrtRho = Math.sqrt(soilResistivity);

  // V_touch = (116 + 0.174 * ρ) / sqrt(t)
  // Simplified version for typical applications
  return (116 * sqrtT) / (1 + 0.116 * sqrtRho);
};

/**
 * Calculate grid geometry and total conductor length
 */
const calculateGridGeometry = (gridArea, gridSpacing) => {
  const { length, width } = gridArea;
  const area = length * width;

  // Perimeter length
  const perimeter = 2 * (length + width);

  // Internal mesh length (approximate)
  const rows = Math.ceil(length / gridSpacing);
  const cols = Math.ceil(width / gridSpacing);
  const internalLength = rows * width + cols * length;

  // Total conductor length
  const totalLength = perimeter + internalLength;

  return {
    area,
    perimeter,
    internalLength,
    totalLength,
    rows,
    cols,
  };
};

/**
 * Calculate grid resistance
 */
const calculateGridResistance = (
  soilResistivity,
  totalLength,
  gridArea,
  burialDepth,
  numberOfRods,
  rodDepth
) => {
  const { length, width } = gridArea;
  const area = length * width;

  // Basic grid resistance formula (simplified)
  // R_g ≈ ρ / (4 * L_total)
  let gridResistance = soilResistivity / (4 * totalLength);

  // Add effect of vertical rods
  if (numberOfRods > 0) {
    const rodResistance =
      soilResistivity / (2 * Math.PI * rodDepth * numberOfRods);
    // Parallel combination of grid and rods
    gridResistance =
      (gridResistance * rodResistance) / (gridResistance + rodResistance);
  }

  return gridResistance;
};

/**
 * Calculate required conductor size
 */
const calculateConductorSize = (faultCurrent, faultDuration, k) => {
  // A = I * sqrt(t) / k
  const area = (faultCurrent * Math.sqrt(faultDuration)) / k;

  // Round up to nearest standard size
  const standardSizes = [
    16, 25, 35, 50, 70, 95, 120, 150, 185, 240, 300, 400, 500, 630, 800, 1000,
  ];

  for (const size of standardSizes) {
    if (size >= area) {
      return size;
    }
  }

  return Math.ceil(area);
};

/**
 * Generate recommendations based on safety assessment
 */
const generateRecommendation = (
  isSafe,
  actualTouchVoltage,
  permissibleTouchVoltage,
  gridGeometry,
  numberOfRods
) => {
  if (isSafe) {
    return "Grid design meets safety requirements. No changes needed.";
  }

  const recommendations = [];

  if (actualTouchVoltage > permissibleTouchVoltage * 1.5) {
    recommendations.push(
      "Significant safety margin exceeded. Consider reducing grid spacing."
    );
  }

  if (gridGeometry.totalLength < 100) {
    recommendations.push(
      "Increase grid conductor length for better distribution."
    );
  }

  if (numberOfRods < 10) {
    recommendations.push("Add more vertical rods to reduce resistance.");
  }

  if (recommendations.length === 0) {
    recommendations.push("Reduce grid spacing or increase conductor length.");
  }

  return recommendations.join(" ");
};

/**
 * Get available conductor materials
 */
const getAvailableMaterials = () => {
  return Object.keys(MATERIAL_CONSTANTS).map((key) => ({
    value: key,
    label: MATERIAL_CONSTANTS[key].name,
    k: MATERIAL_CONSTANTS[key].k,
  }));
};

/**
 * Get standard conductor sizes
 */
const getStandardConductorSizes = () => {
  return [
    16, 25, 35, 50, 70, 95, 120, 150, 185, 240, 300, 400, 500, 630, 800, 1000,
  ];
};

/**
 * Mock API response for testing
 */
const mockEarthmatAPI = async (params) => {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 500));

  const result = calculateEarthmat(params);

  return {
    success: true,
    data: result.data,
    message: result.success
      ? "Earthmat calculation completed successfully"
      : "Calculation failed",
  };
};

export {
  calculateEarthmat,
  getAvailableMaterials,
  getStandardConductorSizes,
  mockEarthmatAPI,
  MATERIAL_CONSTANTS,
};

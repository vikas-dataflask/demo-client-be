/**
 * Water Supply Pipe Sizing Calculator using Fixture Units (FU)
 * Based on IPC (International Plumbing Code) and NBC (National Building Code) standards
 *
 * @author Plumbing Design System
 * @version 2.0.0
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load fixture unit configuration
const configData = JSON.parse(
  fs.readFileSync(path.join(__dirname, "fixtureUnitConfig.json"), "utf8")
);

// Extract fixture units from nested structure
const fixtureConfig = configData.fixtureUnits;

// Fixture Unit to Flow Rate conversion table (IPC/NBC standards)
const FU_TO_FLOW_LPM = [
  { fu: 1, lpm: 8 },
  { fu: 2, lpm: 12 },
  { fu: 3, lpm: 15 },
  { fu: 4, lpm: 18 },
  { fu: 5, lpm: 20 },
  { fu: 6, lpm: 22 },
  { fu: 7, lpm: 24 },
  { fu: 8, lpm: 26 },
  { fu: 9, lpm: 28 },
  { fu: 10, lpm: 30 },
  { fu: 12, lpm: 33 },
  { fu: 14, lpm: 36 },
  { fu: 16, lpm: 39 },
  { fu: 18, lpm: 42 },
  { fu: 20, lpm: 45 },
  { fu: 25, lpm: 50 },
  { fu: 30, lpm: 55 },
  { fu: 35, lpm: 60 },
  { fu: 40, lpm: 65 },
  { fu: 50, lpm: 75 },
  { fu: 60, lpm: 85 },
  { fu: 70, lpm: 95 },
  { fu: 80, lpm: 105 },
  { fu: 90, lpm: 115 },
  { fu: 100, lpm: 125 },
];

// Pipe size selection table (maintains velocity < 2.0 m/s)
const PIPE_SIZES = configData.pipeSizingTable || [
  { size: 15, maxFlow: 20, description: "15mm (1/2 inch)" },
  { size: 20, maxFlow: 35, description: "20mm (3/4 inch)" },
  { size: 25, maxFlow: 50, description: "25mm (1 inch)" },
  { size: 32, maxFlow: 80, description: "32mm (1-1/4 inch)" },
  { size: 40, maxFlow: 120, description: "40mm (1-1/2 inch)" },
  { size: 50, maxFlow: 180, description: "50mm (2 inch)" },
  { size: 65, maxFlow: 300, description: "65mm (2-1/2 inch)" },
  { size: 80, maxFlow: 450, description: "80mm (3 inch)" },
  { size: 100, maxFlow: 700, description: "100mm (4 inch)" },
  { size: 125, maxFlow: 1100, description: "125mm (5 inch)" },
  { size: 150, maxFlow: 1600, description: "150mm (6 inch)" },
];

// Velocity limits from config
const VELOCITY_LIMITS = configData.velocityLimits || {
  domestic: 2.0,
  flushing: 3.0,
};

/**
 * Calculate fixture units for given fixtures
 * @param {Object} inputFixtures - Object with fixture counts
 * @param {Object} config - Fixture unit configuration
 * @returns {Object} Fixture units breakdown
 */
export function calculateFixtureUnits(inputFixtures, config = fixtureConfig) {
  let coldWaterFU = 0;
  let hotWaterFU = 0;
  const fixtureBreakdown = {};

  // Validate input
  if (!inputFixtures || typeof inputFixtures !== "object") {
    throw new Error("Input fixtures must be an object");
  }

  // Calculate fixture units for each fixture type
  for (const [fixtureType, count] of Object.entries(inputFixtures)) {
    // Validate fixture type exists in config
    if (!config[fixtureType]) {
      throw new Error(
        `Unknown fixture type: ${fixtureType}. Supported types: ${Object.keys(
          config
        ).join(", ")}`
      );
    }

    // Validate count is a positive number
    if (typeof count !== "number" || count < 0) {
      throw new Error(
        `Invalid count for ${fixtureType}: must be a positive number`
      );
    }

    // Calculate FU for this fixture type
    const coldFU = config[fixtureType].cold * count;
    const hotFU = config[fixtureType].hot * count;

    // Store breakdown
    fixtureBreakdown[fixtureType] = {
      count: count,
      coldFU: coldFU,
      hotFU: hotFU,
      totalFU: coldFU + hotFU,
    };

    // Add to totals
    coldWaterFU += coldFU;
    hotWaterFU += hotFU;
  }

  return {
    coldWaterFU: Math.round(coldWaterFU * 100) / 100, // Round to 2 decimal places
    hotWaterFU: Math.round(hotWaterFU * 100) / 100,
    fixtureBreakdown: fixtureBreakdown,
  };
}

/**
 * Convert fixture units to flow rate (LPM)
 * @param {number} totalFU - Total fixture units
 * @param {Array} lookup - FU to flow rate lookup table
 * @returns {number} Flow rate in LPM
 */
export function convertFUToFlowRate(totalFU, lookup = FU_TO_FLOW_LPM) {
  if (totalFU <= 0) return 0;

  // Find exact match
  const exactMatch = lookup.find((entry) => entry.fu === totalFU);
  if (exactMatch) return exactMatch.lpm;

  // Find closest match
  for (let i = 0; i < lookup.length; i++) {
    if (totalFU <= lookup[i].fu) {
      // If it's the first entry, return it
      if (i === 0) return lookup[i].lpm;

      // Interpolate between previous and current entry
      const prev = lookup[i - 1];
      const curr = lookup[i];
      const ratio = (totalFU - prev.fu) / (curr.fu - prev.fu);
      return Math.round(prev.lpm + ratio * (curr.lpm - prev.lpm));
    }
  }

  // If above max, extrapolate using the last two entries
  const last = lookup[lookup.length - 1];
  const secondLast = lookup[lookup.length - 2];
  const ratio = (totalFU - secondLast.fu) / (last.fu - secondLast.fu);
  return Math.round(secondLast.lpm + ratio * (last.lpm - secondLast.lpm));
}

/**
 * Select appropriate pipe size based on flow rate
 * @param {number} flowRate - Flow rate in LPM
 * @param {Array} pipeTable - Pipe size selection table
 * @returns {Object} Selected pipe size information
 */
export function selectPipeSize(flowRate, pipeTable = PIPE_SIZES) {
  if (flowRate <= 0) {
    return {
      size: pipeTable[0].size,
      description: pipeTable[0].description,
      maxFlow: pipeTable[0].maxFlow,
    };
  }

  // Find appropriate pipe size
  for (const pipe of pipeTable) {
    if (flowRate <= pipe.maxFlow) {
      return {
        size: pipe.size,
        description: pipe.description,
        maxFlow: pipe.maxFlow,
      };
    }
  }

  // If above max, return largest available
  const largest = pipeTable[pipeTable.length - 1];
  return {
    size: largest.size,
    description: largest.description,
    maxFlow: largest.maxFlow,
  };
}

/**
 * Calculate flow velocity in pipe
 * @param {number} flowLPM - Flow rate in LPM
 * @param {number} pipeSizeMM - Pipe size in mm
 * @returns {number} Velocity in m/s
 */
export function calculateVelocity(flowLPM, pipeSizeMM) {
  if (flowLPM <= 0 || pipeSizeMM <= 0) return 0;

  // Convert flow rate from LPM to m³/s
  const flowM3s = flowLPM / 1000 / 60;

  // Calculate pipe cross-sectional area in m²
  const radius = pipeSizeMM / 2000; // Convert mm to m
  const area = Math.PI * radius * radius;

  // Calculate velocity
  const velocity = flowM3s / area;

  return Math.round(velocity * 100) / 100; // Round to 2 decimal places
}

/**
 * Estimate pressure drop using Hazen-Williams equation
 * @param {number} flowLPM - Flow rate in LPM
 * @param {number} pipeSizeMM - Pipe size in mm
 * @param {number} length - Pipe length in meters
 * @param {number} c - Hazen-Williams coefficient (default: 140 for PVC)
 * @returns {number} Pressure drop in bar
 */
export function estimatePressureDrop(
  flowLPM,
  pipeSizeMM,
  length = 10,
  c = 140
) {
  if (flowLPM <= 0 || pipeSizeMM <= 0 || length <= 0) return 0;

  // Convert flow rate from LPM to L/s
  const Q = flowLPM / 60;

  // Convert pipe size from mm to m
  const D = pipeSizeMM / 1000;

  // Hazen-Williams equation: hf = 10.67 * L * (Q/C)^1.85 * D^(-4.87)
  // Convert to pressure drop in bar: P = hf * ρ * g / 100000
  const hf = 10.67 * length * Math.pow(Q / c, 1.85) * Math.pow(D, -4.87);
  const pressureDrop = (hf * 9.81) / 100000; // Convert to bar

  return Math.round(pressureDrop * 1000) / 1000; // Round to 3 decimal places
}

/**
 * Main pipe sizing function using fixture units
 * @param {Object} input - Input object with fixtures and optional parameters
 * @param {Object} input.fixtures - Fixture counts
 * @param {Object} input.pipeParams - Optional pipe parameters for pressure drop
 * @param {number} input.pipeParams.pipeLength - Pipe length in meters
 * @param {string} input.pipeParams.pipeMaterial - Pipe material for C coefficient
 * @param {Object} options - Additional options
 * @returns {Object} Complete pipe sizing results
 */
export function calculatePipeSizing(input, options = {}) {
  const { fixtures, pipeParams = {} } = input;

  const {
    maxVelocity = VELOCITY_LIMITS.domestic,
    config = fixtureConfig,
    lookup = FU_TO_FLOW_LPM,
    pipeTable = PIPE_SIZES,
  } = options;

  // Validate input
  if (!fixtures || typeof fixtures !== "object") {
    throw new Error("Fixtures object is required");
  }

  // 1. Calculate fixture units
  const fixtureUnits = calculateFixtureUnits(fixtures, config);

  // 2. Convert to flow rate (use cold water for sizing)
  const flowRateLPM = convertFUToFlowRate(fixtureUnits.coldWaterFU, lookup);

  // 3. Select pipe size
  const pipeSize = selectPipeSize(flowRateLPM, pipeTable);

  // 4. Calculate velocity
  const velocity = calculateVelocity(flowRateLPM, pipeSize.size);

  // 5. Check if velocity is within limit
  const isWithinVelocityLimit = velocity <= maxVelocity;

  // 6. Calculate pressure drop if pipe parameters are provided
  let pressureDrop = null;
  let pressureDropInfo = null;

  if (pipeParams.pipeLength && pipeParams.pipeLength > 0) {
    // Determine C coefficient based on material
    let c = 140; // Default for PVC
    if (pipeParams.pipeMaterial) {
      const materialCoefficients = {
        PVC: 140,
        CPVC: 140,
        PEX: 150,
        Copper: 130,
        "Galvanized Steel": 100,
        "Cast Iron": 100,
      };
      c = materialCoefficients[pipeParams.pipeMaterial] || 140;
    }

    pressureDrop = estimatePressureDrop(
      flowRateLPM,
      pipeSize.size,
      pipeParams.pipeLength,
      c
    );
    pressureDropInfo = {
      pressureDrop: pressureDrop,
      unit: "bar",
      material: pipeParams.pipeMaterial || "PVC",
      coefficient: c,
    };
  }

  // 7. Prepare results
  const results = {
    fixtureUnits: {
      coldWaterFU: fixtureUnits.coldWaterFU,
      hotWaterFU: fixtureUnits.hotWaterFU,
      fixtureBreakdown: fixtureUnits.fixtureBreakdown,
    },
    flowRate: {
      estimatedFlowRateLPM: flowRateLPM,
      flowRateM3s: Math.round((flowRateLPM / 1000 / 60) * 1000000) / 1000000,
    },
    pipeSizing: {
      recommendedPipeSizeMM: pipeSize.size,
      pipeDescription: pipeSize.description,
      maxFlowForPipe: pipeSize.maxFlow,
      calculatedVelocity: velocity,
      isWithinVelocityLimit: isWithinVelocityLimit,
      maxVelocityLimit: maxVelocity,
    },
    pressureDrop: pressureDropInfo,
    summary: {
      totalFixtures: Object.values(fixtures).reduce(
        (sum, count) => sum + count,
        0
      ),
      totalColdWaterFU: fixtureUnits.coldWaterFU,
      totalHotWaterFU: fixtureUnits.hotWaterFU,
      recommendedFlowRate: flowRateLPM,
      recommendedPipeSize: pipeSize.size,
      velocityStatus: isWithinVelocityLimit ? "Within Limit" : "Exceeds Limit",
    },
  };

  return results;
}

/**
 * Get supported fixture types
 * @returns {Array} Array of supported fixture types
 */
export function getSupportedFixtureTypes() {
  return Object.keys(fixtureConfig).map((type) => ({
    type: type,
    description: fixtureConfig[type].description || type,
    coldFU: fixtureConfig[type].cold,
    hotFU: fixtureConfig[type].hot,
  }));
}

/**
 * Validate fixture input
 * @param {Object} fixtures - Fixture counts
 * @returns {Object} Validation result
 */
export function validateFixtureInput(fixtures) {
  const errors = [];
  const warnings = [];

  if (!fixtures || typeof fixtures !== "object") {
    errors.push("Fixtures must be an object");
    return { isValid: false, errors, warnings };
  }

  for (const [fixtureType, count] of Object.entries(fixtures)) {
    if (!fixtureConfig[fixtureType]) {
      errors.push(`Unknown fixture type: ${fixtureType}`);
    } else if (typeof count !== "number" || count < 0) {
      errors.push(
        `Invalid count for ${fixtureType}: must be a positive number`
      );
    } else if (count === 0) {
      warnings.push(`${fixtureType} count is 0 - this fixture will be ignored`);
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  };
}

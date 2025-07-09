/**
 * Duct Sizing Calculator using Velocity Method
 * Calculates duct dimensions for both round and rectangular ducts
 */

export function calculateDuctSize({
  airflowCFM,
  maxVelocity,
  shape,
  aspectRatio = 2,
  room,
  heatLoadCapacity,
}) {
  try {
    // Validate required inputs
    if (!airflowCFM || !maxVelocity || !shape) {
      throw new Error(
        "Missing required parameters: airflowCFM, maxVelocity, and shape are required"
      );
    }

    if (airflowCFM <= 0 || maxVelocity <= 0) {
      throw new Error("Airflow and velocity must be positive numbers");
    }

    if (shape !== "round" && shape !== "rectangular") {
      throw new Error('Shape must be either "round" or "rectangular"');
    }

    if (shape === "rectangular" && (!aspectRatio || aspectRatio <= 0)) {
      throw new Error(
        "Aspect ratio must be a positive number for rectangular ducts"
      );
    }

    // 1. Convert CFM to m³/s
    const airflowM3s = airflowCFM * 0.000472;

    // 2. Calculate duct cross-sectional area
    const areaM2 = airflowM3s / maxVelocity;

    // 3. Calculate duct dimensions based on shape
    let roundDiameterMm = null;
    let rectangular = null;

    if (shape === "round") {
      // Calculate round diameter
      const diameterM = Math.sqrt((4 * areaM2) / Math.PI);
      roundDiameterMm = Math.round(diameterM * 1000); // Convert to mm and round
    } else if (shape === "rectangular") {
      // Calculate rectangular dimensions
      const heightM = Math.sqrt(areaM2 / aspectRatio);
      const widthM = aspectRatio * heightM;

      rectangular = {
        width_mm: Math.round(widthM * 1000), // Convert to mm and round
        height_mm: Math.round(heightM * 1000), // Convert to mm and round
        aspectRatio: aspectRatio,
      };
    }

    return {
      airflowCFM: parseFloat(airflowCFM),
      velocity: parseFloat(maxVelocity),
      area_m2: parseFloat(areaM2.toFixed(4)),
      roundDiameter_mm: roundDiameterMm,
      rectangular: rectangular,
      room: room || null,
      heatLoadCapacity: heatLoadCapacity || null,
    };
  } catch (error) {
    throw new Error(`Duct sizing calculation error: ${error.message}`);
  }
}

// Test cases
export const testCase1 = {
  airflowCFM: 1000,
  maxVelocity: 6,
  shape: "round",
  room: "Living Room",
  heatLoadCapacity: 5000,
};

export const testCase2 = {
  airflowCFM: 1500,
  maxVelocity: 5,
  shape: "rectangular",
  aspectRatio: 2,
  room: "Bedroom",
  heatLoadCapacity: 3500,
};

export const testCase3 = {
  airflowCFM: 800,
  maxVelocity: 7,
  shape: "rectangular",
  aspectRatio: 3,
  room: "Kitchen",
  heatLoadCapacity: 4200,
};

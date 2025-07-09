/**
 * Grille Sizing Calculator
 * Calculates grille dimensions based on airflow, face velocity, and free area percentage
 */

// Standard grille sizes in inches (width x height x area)
const standardGrilleSizes = [
  { width: 6, height: 4, area: 24 },
  { width: 8, height: 4, area: 32 },
  { width: 10, height: 4, area: 40 },
  { width: 12, height: 4, area: 48 },
  { width: 14, height: 4, area: 56 },
  { width: 16, height: 4, area: 64 },
  { width: 18, height: 4, area: 72 },
  { width: 20, height: 4, area: 80 },
  { width: 6, height: 6, area: 36 },
  { width: 8, height: 6, area: 48 },
  { width: 10, height: 6, area: 60 },
  { width: 12, height: 6, area: 72 },
  { width: 14, height: 6, area: 84 },
  { width: 16, height: 6, area: 96 },
  { width: 18, height: 6, area: 108 },
  { width: 20, height: 6, area: 120 },
  { width: 8, height: 8, area: 64 },
  { width: 10, height: 8, area: 80 },
  { width: 12, height: 8, area: 96 },
  { width: 14, height: 8, area: 112 },
  { width: 16, height: 8, area: 128 },
  { width: 18, height: 8, area: 144 },
  { width: 20, height: 8, area: 160 },
  { width: 10, height: 10, area: 100 },
  { width: 12, height: 10, area: 120 },
  { width: 14, height: 10, area: 140 },
  { width: 16, height: 10, area: 160 },
  { width: 18, height: 10, area: 180 },
  { width: 20, height: 10, area: 200 },
  { width: 12, height: 12, area: 144 },
  { width: 14, height: 12, area: 168 },
  { width: 16, height: 12, area: 192 },
  { width: 18, height: 12, area: 216 },
  { width: 20, height: 12, area: 240 },
  { width: 14, height: 14, area: 196 },
  { width: 16, height: 14, area: 224 },
  { width: 18, height: 14, area: 252 },
  { width: 20, height: 14, area: 280 },
  { width: 16, height: 16, area: 256 },
  { width: 18, height: 16, area: 288 },
  { width: 20, height: 16, area: 320 },
  { width: 18, height: 18, area: 324 },
  { width: 20, height: 18, area: 360 },
  { width: 20, height: 20, area: 400 },
  { width: 24, height: 12, area: 288 },
  { width: 24, height: 14, area: 336 },
  { width: 24, height: 16, area: 384 },
  { width: 24, height: 18, area: 432 },
  { width: 24, height: 20, area: 480 },
  { width: 30, height: 12, area: 360 },
  { width: 30, height: 14, area: 420 },
  { width: 30, height: 16, area: 480 },
  { width: 30, height: 18, area: 540 },
  { width: 30, height: 20, area: 600 },
  { width: 36, height: 12, area: 432 },
  { width: 36, height: 14, area: 504 },
  { width: 36, height: 16, area: 576 },
  { width: 36, height: 18, area: 648 },
  { width: 36, height: 20, area: 720 },
];

export function calculateGrilleSize({
  cfm,
  faceVelocity = 500,
  freeAreaPercent = 70,
}) {
  try {
    // Validate required inputs
    if (!cfm || cfm <= 0) {
      throw new Error("CFM must be a positive number");
    }

    if (faceVelocity <= 0) {
      throw new Error("Face velocity must be a positive number");
    }

    if (freeAreaPercent <= 0 || freeAreaPercent > 100) {
      throw new Error("Free area percentage must be between 0 and 100");
    }

    // 1. Compute net required area in ft²
    const requiredAreaFt2 = cfm / (faceVelocity * (freeAreaPercent / 100));

    // 2. Convert to in²
    const requiredAreaIn2 = requiredAreaFt2 * 144;

    // 3. Find suitable grille sizes that meet or exceed the required area
    const suitableGrilles = standardGrilleSizes
      .filter((grille) => grille.area >= requiredAreaIn2)
      .sort((a, b) => a.area - b.area) // Sort by area (smallest first)
      .slice(0, 5); // Return top 5 options

    // 4. Calculate efficiency for each grille
    const grillesWithEfficiency = suitableGrilles.map((grille) => ({
      ...grille,
      efficiency: ((requiredAreaIn2 / grille.area) * 100).toFixed(1),
      excessArea: grille.area - requiredAreaIn2,
    }));

    return {
      cfm: parseFloat(cfm),
      faceVelocity: parseFloat(faceVelocity),
      freeAreaPercent: parseFloat(freeAreaPercent),
      requiredAreaFt2: parseFloat(requiredAreaFt2.toFixed(4)),
      requiredAreaIn2: Math.round(requiredAreaIn2),
      suggestedGrilles: grillesWithEfficiency,
      calculationSummary: {
        formula: `Area = CFM / (Face Velocity × Free Area %)`,
        calculation: `${cfm} / (${faceVelocity} × ${freeAreaPercent}%) = ${requiredAreaFt2.toFixed(
          4
        )} ft²`,
        conversion: `${requiredAreaFt2.toFixed(4)} ft² × 144 = ${Math.round(
          requiredAreaIn2
        )} in²`,
      },
    };
  } catch (error) {
    throw new Error(`Grille sizing calculation error: ${error.message}`);
  }
}

// Test cases
export const grilleTestCase1 = {
  cfm: 400,
  faceVelocity: 500,
  freeAreaPercent: 70,
};

export const grilleTestCase2 = {
  cfm: 800,
  faceVelocity: 600,
  freeAreaPercent: 65,
};

export const grilleTestCase3 = {
  cfm: 1200,
  faceVelocity: 450,
  freeAreaPercent: 75,
};

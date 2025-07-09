/**
 * AHU Fitting Loss Calculator
 * Calculates pressure drop due to duct fittings using standard loss coefficient (K) values
 */

// Standard fitting types with typical K values
export const standardFittings = {
  // Elbows
  "90_elbow_sharp": { kValue: 0.8, description: "90° Sharp Elbow" },
  "90_elbow_radius": { kValue: 0.3, description: "90° Radius Elbow" },
  "45_elbow_sharp": { kValue: 0.4, description: "45° Sharp Elbow" },
  "45_elbow_radius": { kValue: 0.2, description: "45° Radius Elbow" },

  // Transitions
  transition_30deg: { kValue: 0.6, description: "30° Transition" },
  transition_45deg: { kValue: 0.8, description: "45° Transition" },
  transition_60deg: { kValue: 1.0, description: "60° Transition" },
  sudden_expansion: { kValue: 1.0, description: "Sudden Expansion" },
  sudden_contraction: { kValue: 0.5, description: "Sudden Contraction" },

  // Tees and Branches
  tee_branch: { kValue: 1.0, description: "Tee Branch" },
  tee_through: { kValue: 0.2, description: "Tee Through" },
  tee_elbow: { kValue: 1.5, description: "Tee Elbow" },

  // Entries and Exits
  entry_sharp: { kValue: 0.5, description: "Sharp Entry" },
  entry_rounded: { kValue: 0.2, description: "Rounded Entry" },
  entry_bellmouth: { kValue: 0.05, description: "Bellmouth Entry" },
  exit: { kValue: 1.0, description: "Exit Loss" },

  // Dampers
  damper_open: { kValue: 0.1, description: "Open Damper" },
  damper_25: { kValue: 0.3, description: "25% Open Damper" },
  damper_50: { kValue: 1.0, description: "50% Open Damper" },
  damper_75: { kValue: 3.0, description: "75% Open Damper" },

  // Other fittings
  screen: { kValue: 0.2, description: "Screen" },
  perforated_plate: { kValue: 0.8, description: "Perforated Plate" },
  sound_attenuator: { kValue: 0.5, description: "Sound Attenuator" },
};

export function calculateFittingLosses(
  fittingsArray,
  airVelocity,
  airDensity = 1.2
) {
  try {
    // Validate inputs
    if (!Array.isArray(fittingsArray) || fittingsArray.length === 0) {
      throw new Error("Fittings array must be a non-empty array");
    }

    if (!airVelocity || airVelocity <= 0) {
      throw new Error("Air velocity must be a positive number");
    }

    if (airDensity <= 0) {
      throw new Error("Air density must be a positive number");
    }

    // Calculate dynamic pressure: P = 0.5 × ρ × v²
    const dynamicPressure = 0.5 * airDensity * Math.pow(airVelocity, 2);

    let totalFittingLoss = 0;
    const breakdown = [];

    // Process each fitting
    for (const fitting of fittingsArray) {
      // Validate fitting object
      if (!fitting.type || !fitting.quantity || !fitting.kValue) {
        throw new Error(
          "Each fitting must have type, quantity, and kValue properties"
        );
      }

      if (fitting.quantity <= 0) {
        throw new Error("Fitting quantity must be a positive number");
      }

      if (fitting.kValue < 0) {
        throw new Error("K value must be non-negative");
      }

      // Calculate pressure drop for this fitting: ΔP = K × 0.5 × ρ × v² × quantity
      const fittingLoss = fitting.kValue * dynamicPressure * fitting.quantity;

      totalFittingLoss += fittingLoss;

      // Add to breakdown
      breakdown.push({
        type: fitting.type,
        description:
          standardFittings[fitting.type]?.description || fitting.type,
        quantity: fitting.quantity,
        kValue: fitting.kValue,
        loss: parseFloat(fittingLoss.toFixed(2)),
        lossPerUnit: parseFloat((fitting.kValue * dynamicPressure).toFixed(2)),
      });
    }

    return {
      totalFittingLoss: parseFloat(totalFittingLoss.toFixed(2)),
      breakdown: breakdown,
      calculationSummary: {
        airVelocity: parseFloat(airVelocity),
        airDensity: parseFloat(airDensity),
        dynamicPressure: parseFloat(dynamicPressure.toFixed(2)),
        formula: "ΔP = K × 0.5 × ρ × v² × quantity",
        totalFittings: fittingsArray.reduce(
          (sum, fitting) => sum + fitting.quantity,
          0
        ),
      },
    };
  } catch (error) {
    throw new Error(`Fitting loss calculation error: ${error.message}`);
  }
}

// Test cases
export const testFittings1 = [
  { type: "90_elbow_sharp", quantity: 4, kValue: 0.8 },
  { type: "transition_30deg", quantity: 2, kValue: 0.6 },
  { type: "tee_branch", quantity: 1, kValue: 1.0 },
];

export const testFittings2 = [
  { type: "entry_sharp", quantity: 1, kValue: 0.5 },
  { type: "90_elbow_radius", quantity: 6, kValue: 0.3 },
  { type: "damper_50", quantity: 2, kValue: 1.0 },
  { type: "exit", quantity: 1, kValue: 1.0 },
];

// Extended AHU pressure drop calculator
export function calculateTotalAHUPressureDrop({
  coilDrop = 0,
  filterDrop = 0,
  fittingsArray = [],
  airVelocity = 5,
  airDensity = 1.2,
  additionalLosses = 0,
}) {
  try {
    // Calculate fitting losses
    const fittingLosses =
      fittingsArray.length > 0
        ? calculateFittingLosses(fittingsArray, airVelocity, airDensity)
        : { totalFittingLoss: 0, breakdown: [] };

    // Calculate total pressure drop
    const totalPressureDrop =
      coilDrop + filterDrop + fittingLosses.totalFittingLoss + additionalLosses;

    return {
      totalPressureDrop: parseFloat(totalPressureDrop.toFixed(2)),
      breakdown: {
        coilDrop: parseFloat(coilDrop.toFixed(2)),
        filterDrop: parseFloat(filterDrop.toFixed(2)),
        fittingLosses: fittingLosses.totalFittingLoss,
        additionalLosses: parseFloat(additionalLosses.toFixed(2)),
      },
      fittingBreakdown: fittingLosses.breakdown,
      calculationSummary: {
        ...fittingLosses.calculationSummary,
        totalComponents: 4,
        formula: "Total = Coil + Filter + Fittings + Additional",
      },
    };
  } catch (error) {
    throw new Error(
      `Total AHU pressure drop calculation error: ${error.message}`
    );
  }
}

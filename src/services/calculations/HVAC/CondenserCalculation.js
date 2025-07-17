// services/calculations/HVAC/CondenserCalculation.js

export const calculateCondenser = (inputData) => {
  console.log("Calculating Condenser with input:", inputData);

  // 1. Extract and Parse Inputs
  // Convert all relevant input strings to numbers.
  const pipeSizeMM = parseFloat(inputData.pipeSizeMM);
  const numberOfCondensers = parseInt(inputData.numberOfCondensers, 10);
  const lengthMtr = parseFloat(inputData.lengthMtr);
  const flowRateLPS = parseFloat(inputData.flowRateLPS);
  const straight = parseFloat(inputData.straight);
  const bend = parseFloat(inputData.bend);
  const tee = parseFloat(inputData.tee);
  const butterflyValve = parseFloat(inputData.butterflyValve);
  const checkValve = parseFloat(inputData.checkValve);
  const balancingValve = parseFloat(inputData.balancingValve);

  // Condenser-specific inputs, parsed but their direct application in the
  // simplified head loss formula requires further definition.
  const totalHeatLoadTonnage = parseFloat(inputData.totalHeatLoadTonnage);
  const totalHeatLoadKW = parseFloat(inputData.totalHeatLoadKW);
  const totalLoadLPS = parseFloat(inputData.totalLoadLPS);
  const totalPumpCapacity = parseFloat(inputData.totalPumpCapacity);
  const suddenEnlargementCondenserInlet = parseFloat(
    inputData.suddenEnlargementCondenserInlet
  );
  const suddenContractionCondenserOutlet = parseFloat(
    inputData.suddenContractionCondenserOutlet
  );

  // Validate inputs: Ensure no NaN values after parsing
  // If any critical input is invalid, throw an error.
  if (
    isNaN(pipeSizeMM) ||
    isNaN(numberOfCondensers) ||
    isNaN(lengthMtr) ||
    isNaN(flowRateLPS) ||
    isNaN(straight) ||
    isNaN(bend) ||
    isNaN(tee) ||
    isNaN(butterflyValve) ||
    isNaN(checkValve) ||
    isNaN(balancingValve) ||
    // Include validation for new Condenser inputs
    isNaN(totalHeatLoadTonnage) ||
    isNaN(totalHeatLoadKW) ||
    isNaN(totalLoadLPS) ||
    isNaN(totalPumpCapacity) ||
    isNaN(suddenEnlargementCondenserInlet) ||
    isNaN(suddenContractionCondenserOutlet)
  ) {
    throw new Error(
      "Invalid numeric input detected. Please ensure all Condenser-related fields are numbers."
    );
  }

  // 2. Perform Conversions (same as Chiller)
  const pipeSizeInch = pipeSizeMM / 25.4; // 1 inch = 25.4 mm
  const lengthFt = lengthMtr * 3.28084; // 1 meter = 3.28084 feet
  const flowRateGPM = flowRateLPS * 15.8503; // 1 liter/second = 15.8503 gallons/minute

  // 3. Calculate Equivalent Lengths
  // a) Equivalent length from fittings based on multipliers
  const fittingsEquivalentLengthFt =
    straight * 1 +
    bend * 2 +
    tee * 3 +
    butterflyValve * 4 +
    checkValve * 5 +
    balancingValve * 6;

  // b) Equivalent length specifically for Condensers
  // ASSUMPTION: This is a placeholder value. You should replace EQUIV_LENGTH_PER_CONDENSER_FT
  // with a value derived from your condenser's specifications or design guidelines.
  const EQUIV_LENGTH_PER_CONDENSER_FT = 100; // Example: 100 feet of equivalent length per condenser (similar to chiller placeholder)
  const condenserEquivalentLengthFt =
    numberOfCondensers * EQUIV_LENGTH_PER_CONDENSER_FT;

  // c) Total Equivalent Length for Head Loss Calculation
  // This combines the actual pipe length, fittings equivalent length, and condenser equivalent length.
  const totalEquivalentLengthFt =
    lengthFt + fittingsEquivalentLengthFt + condenserEquivalentLengthFt;

  // 4. Calculate Head Loss
  // ASSUMPTION: The HEAD_LOSS_FACTOR is a simplified constant.
  // The new inputs like heat load, total load/pump capacity, and sudden enlargement/contraction
  // are important for a full hydraulic analysis, but their direct integration into
  // this simplified `HEAD_LOSS_FACTOR * Total Equivalent Length` formula is not explicitly defined.
  // To incorporate them accurately, more complex formulas (e.g., velocity calculations for minor losses,
  // or a flow-dependent friction factor) would be needed.
  // You MUST replace this placeholder with a properly calculated or empirical factor
  // relevant to your system's fluid, pipe material, and flow conditions.
  const HEAD_LOSS_FACTOR = 0.005; // Example/Placeholder: Same as Chiller

  const headLossFeet = HEAD_LOSS_FACTOR * totalEquivalentLengthFt;
  const headLossMeter = headLossFeet / 3.28084; // Convert feet to meters

  // 5. Prepare Results
  // Return the original inputs along with the new calculated values.
  const result = {
    ...inputData, // Includes all original inputs
    pipeSizeInch: parseFloat(pipeSizeInch.toFixed(4)),
    lengthFt: parseFloat(lengthFt.toFixed(4)),
    flowRateGPM: parseFloat(flowRateGPM.toFixed(4)),
    equivalentLengthFt: parseFloat(fittingsEquivalentLengthFt.toFixed(4)), // Output for fittings only equivalent length
    totalEquivalentLengthFt: parseFloat(totalEquivalentLengthFt.toFixed(4)),
    headLossFeet: parseFloat(headLossFeet.toFixed(4)),
    headLossMeter: parseFloat(headLossMeter.toFixed(4)),
    message:
      "Condenser calculations completed with assumed factors. Please review placeholder values. Note: Additional Condenser-specific inputs (heat load, sudden changes) are parsed but not directly applied to the head loss formula due to simplified model. Further formulas needed for full integration.",
  };

  return result;
};

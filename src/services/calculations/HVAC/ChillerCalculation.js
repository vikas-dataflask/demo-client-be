// services/calculations/HVAC/ChillerCalculation.js

export const calculateChiller = (inputData) => {
  console.log("Calculating Chiller with input:", inputData);

  // 1. Extract and Parse Inputs
  // Convert all relevant input strings to numbers.
  // Using parseFloat for decimal numbers, parseInt for whole numbers (like count).
  const pipeSizeMM = parseFloat(inputData.pipeSizeMM);
  const numberOfChillers = parseInt(inputData.numberOfChillers, 10);
  const lengthMtr = parseFloat(inputData.lengthMtr);
  const flowRateLPS = parseFloat(inputData.flowRateLPS);
  const straight = parseFloat(inputData.straight);
  const bend = parseFloat(inputData.bend);
  const tee = parseFloat(inputData.tee);
  const butterflyValve = parseFloat(inputData.butterflyValve);
  const checkValve = parseFloat(inputData.checkValve);
  const balancingValve = parseFloat(inputData.balancingValve);

  // Validate inputs: Ensure no NaN values after parsing
  // If any critical input is invalid, return an error message.
  if (
    isNaN(pipeSizeMM) ||
    isNaN(numberOfChillers) ||
    isNaN(lengthMtr) ||
    isNaN(flowRateLPS) ||
    isNaN(straight) ||
    isNaN(bend) ||
    isNaN(tee) ||
    isNaN(butterflyValve) ||
    isNaN(checkValve) ||
    isNaN(balancingValve)
  ) {
    throw new Error(
      "Invalid numeric input detected. Please ensure all chiller-related fields are numbers."
    );
  }

  // 2. Perform Conversions (based on assumed primary inputs)
  // pipeSizeMM is primary, calculate pipeSizeInch
  const pipeSizeInch = pipeSizeMM / 25.4; // 1 inch = 25.4 mm

  // lengthMtr is primary, calculate lengthFt
  const lengthFt = lengthMtr * 3.28084; // 1 meter = 3.28084 feet

  // flowRateLPS is primary, calculate flowRateGPM
  const flowRateGPM = flowRateLPS * 15.8503; // 1 liter/second = 15.8503 gallons/minute

  // 3. Calculate Equivalent Lengths
  // a) Equivalent length from fittings based on multipliers you provided
  const fittingsEquivalentLengthFt =
    straight * 1 +
    bend * 2 +
    tee * 3 +
    butterflyValve * 4 +
    checkValve * 5 +
    balancingValve * 6;

  // b) Equivalent length specifically for chillers
  // ASSUMPTION: This is a placeholder value. You should replace EQUIV_LENGTH_PER_CHILLER_FT
  // with a value derived from your chiller's specifications or design guidelines.
  const EQUIV_LENGTH_PER_CHILLER_FT = 100; // Example: 100 feet of equivalent length per chiller
  const chillerEquivalentLengthFt =
    numberOfChillers * EQUIV_LENGTH_PER_CHILLER_FT;

  // c) Total Equivalent Length for Head Loss Calculation
  // This combines the actual pipe length, fittings equivalent length, and chiller equivalent length.
  const totalEquivalentLengthFt =
    lengthFt + fittingsEquivalentLengthFt + chillerEquivalentLengthFt;

  // 4. Calculate Head Loss
  // ASSUMPTION: The HEAD_LOSS_FACTOR is a simplified constant.
  // In a real-world scenario, this factor is derived from complex hydraulic calculations
  // (e.g., using Darcy-Weisbach equation which requires fluid velocity, pipe diameter,
  // friction factor, and fluid properties).
  // You MUST replace this placeholder with a properly calculated or empirical factor
  // relevant to your system's fluid, pipe material, and flow conditions.
  const HEAD_LOSS_FACTOR = 0.005; // Example/Placeholder: This factor needs to be defined based on your specific system.

  const headLossFeet = HEAD_LOSS_FACTOR * totalEquivalentLengthFt;
  const headLossMeter = headLossFeet / 3.28084; // Convert feet to meters

  // 5. Prepare Results
  // Return the original inputs along with the new calculated values.
  const result = {
    ...inputData, // Includes all original inputs
    pipeSizeInch: parseFloat(pipeSizeInch.toFixed(4)),
    lengthFt: parseFloat(lengthFt.toFixed(4)),
    flowRateGPM: parseFloat(flowRateGPM.toFixed(4)),
    // 'equivalentLengthFt' in your frontend seems to correspond to the fittings only equivalent length
    equivalentLengthFt: parseFloat(fittingsEquivalentLengthFt.toFixed(4)),
    totalEquivalentLengthFt: parseFloat(totalEquivalentLengthFt.toFixed(4)),
    headLossFeet: parseFloat(headLossFeet.toFixed(4)),
    headLossMeter: parseFloat(headLossMeter.toFixed(4)),
    message:
      "Chiller calculations completed. Please review placeholder values for accuracy.",
  };

  return result;
};

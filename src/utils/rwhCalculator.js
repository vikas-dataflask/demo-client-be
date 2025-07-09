/**
 * Calculate Rainwater Harvesting (RWH) annual volume and pit count
 * @param {Object} params
 * @param {number} params.catchmentAreaM2 - Catchment area in m²
 * @param {number} params.annualRainfallMm - Annual rainfall in mm
 * @param {number} params.runoffCoefficient - Runoff coefficient (0-1)
 * @param {number} params.pitVolumeM3 - Volume of one pit in m³
 * @returns {Object} Calculation result
 */
export function calculateRWHVolume({
  catchmentAreaM2,
  annualRainfallMm,
  runoffCoefficient,
  pitVolumeM3,
}) {
  // Input validation
  if (
    typeof catchmentAreaM2 !== "number" ||
    catchmentAreaM2 <= 0 ||
    typeof annualRainfallMm !== "number" ||
    annualRainfallMm <= 0 ||
    typeof runoffCoefficient !== "number" ||
    runoffCoefficient <= 0 ||
    runoffCoefficient > 1 ||
    typeof pitVolumeM3 !== "number" ||
    pitVolumeM3 <= 0
  ) {
    throw new Error("Invalid or missing input(s) for RWH calculation");
  }

  // 1. Convert rainfall mm → meters
  const rainfallM = annualRainfallMm / 1000;

  // 2. Calculate rainwater volume (m³)
  const annualVolume = catchmentAreaM2 * rainfallM * runoffCoefficient;

  // 3. Calculate total liters
  const totalLiters = annualVolume * 1000;

  // 4. Divide by per-pit volume to suggest number of pits
  const pitCount = Math.ceil(annualVolume / pitVolumeM3);

  return {
    catchmentAreaM2,
    annualRainfallMm,
    runoffCoefficient,
    totalAnnualHarvestL: Math.round(totalLiters),
    recommendedPitSizeM3: pitVolumeM3,
    pitCount,
  };
}

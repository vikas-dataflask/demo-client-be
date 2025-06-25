// services/calculations/HVAC/AHUCalculation.js

export const calculateAHU = (inputData) => {
  // User inputs: These fields are extracted from the incoming request body
  const flowrate = parseFloat(inputData.flowrate); // m^3/s
  const width = parseFloat(inputData.width); // m
  const height = parseFloat(inputData.height); // m
  const length = parseFloat(inputData.length); // m (Straight length)
  const equipment = inputData.equipment; // Capture equipment type

  // Fixed standard values as per your instruction
  const EPSILON = 0.09; // Absolute roughness in meters (e)
  const C0_FIXED = 0.52; // Local Loss Coefficient (C0)
  const U0_FIXED = 5.0; // U0

  // Physical constants
  const RHO_AIR = 1.225; // kg/m^3 (Density of Air at 20°C, Standard Atmospheric Pressure) - "r" in your formula
  const NU_AIR = 0.00001568; // m^2/s (Kinematic Viscosity of Air at 20°C) - "n" in your formula (assuming m^2/s)

  // Calculated fields: These values are derived from inputs and constants

  // Area (A)
  const area_m2 = width * height;
  if (area_m2 === 0) {
    throw new Error("Duct area cannot be zero. Check width and height inputs.");
  }

  // Mean Velocity (U)
  const u = flowrate / area_m2;

  // Hydraulic Diameter (Dh) - User provided: Dh = 4(ab)/2(a+b) which simplifies to 2ab/(a+b)
  const dh = (2 * width * height) / (width + height);
  if (dh === 0) {
    throw new Error(
      "Hydraulic diameter cannot be zero. Check width and height inputs."
    );
  }

  // Equivalent Diameter (De) - NEW CALCULATION ADDED
  // Formula based on previous discussions: De = 1.30 * ((ab)^0.625) / ((a+b)^0.25)
  const de = (1.3 * Math.pow(area_m2, 0.625)) / Math.pow(width + height, 0.25);
  if (isNaN(de) || !isFinite(de)) {
    throw new Error("Could not calculate Equivalent Diameter. Check inputs.");
  }

  // Equivalent Length (Le) - NEW FORMULA and CONDITIONAL LOGIC
  let le;
  if (u > 13) {
    le = (u * Math.pow(area_m2, 0.5)) / 4500;
  } else {
    // u <= 13 m/s
    le = Math.pow(area_m2, 0.5) / 350;
  }

  // Reynolds Number (Re) - UPDATED FORMULA with 1000 factor
  // User provided: Re = UDh/1000n. Assuming n is NU_AIR
  const re = (u * dh) / (1000 * NU_AIR);

  // Relative Roughness (e/Dh)
  const relativeRoughness = EPSILON / dh;

  // Intermediate Friction Factor (f') - "f'" in your formula
  const f_prime = 0.11 * Math.pow(relativeRoughness + 68 / re, 0.25);

  // Final Friction Factor (lambda - "l" in your formula) - NEW CONDITIONAL LOGIC
  let lambda;
  if (f_prime < 0.018) {
    lambda = 0.85 * f_prime + 0.0028;
  } else {
    lambda = f_prime;
  }

  // Velocity Pressure (Pv) - "1/2rU²" in your formula
  const pv = 0.5 * RHO_AIR * Math.pow(u, 2);

  // Velocity Pressure for U0 (Pv0) - for DPl calculation - "1/2rU0²"
  const pv0 = 0.5 * RHO_AIR * Math.pow(U0_FIXED, 2);

  // Frictional Pressure Drop (DPf) - NEW DUAL FORMULA for straight duct and fittings
  // User provided: DPf = (lL/D)1/2rU²Straight duct, DPf = (lLe/D)1/2rU²fittings
  // Assuming D is Dh for both. Total DPf is sum of straight and fittings frictional losses.
  const deltaPf_straight = ((lambda * length) / dh) * pv;
  const deltaPf_fittings = ((lambda * le) / dh) * pv;
  const total_deltaPf = deltaPf_straight + deltaPf_fittings;

  // Local Pressure Drop (DPl) - NEW FORMULA using U0
  // User provided: DPl = C01/2rU0²
  const deltaPl = C0_FIXED * pv0;

  // Total Pressure Drop (DPt)
  const deltaPt = total_deltaPf + deltaPl;

  return {
    message: "AHU pressure drop calculated successfully!",
    // User inputs echoed in results
    input_flowrate: flowrate,
    input_width: width,
    input_height: height,
    input_length: length,
    input_equipment: equipment, // Echo equipment type

    // Fixed standard values included in output for reference
    fixed_epsilon: EPSILON,
    fixed_u0: U0_FIXED,
    fixed_c0: C0_FIXED,

    // Calculated intermediate and final fields
    area_m2: parseFloat(area_m2.toFixed(4)),
    u: parseFloat(u.toFixed(4)),
    dh: parseFloat(dh.toFixed(4)),
    de: parseFloat(de.toFixed(4)), // NOW INCLUDED IN THE RETURNED OBJECT
    le: parseFloat(le.toFixed(4)),
    re: parseFloat(re.toFixed(2)),
    relativeRoughness: parseFloat(relativeRoughness.toFixed(6)),
    f_prime: parseFloat(f_prime.toFixed(6)),
    lambda: parseFloat(lambda.toFixed(6)),
    pv: parseFloat(pv.toFixed(4)),
    pv0: parseFloat(pv0.toFixed(4)),
    calculated_deltaPf_straight: parseFloat(deltaPf_straight.toFixed(4)),
    calculated_deltaPf_fittings: parseFloat(deltaPf_fittings.toFixed(4)),
    calculated_deltaPf: parseFloat(total_deltaPf.toFixed(4)),
    calculated_deltaPl: parseFloat(deltaPl.toFixed(4)),
    calculated_deltaPt: parseFloat(deltaPt.toFixed(4)),
  };
};

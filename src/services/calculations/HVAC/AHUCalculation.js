// services/calculations/HVAC/AHUCalculation.js

export const calculateAHU = (inputData) => {
  // User inputs: These fields are extracted from the incoming request body
  const flowrate = parseFloat(inputData.flowrate); // m^3/s
  const width = parseFloat(inputData.width) || 0; // m (optional)
  const height = parseFloat(inputData.height) || 0; // m (optional)
  const diameter = parseFloat(inputData.diameter) || 0; // m (optional)
  const length = parseFloat(inputData.length) || 0; // m (optional)
  const coefficientOfFitting = parseFloat(inputData.coefficientOfFitting) || 0; // user input (optional, default 0.09)
  const equipmentName = inputData.equipmentName || ""; // equipment name for logic determination

  // Physical constants
  const DENSITY = 1.2; // kg/m^3 (density constant)
  const KINEMATIC_VISCOSITY = 0.000015; // m^2/s (n constant)
  const coefficientOfFriction = 0.09;

  // Validate required inputs
  if (!flowrate || flowrate <= 0) {
    throw new Error("Flowrate must be a positive number");
  }

  // Determine if this is a duct/plenum or other equipment
  const isDuctOrPlenum =
    equipmentName.toLowerCase().includes("duct") ||
    equipmentName.toLowerCase().includes("plenum");

  // Calculate Area
  let area;
  if (width === 0 && height === 0) {
    // Round duct
    if (diameter <= 0) {
      throw new Error("For round ducts, diameter must be provided");
    }
    area = (Math.PI * Math.pow(diameter, 2)) / 4;
  } else {
    // Rectangular duct
    if (width <= 0 || height <= 0) {
      throw new Error(
        "For rectangular ducts, both width and height must be positive"
      );
    }
    area = width * height;
  }

  // Calculate Velocity
  const velocity = flowrate / area;

  // Calculate Hydraulic Diameter
  let hydraulicDiameter;
  if (width === 0 && height === 0) {
    // Round duct
    hydraulicDiameter = diameter;
  } else {
    // Rectangular duct
    hydraulicDiameter = (4 * width * height) / (2 * (width + height));
  }

  // Calculate Rectangular Ducts (Equivalent Diameter)
  let rectangularDucts;
  if (width === 0 && height === 0) {
    // Round duct
    rectangularDucts = diameter;
  } else {
    // Rectangular duct
    rectangularDucts =
      (1.3 * Math.pow(area, 0.625)) / Math.pow(width + height, 0.25);
  }

  // Calculate Le (Equivalent Length)
  let le;
  if (velocity > 13) {
    le = 1000 * ((velocity * Math.pow(area, 0.5)) / 4500);
  } else {
    le = 1000 * (Math.pow(area, 0.5) / 350);
  }

  // Calculate Reynolds Number
  const reynoldsNumber = (velocity * hydraulicDiameter) / KINEMATIC_VISCOSITY;

  // Calculate Velocity Pressure
  const velocityPressure = 0.5 * DENSITY * Math.pow(velocity, 2);

  // Calculate Friction Factor
  const frictionFactor =
    0.11 *
    Math.pow(
      (coefficientOfFriction * 0.001) / hydraulicDiameter + 68 / reynoldsNumber,
      0.25
    );

  // Calculate Lambda
  let lambda;
  if (frictionFactor < 0.018) {
    lambda = 0.85 * frictionFactor + 0.0028;
  } else {
    lambda = frictionFactor;
  }

  // Calculate Friction Pressure Loss and Fitting Pressure Loss based on equipment type
  let frictionPressureLoss = 0;
  let fittingPressureLoss = 0;

  if (isDuctOrPlenum) {
    // For ducts/plenums: Calculate Friction Pressure Loss, Fitting Pressure Loss = 0
    if (length === 0) {
      frictionPressureLoss =
        ((lambda * le) / hydraulicDiameter) *
        0.5 *
        DENSITY *
        Math.pow(velocity, 2);
    } else {
      frictionPressureLoss =
        ((lambda * length) / hydraulicDiameter) *
        0.5 *
        DENSITY *
        Math.pow(velocity, 2);
    }
    fittingPressureLoss = 0;
  } else {
    // For other equipment: Calculate Fitting Pressure Loss, Friction Pressure Loss = 0
    frictionPressureLoss = 0;
    fittingPressureLoss =
      coefficientOfFitting * 0.5 * DENSITY * Math.pow(velocity, 2);
  }

  // Calculate Total Pressure Loss
  const totalPressureLoss = frictionPressureLoss + fittingPressureLoss;

  return {
    message: "AHU pressure drop calculated successfully!",
    
    // User inputs echoed in results
    input_flowrate: flowrate,
    input_width: width,
    input_height: height,
    input_diameter: diameter,
    input_length: length,
    input_coefficientOfFitting: coefficientOfFitting,
    input_equipmentName: equipmentName,
    isDuctOrPlenum: isDuctOrPlenum,

    // Physical constants
    density: DENSITY,
    kinematicViscosity: KINEMATIC_VISCOSITY,

    // Calculated intermediate and final fields - rounded to 1 decimal place
    area: parseFloat(area.toFixed(1)),
    velocity: parseFloat(velocity.toFixed(1)),
    hydraulicDiameter: parseFloat(hydraulicDiameter.toFixed(1)),
    rectangularDucts: parseFloat(rectangularDucts.toFixed(1)),
    le: parseFloat(le.toFixed(1)),
    reynoldsNumber: parseFloat(reynoldsNumber.toFixed(1)),
    velocityPressure: parseFloat(velocityPressure.toFixed(1)),
    frictionFactor: parseFloat(frictionFactor.toFixed(1)),
    lambda: parseFloat(lambda.toFixed(6)), // Lambda not restricted to 1 decimal place
    
    // Pressure losses - rounded to 1 decimal place
    frictionPressureLoss: parseFloat(frictionPressureLoss.toFixed(1)),
    fittingPressureLoss: parseFloat(fittingPressureLoss.toFixed(1)),
    totalPressureLoss: parseFloat(totalPressureLoss.toFixed(1)),
  };
};

// New function to calculate total pressure drop for multiple equipment
export const calculateTotalAHUForMultipleEquipment = (equipmentList) => {
  if (!equipmentList || !Array.isArray(equipmentList) || equipmentList.length === 0) {
    throw new Error("Equipment list must be a non-empty array");
  }

  const results = [];
  let totalSystemPressureLoss = 0;

  equipmentList.forEach((equipment, index) => {
    try {
      const result = calculateAHU(equipment);
      results.push({
        index: index + 1,
        equipmentName: equipment.equipmentName || `Equipment ${index + 1}`,
        ...result
      });
      totalSystemPressureLoss += result.totalPressureLoss;
    } catch (error) {
      results.push({
        index: index + 1,
        equipmentName: equipment.equipmentName || `Equipment ${index + 1}`,
        error: error.message
      });
    }
  });

  return {
    individualResults: results,
    totalSystemPressureLoss: parseFloat(totalSystemPressureLoss.toFixed(1)),
    equipmentCount: equipmentList.length,
    successfulCalculations: results.filter(r => !r.error).length,
    failedCalculations: results.filter(r => r.error).length
  };
};

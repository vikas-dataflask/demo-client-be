import BeamDesign from "../../models/BeamDesign.js";

// Material Properties as per IS 456:2000
const MATERIAL_PROPERTIES = {
  concrete: {
    M20: { fck: 20, density: 25, Es: 22360 },
    M25: { fck: 25, density: 25, Es: 25000 },
    M30: { fck: 30, density: 25, Es: 27386 },
  },
  steel: {
    "Fe 415": { fy: 415, Es: 200000 },
    "Fe 500": { fy: 500, Es: 200000 },
  },
};

// IS 456 Table 19 - Design Shear Strength of Concrete (τc in N/mm²)
const CONCRETE_SHEAR_STRENGTH = {
  20: { // M20
    0.15: 0.28, 0.25: 0.35, 0.50: 0.46, 0.75: 0.54, 1.00: 0.60,
    1.25: 0.64, 1.50: 0.68, 1.75: 0.71, 2.00: 0.71, 2.25: 0.71,
    2.50: 0.71, 2.75: 0.71, 3.00: 0.71
  },
  25: { // M25
    0.15: 0.29, 0.25: 0.36, 0.50: 0.48, 0.75: 0.56, 1.00: 0.62,
    1.25: 0.67, 1.50: 0.70, 1.75: 0.73, 2.00: 0.73, 2.25: 0.73,
    2.50: 0.73, 2.75: 0.73, 3.00: 0.73
  },
  30: { // M30
    0.15: 0.31, 0.25: 0.37, 0.50: 0.50, 0.75: 0.59, 1.00: 0.65,
    1.25: 0.70, 1.50: 0.73, 1.75: 0.76, 2.00: 0.76, 2.25: 0.76,
    2.50: 0.76, 2.75: 0.76, 3.00: 0.76
  }
};

// Standard bar diameters and areas (mm²)
const BAR_PROPERTIES = {
  8: { area: 50.3, diameter: 8 },
  10: { area: 78.5, diameter: 10 },
  12: { area: 113.1, diameter: 12 },
  16: { area: 201.1, diameter: 16 },
  20: { area: 314.2, diameter: 20 },
  25: { area: 490.9, diameter: 25 },
  32: { area: 804.2, diameter: 32 },
};

/**
 * Calculate beam design as per IS 456:2000 with detailed calculation steps
 */
export const calculateBeamDesign = async (req, res) => {
  try {
    const userId = req.user.id;
    const inputData = req.body;
    const projectId = inputData.projectId;

    // Validate input data
    if (!inputData || !projectId) {
      return res.status(400).json({
        success: false,
        message: "Invalid input data or project ID",
      });
    }

    // Extract input parameters
    const {
      beamType,
      spanLength,
      beamWidth,
      beamDepth,
      concreteGrade,
      steelGrade,
      liveLoad,
      floorFinishLoad,
      superimposedLoad = 0,
      coverToSteel,
    } = inputData;

    // Initialize calculation steps array
    const calculationSteps = [];
    
    // Get material properties
    const fck = MATERIAL_PROPERTIES.concrete[concreteGrade].fck;
    const fy = MATERIAL_PROPERTIES.steel[steelGrade].fy;
    const concreteDensity = MATERIAL_PROPERTIES.concrete[concreteGrade].density;

    calculationSteps.push({
      step: "Material Properties",
      description: "Material properties as per IS 456:2000",
      formula: `fck = ${fck} N/mm², fy = ${fy} N/mm²`,
      substitution: `${concreteGrade} concrete, ${steelGrade} steel`,
      result: `Characteristic strength values obtained`,
      reference: "IS 456:2000, Table 2 & Clause 6.2.1"
    });

    // Calculate loads with detailed steps
    const beamSelfWeight = (beamWidth / 1000) * (beamDepth / 1000) * concreteDensity;
    calculationSteps.push({
      step: "Self Weight Calculation",
      description: "Self weight of RCC beam",
              formula: "Self Weight = b * D * γc",
              substitution: `= ${beamWidth}/1000 * ${beamDepth}/1000 * ${concreteDensity}`,
      result: `${beamSelfWeight.toFixed(2)} kN/m`,
      reference: "IS 456:2000, Clause 20.2.1"
    });

    const deadLoad = beamSelfWeight + floorFinishLoad;
    calculationSteps.push({
      step: "Total Dead Load",
      description: "Self weight + Floor finish load",
      formula: "DL = Self Weight + Floor Finish",
      substitution: `= ${beamSelfWeight.toFixed(2)} + ${floorFinishLoad}`,
      result: `${deadLoad.toFixed(2)} kN/m`,
      reference: "IS 456:2000, Clause 20.2"
    });

    const totalLoad = deadLoad + liveLoad + superimposedLoad;
    calculationSteps.push({
      step: "Total Load",
      description: "Dead Load + Live Load + Superimposed Load",
      formula: "Total Load = DL + LL + SDL",
      substitution: `= ${deadLoad.toFixed(2)} + ${liveLoad} + ${superimposedLoad}`,
      result: `${totalLoad.toFixed(2)} kN/m`,
      reference: "IS 456:2000, Clause 20.2"
    });

    const factoredLoad = 1.5 * totalLoad;
    calculationSteps.push({
      step: "Factored Load",
      description: "Ultimate load for design",
              formula: "wu = 1.5 * (DL + LL)",
              substitution: `= 1.5 * ${totalLoad.toFixed(2)}`,
      result: `${factoredLoad.toFixed(2)} kN/m`,
      reference: "IS 456:2000, Clause 36.4.1"
    });

    // Calculate moments and shears based on beam type
    let ultimateBendingMoment, ultimateShearForce;
    let momentCoefficient, shearCoefficient;
    let momentFormula, shearFormula;

    switch (beamType) {
      case "Simply Supported":
        momentCoefficient = 1/8;
        shearCoefficient = 1/2;
        momentFormula = "wu * L² / 8";
        shearFormula = "wu * L / 2";
        break;
      case "Continuous":
        momentCoefficient = 1/12;
        shearCoefficient = 0.6;
        momentFormula = "wu * L² / 12";
        shearFormula = "0.6 * wu * L";
        break;
      case "Cantilever":
        momentCoefficient = 1/2;
        shearCoefficient = 1;
        momentFormula = "wu * L² / 2";
        shearFormula = "wu * L";
        break;
      default:
        momentCoefficient = 1/8;
        shearCoefficient = 1/2;
        momentFormula = "wu * L² / 8";
        shearFormula = "wu * L / 2";
    }

    ultimateBendingMoment = factoredLoad * Math.pow(spanLength, 2) * momentCoefficient;
    ultimateShearForce = factoredLoad * spanLength * shearCoefficient;

    calculationSteps.push({
      step: "Ultimate Bending Moment",
      description: `Maximum moment for ${beamType.toLowerCase()} beam`,
      formula: `Mu = ${momentFormula}`,
      substitution: `= ${factoredLoad.toFixed(2)} * ${spanLength}² * ${momentCoefficient.toFixed(3)}`,
      result: `${ultimateBendingMoment.toFixed(2)} kN-m`,
      reference: "IS 456:2000, Annexure C"
    });

    calculationSteps.push({
      step: "Ultimate Shear Force",
      description: `Maximum shear for ${beamType.toLowerCase()} beam`,
      formula: `Vu = ${shearFormula}`,
      substitution: `= ${factoredLoad.toFixed(2)} * ${spanLength} * ${shearCoefficient.toFixed(1)}`,
      result: `${ultimateShearForce.toFixed(2)} kN`,
      reference: "IS 456:2000, Annexure C"
    });

    // Calculate effective depth
    const assumedBarDia = 16; // Assuming 16mm main bars
    const stirrupDia = 8; // Assuming 8mm stirrups
    const effectiveDepth = beamDepth - coverToSteel - stirrupDia - assumedBarDia/2;
    
    calculationSteps.push({
      step: "Effective Depth",
      description: "Available depth for tension reinforcement",
      formula: "d = D - cover - φstirrup - φbar/2",
      substitution: `= ${beamDepth} - ${coverToSteel} - ${stirrupDia} - ${assumedBarDia}/2`,
      result: `${effectiveDepth.toFixed(0)} mm`,
      reference: "IS 456:2000, Clause 26.5.1.1"
    });
    
    // Flexural design calculations
    const Mu = ultimateBendingMoment * 1000000; // Convert to N-mm
    const b = beamWidth;
    const d = effectiveDepth;

    // Check if singly reinforced is adequate
    const Ru = Mu / (b * d * d);
    const Ru_limit = 0.138 * fck;

    calculationSteps.push({
      step: "Moment Resistance Factor",
      description: "Check for singly reinforced beam adequacy",
      formula: "Ru = Mu / (b * d²)",
      substitution: `= ${Mu.toExponential(2)} / (${b} * ${d}²)`,
      result: `${Ru.toFixed(3)} N/mm²`,
      reference: "IS 456:2000, Clause 38.1"
    });

    calculationSteps.push({
      step: "Limiting Moment Resistance",
      description: "Maximum resistance for singly reinforced section",
      formula: "Ru,lim = 0.138 * fck",
      substitution: `= 0.138 * ${fck}`,
      result: `${Ru_limit.toFixed(3)} N/mm²`,
      reference: "IS 456:2000, Clause 38.1"
    });

    let requiredFlexuralSteel;
    let neutralAxisDepth;
    let leverArm;
    let sectionType = "Singly Reinforced";

    if (Ru <= Ru_limit) {
      // Singly reinforced beam
      const k = Ru / (0.87 * fy);
      neutralAxisDepth = d * (1 - Math.sqrt(1 - 2 * k));
      leverArm = d - neutralAxisDepth / 3;
      requiredFlexuralSteel = Mu / (0.87 * fy * leverArm);

      calculationSteps.push({
        step: "Neutral Axis Depth",
        description: "Depth of neutral axis from compression face",
        formula: "xu = d * [1 - √(1 - 2k)] where k = Ru/(0.87*fy)",
        substitution: `k = ${Ru.toFixed(3)}/(0.87*${fy}) = ${k.toFixed(6)}, xu = ${d} * [1 - √(1 - 2*${k.toFixed(6)})]`,
        result: `${neutralAxisDepth.toFixed(1)} mm`,
        reference: "IS 456:2000, Clause 38.1"
      });

      calculationSteps.push({
        step: "Lever Arm",
        description: "Distance between compressive and tensile resultants",
        formula: "z = d - xu/3",
        substitution: `= ${d} - ${neutralAxisDepth.toFixed(1)}/3`,
        result: `${leverArm.toFixed(1)} mm`,
        reference: "IS 456:2000, Clause 38.1"
      });
    } else {
      // Doubly reinforced beam
      sectionType = "Doubly Reinforced";
      neutralAxisDepth = 0.48 * d; // Balanced section
      leverArm = d - neutralAxisDepth / 3;
      requiredFlexuralSteel = Mu / (0.87 * fy * leverArm);

      calculationSteps.push({
        step: "Section Type",
        description: "Doubly reinforced section required",
        formula: "Ru > Ru,lim",
        substitution: `${Ru.toFixed(3)} > ${Ru_limit.toFixed(3)}`,
        result: "Doubly reinforced section",
        reference: "IS 456:2000, Clause 38.1"
      });
    }

    calculationSteps.push({
      step: "Required Steel Area",
      description: "Steel area from moment equilibrium",
      formula: "Ast = Mu / (0.87 * fy * z)",
      substitution: `= ${Mu.toExponential(2)} / (0.87 * ${fy} * ${leverArm.toFixed(1)})`,
      result: `${requiredFlexuralSteel.toFixed(0)} mm²`,
      reference: "IS 456:2000, Clause 38.1"
    });

    // Minimum steel as per IS 456:2000
    const minimumFlexuralSteel = (0.85 * b * d) / fy;
    calculationSteps.push({
      step: "Minimum Steel Area",
      description: "Minimum reinforcement requirement",
      formula: "Ast,min = 0.85 * b * d / fy",
      substitution: `= 0.85 * ${b} * ${d} / ${fy}`,
      result: `${minimumFlexuralSteel.toFixed(0)} mm²`,
      reference: "IS 456:2000, Clause 26.5.1.1"
    });

    // Provided steel area
    const providedFlexuralSteel = Math.max(requiredFlexuralSteel, minimumFlexuralSteel);
    const governingCriteria = requiredFlexuralSteel > minimumFlexuralSteel ? "Moment" : "Minimum steel";
    
    calculationSteps.push({
      step: "Provided Steel Area",
      description: "Maximum of required and minimum steel",
      formula: "Ast,provided = max(Ast,required, Ast,min)",
      substitution: `= max(${requiredFlexuralSteel.toFixed(0)}, ${minimumFlexuralSteel.toFixed(0)})`,
      result: `${providedFlexuralSteel.toFixed(0)} mm² (${governingCriteria} governs)`,
      reference: "IS 456:2000, Clause 26.5.1.1"
    });

    // Calculate reinforcement percentage
    const flexuralSteelRatio = (providedFlexuralSteel / (b * d)) * 100;
    calculationSteps.push({
      step: "Reinforcement Percentage",
      description: "Percentage of steel reinforcement",
      formula: "p = (Ast / (b * d)) * 100",
      substitution: `= (${providedFlexuralSteel.toFixed(0)} / (${b} * ${d})) * 100`,
      result: `${flexuralSteelRatio.toFixed(2)}%`,
      reference: "IS 456:2000, Clause 26.5.1.1"
    });

    // Determine main bar configuration
    const mainBarConfig = calculateMainReinforcement(providedFlexuralSteel, beamWidth);
    calculationSteps.push({
      step: "Main Bar Selection",
      description: "Selection of main reinforcement bars",
      formula: `Number of bars = Ast / Area of single bar`,
      substitution: `= ${providedFlexuralSteel.toFixed(0)} / ${BAR_PROPERTIES[mainBarConfig.barSize].area.toFixed(1)}`,
      result: `${mainBarConfig.numberOfBars} nos ${mainBarConfig.barSize}mm φ bars`,
      reference: "IS 456:2000, Clause 26.5.1"
    });

    // Shear design calculations
    const Vu = ultimateShearForce * 1000; // Convert to N
    const shearStress = Vu / (b * d);
    
    calculationSteps.push({
      step: "Nominal Shear Stress",
      description: "Shear stress in concrete",
      formula: "τv = Vu / (b * d)",
      substitution: `= ${Vu.toFixed(0)} / (${b} * ${d})`,
      result: `${shearStress.toFixed(3)} N/mm²`,
      reference: "IS 456:2000, Clause 40.1"
    });
    
    // Get concrete shear capacity
    const concreteShearCapacity = getConcreteShearCapacity(fck, flexuralSteelRatio);
    calculationSteps.push({
      step: "Concrete Shear Capacity",
      description: "Permissible shear stress in concrete",
      formula: "τc from IS 456:2000 Table 19",
      substitution: `For fck = ${fck} N/mm², p = ${flexuralSteelRatio.toFixed(2)}%`,
      result: `${concreteShearCapacity.toFixed(3)} N/mm²`,
      reference: "IS 456:2000, Table 19"
    });

    const shearReinforcementRequired = shearStress > concreteShearCapacity;
    const shearCheck = shearReinforcementRequired ? "Required" : "Not Required";
    
    calculationSteps.push({
      step: "Shear Reinforcement Check",
      description: "Check if stirrups are required",
      formula: "τv compared with τc",
      substitution: `${shearStress.toFixed(3)} vs ${concreteShearCapacity.toFixed(3)} N/mm²`,
      result: `Stirrups ${shearCheck}`,
      reference: "IS 456:2000, Clause 40.1"
    });

    // Calculate stirrup requirements if needed
    let stirrupConfig = { barSize: "8", spacing: 300, legs: 2, area: 0 };
    
    if (shearReinforcementRequired) {
      const shearToBeCarriedBySteel = shearStress - concreteShearCapacity;
      stirrupConfig = calculateStirrupReinforcement(
        shearToBeCarriedBySteel,
        b,
        d,
        fy,
        beamDepth
      );

      calculationSteps.push({
        step: "Stirrup Spacing Calculation",
        description: "Spacing of vertical stirrups",
        formula: "Sv = 0.87 * fy * Asv / (τv-req * b)",
        substitution: `Required τv = ${shearToBeCarriedBySteel.toFixed(3)} N/mm²`,
        result: `T${stirrupConfig.barSize} - ${stirrupConfig.legs} legged @ ${stirrupConfig.spacing}mm c/c`,
        reference: "IS 456:2000, Clause 40.4"
      });
    }

    // Perform design checks
    const checks = performBeamDesignChecks({
      beamType,
      spanLength,
      beamWidth,
      beamDepth,
      effectiveDepth,
      providedFlexuralSteel,
      minimumFlexuralSteel,
      flexuralSteelRatio,
      shearStress,
      concreteShearCapacity,
      stirrupConfig,
      fck,
      fy,
    });

    // Determine overall design status
    const designStatus = Object.values(checks).every(check => check.status === "Pass") ? "Pass" : "Fail";

    // Create design notes
    const designNotes = generateBeamDesignNotes({
      beamType,
      shearReinforcementRequired,
      checks,
      sectionType,
      governingCriteria,
    });

    // Prepare response data
    const responseData = {
      inputParameters: {
        beamType,
        spanLength,
        beamWidth,
        beamDepth,
        concreteGrade,
        steelGrade,
        liveLoad,
        floorFinishLoad,
        superimposedLoad,
        coverToSteel,
      },
      calculatedResults: {
        // Material Properties
        fck,
        fy,
        
        // Load Calculations
        selfWeight: parseFloat(beamSelfWeight.toFixed(2)),
        deadLoad: parseFloat(deadLoad.toFixed(2)),
        totalLoad: parseFloat(totalLoad.toFixed(2)),
        factoredLoad: parseFloat(factoredLoad.toFixed(2)),
        
        // Moment and Shear
        ultimateBendingMoment: parseFloat(ultimateBendingMoment.toFixed(2)),
        ultimateShearForce: parseFloat(ultimateShearForce.toFixed(2)),
        momentCoefficient: parseFloat(momentCoefficient.toFixed(3)),
        shearCoefficient: parseFloat(shearCoefficient.toFixed(3)),
        
        // Depth and Section Properties
        effectiveDepth: parseFloat(effectiveDepth.toFixed(0)),
        neutralAxisDepth: parseFloat(neutralAxisDepth.toFixed(1)),
        leverArm: parseFloat(leverArm.toFixed(1)),
        
        // Flexural Steel Calculations
        requiredFlexuralSteel: parseFloat(requiredFlexuralSteel.toFixed(0)),
        minimumFlexuralSteel: parseFloat(minimumFlexuralSteel.toFixed(0)),
        providedFlexuralSteel: parseFloat(providedFlexuralSteel.toFixed(0)),
        flexuralSteelRatio: parseFloat(flexuralSteelRatio.toFixed(2)),
        
        // Reinforcement Details
        mainBarSize: `T${mainBarConfig.barSize}`,
        numberOfMainBars: mainBarConfig.numberOfBars,
        mainBarArea: parseFloat(mainBarConfig.providedArea.toFixed(0)),
        
        // Shear Calculations
        shearStress: parseFloat(shearStress.toFixed(3)),
        concreteShearCapacity: parseFloat(concreteShearCapacity.toFixed(3)),
        shearReinforcementRequired,
        
        // Stirrup Details
        stirrupBarSize: `T${stirrupConfig.barSize}`,
        stirrupSpacing: stirrupConfig.spacing,
        stirrupLegs: stirrupConfig.legs,
        stirrupArea: parseFloat(stirrupConfig.area.toFixed(0)),
        
        // Design Checks
        checks,
        
        // Overall Design Status
        designStatus,
        
        // Section Type
        sectionType,
        
        // Additional Notes
        designNotes,
      },
      
      // Detailed calculation steps with formulas
      calculationSteps,
    };

    // Save to database
    try {
      const beamDesign = new BeamDesign({
        project: projectId,
        user: userId,
        designName: `${beamType} Beam - ${Date.now()}`,
        inputParameters: responseData.inputParameters,
        calculatedResults: responseData.calculatedResults,
      });

      await beamDesign.save();
      responseData.designId = beamDesign._id;
    } catch (dbError) {
      console.log("Database save error:", dbError.message);
      // Continue without saving to database
    }

    res.status(200).json({
      success: true,
      message: "Beam design calculation completed successfully",
      data: responseData,
    });

  } catch (error) {
    console.error("Beam design calculation error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error during beam design calculation",
      error: error.message,
    });
  }
};

// Helper function to calculate main reinforcement
function calculateMainReinforcement(requiredArea, beamWidth) {
  const barSizes = [12, 16, 20, 25];
  
  for (const barSize of barSizes) {
    const barArea = BAR_PROPERTIES[barSize].area;
    const numberOfBars = Math.ceil(requiredArea / barArea);
    
    // Check if bars can fit in the beam width
    const spacing = (beamWidth - 2 * 50) / (numberOfBars - 1); // 50mm clear cover on sides
    
    if (spacing >= 75 && numberOfBars <= 6) { // Minimum 75mm spacing, maximum 6 bars
      return {
        barSize,
        numberOfBars,
        providedArea: numberOfBars * barArea,
        spacing: Math.round(spacing),
      };
    }
  }
  
  // Default if no suitable arrangement found
  return {
    barSize: 16,
    numberOfBars: Math.ceil(requiredArea / BAR_PROPERTIES[16].area),
    providedArea: Math.ceil(requiredArea / BAR_PROPERTIES[16].area) * BAR_PROPERTIES[16].area,
    spacing: 150,
  };
}

// Helper function to get concrete shear capacity from IS 456 Table 19
function getConcreteShearCapacity(fck, steelPercentage) {
  const table = CONCRETE_SHEAR_STRENGTH[fck];
  if (!table) return 0.25; // Default conservative value
  
  // Find closest percentage match
  const percentages = Object.keys(table).map(Number);
  let closestPercentage = percentages[0];
  
  for (const p of percentages) {
    if (Math.abs(steelPercentage - p) < Math.abs(steelPercentage - closestPercentage)) {
      closestPercentage = p;
    }
  }
  
  return table[closestPercentage];
}

// Helper function to calculate stirrup reinforcement
function calculateStirrupReinforcement(shearStress, width, depth, fy, beamDepth) {
  const stirrupBarSize = 8; // Standard stirrup size
  const stirrupArea = BAR_PROPERTIES[stirrupBarSize].area;
  const numberOfLegs = 2; // 2-legged stirrups
  
  // Calculate required spacing
  const Asv = numberOfLegs * stirrupArea; // Total stirrup area
  const requiredSpacing = (0.87 * fy * Asv) / (shearStress * width);
  
  // Apply limits as per IS 456:2000
  const maxSpacing = Math.min(
    0.75 * depth,  // 0.75d
    300,           // 300mm
    requiredSpacing
  );
  
  // Standard spacing intervals
  const standardSpacings = [75, 100, 125, 150, 175, 200, 225, 250, 275, 300];
  let finalSpacing = standardSpacings.find(s => s <= maxSpacing) || 75;
  
  return {
    barSize: stirrupBarSize,
    spacing: finalSpacing,
    legs: numberOfLegs,
    area: Asv,
  };
}

// Helper function to perform design checks
function performBeamDesignChecks(params) {
  const checks = {};
  
  // Minimum steel check
  checks.minimumSteelCheck = {
    status: params.providedFlexuralSteel >= params.minimumFlexuralSteel ? "Pass" : "Fail",
    value: params.providedFlexuralSteel,
    requirement: params.minimumFlexuralSteel,
  };
  
  // Maximum steel check (4% of gross area as per IS 456)
  const maxSteel = 0.04 * params.beamWidth * params.beamDepth;
  checks.maximumSteelCheck = {
    status: params.providedFlexuralSteel <= maxSteel ? "Pass" : "Fail",
    value: params.providedFlexuralSteel,
    requirement: maxSteel,
  };
  
  // Deflection check (span to depth ratio)
  const basicRatio = params.beamType === "Cantilever" ? 7 : 
                     params.beamType === "Simply Supported" ? 20 : 26;
  const modificationFactor = 0.85 + 0.15 * (100 * params.flexuralSteelRatio / 2);
  const allowableRatio = basicRatio * modificationFactor;
  const actualRatio = (params.spanLength * 1000) / params.effectiveDepth;
  
  checks.deflectionCheck = {
    status: actualRatio <= allowableRatio ? "Pass" : "Warning",
    value: actualRatio,
    requirement: allowableRatio,
  };
  
  // Shear check
  checks.shearCheck = {
    status: params.shearStress <= params.concreteShearCapacity ? "Pass" : "Fail",
    value: params.shearStress,
    requirement: params.concreteShearCapacity,
  };
  
  // Stirrup spacing check
  const maxStirrupSpacing = Math.min(0.75 * params.effectiveDepth, 300);
  checks.stirrupSpacingCheck = {
    status: params.stirrupConfig.spacing <= maxStirrupSpacing ? "Pass" : "Fail",
    value: params.stirrupConfig.spacing,
    requirement: maxStirrupSpacing,
  };
  
  return checks;
}

// Helper function to generate design notes
function generateBeamDesignNotes(params) {
  const notes = [];
  
  notes.push(`Design completed for ${params.beamType.toLowerCase()} beam as per IS 456:2000`);
  notes.push(`${params.sectionType} section adopted`);
  notes.push(`Steel requirement governed by ${params.governingCriteria.toLowerCase()}`);
  
  if (params.shearReinforcementRequired) {
    notes.push("Stirrups required for shear resistance");
  } else {
    notes.push("Concrete adequate for shear resistance - stirrups as per minimum requirement");
  }
  
  // Add warnings based on checks
  Object.entries(params.checks).forEach(([checkName, check]) => {
    if (check.status === "Fail") {
      notes.push(`Warning: ${checkName.replace(/([A-Z])/g, ' $1').toLowerCase()} failed`);
    }
  });
  
  notes.push("Design based on Limit State Method for flexure and shear");
  
  return notes;
}

// Get single beam design
export const getBeamDesign = async (req, res) => {
  try {
    const { designId } = req.params;
    const userId = req.user.id;

    const beamDesign = await BeamDesign.findOne({
      _id: designId,
      user: userId,
    }).populate("project", "name");

    if (!beamDesign) {
      return res.status(404).json({
        success: false,
        message: "Beam design not found",
      });
    }

    res.status(200).json({
      success: true,
      data: beamDesign,
    });
  } catch (error) {
    console.error("Error fetching beam design:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching beam design",
      error: error.message,
    });
  }
};

// Get all beam designs for a project
export const getProjectBeamDesigns = async (req, res) => {
  try {
    const { projectId } = req.params;
    const userId = req.user.id;

    const beamDesigns = await BeamDesign.find({
      project: projectId,
      user: userId,
      isActive: true,
    })
      .populate("project", "name")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: beamDesigns.length,
      data: beamDesigns,
    });
  } catch (error) {
    console.error("Error fetching project beam designs:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching project beam designs",
      error: error.message,
    });
  }
};

/**
 * Update beam design
 */
export const updateBeamDesign = async (req, res) => {
  try {
    const { designId } = req.params;
    const userId = req.user.id;
    const updateData = req.body;

    const beamDesign = await BeamDesign.findByIdAndUpdate(
      designId,
      updateData,
      { new: true, runValidators: true }
    );

    if (!beamDesign) {
      return res.status(404).json({
        success: false,
        message: "Beam design not found"
      });
    }

    if (beamDesign.user.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: "Access denied"
      });
    }

    return res.status(200).json({
      success: true,
      message: "Beam design updated successfully",
      data: beamDesign
    });

  } catch (error) {
    console.error('Error in updateBeamDesign:', error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message
    });
  }
};

/**
 * Delete beam design
 */
export const deleteBeamDesign = async (req, res) => {
  try {
    const { designId } = req.params;
    const userId = req.user.id;

    const beamDesign = await BeamDesign.findByIdAndDelete(designId);

    if (!beamDesign) {
      return res.status(404).json({
        success: false,
        message: "Beam design not found"
      });
    }

    if (beamDesign.user.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: "Access denied"
      });
    }

    return res.status(200).json({
      success: true,
      message: "Beam design deleted successfully"
    });

  } catch (error) {
    console.error('Error in deleteBeamDesign:', error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message
    });
  }
};

// Alias for backward compatibility
export const designBeam = calculateBeamDesign;

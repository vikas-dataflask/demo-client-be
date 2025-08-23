import StaircaseDesign from '../../models/StaircaseDesign.js';

// Create comprehensive staircase design with detailed calculations
export const createStaircaseDesign = async (req, res) => {
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

    const {
      staircaseType,
      totalVerticalRise,
      risePerStep,
      tread,
      floorToFloorHeight,
      spanOfStair,
      widthOfStair,
      waistThickness,
      liveLoad,
      finishesLoad,
      concreteGrade,
      steelGrade,
      clearCover,
      mainBarDiameter,
      distributionBarDiameter
    } = inputData;

    // Input validation
    if (!staircaseType || !totalVerticalRise || !risePerStep || !tread || 
        !spanOfStair || !widthOfStair || !waistThickness || 
        !concreteGrade || !steelGrade || !clearCover || 
        !mainBarDiameter || !distributionBarDiameter) {
      return res.status(400).json({ error: 'All required fields must be provided' });
    }

    // Material properties based on IS 456:2000
    const fckValues = { 'M20': 20, 'M25': 25, 'M30': 30 };
    const fyValues = { 'Fe 415': 415, 'Fe 500': 500 };
    
    const fck = fckValues[concreteGrade];
    const fy = fyValues[steelGrade];
    
    if (!fck || !fy) {
      return res.status(400).json({ error: 'Invalid concrete or steel grade' });
    }

    // Initialize calculation steps array
    const calculationSteps = [];
    
    // Step 1: Material Properties
    calculationSteps.push({
      step: 1,
      title: "Material Properties",
      formula: "fck = Characteristic compressive strength of concrete",
      substitution: `fck = ${fck} N/mm² (${concreteGrade})`,
      result: `${fck} N/mm²`,
      isCodeReference: "IS 456:2000 Table 2"
    });

    calculationSteps.push({
      step: 2,
      title: "Steel Properties",
      formula: "fy = Characteristic yield strength of steel",
      substitution: `fy = ${fy} N/mm² (${steelGrade})`,
      result: `${fy} N/mm²`,
      isCodeReference: "IS 456:2000 Table 3"
    });

    // Step 3: Calculate Number of Steps
    const numberOfSteps = Math.ceil(totalVerticalRise / risePerStep);
    calculationSteps.push({
      step: 3,
      title: "Number of Steps",
      formula: "N = Total Rise / Rise per step",
      substitution: `N = ${totalVerticalRise} / ${risePerStep} = ${numberOfSteps}`,
      result: `${numberOfSteps} steps`,
      isCodeReference: "Design Calculation"
    });

    // Step 4: Calculate Going (Total Horizontal Distance)
    const totalGoing = (numberOfSteps - 1) * tread;
    calculationSteps.push({
      step: 4,
      title: "Total Going (Horizontal Distance)",
      formula: "G = (N - 1) * Tread",
      substitution: `G = (${numberOfSteps} - 1) * ${tread} = ${totalGoing} mm`,
      result: `${totalGoing} mm`,
      isCodeReference: "IS 456:2000 Cl. 33.3"
    });

    // Step 5: Calculate Inclination Angle
    const inclinationAngle = Math.atan(totalVerticalRise / totalGoing) * (180 / Math.PI);
    calculationSteps.push({
      step: 5,
      title: "Inclination Angle",
      formula: "θ = arctan(Total Rise / Total Going)",
      substitution: `θ = arctan(${totalVerticalRise} / ${totalGoing}) = ${inclinationAngle.toFixed(2)}°`,
      result: `${inclinationAngle.toFixed(2)}°`,
      isCodeReference: "Design Calculation"
    });

    // Step 6: Check Riser-Tread Relationship
    const riserTreadSum = 2 * risePerStep + tread;
    const riserTreadCheck = riserTreadSum >= 550 && riserTreadSum <= 700;
    calculationSteps.push({
      step: 6,
      title: "Riser-Tread Relationship Check",
      formula: "2R + T = 550 to 700 mm",
      substitution: `2 * ${risePerStep} + ${tread} = ${riserTreadSum} mm`,
      result: riserTreadCheck ? "SATISFACTORY" : "NOT SATISFACTORY",
      isCodeReference: "IS 456:2000 Cl. 33.3"
    });

    // Step 7: Dead Load Calculation
    const waistSlabWeight = (waistThickness / 1000) * 25 * (widthOfStair / 1000); // kN/m run
    const stepWeight = (risePerStep / 2000) * 25 * (widthOfStair / 1000); // Average triangular load
    const deadLoadPerMeter = waistSlabWeight + stepWeight + (finishesLoad || 1.0) * (widthOfStair / 1000);

    calculationSteps.push({
      step: 7,
      title: "Dead Load - Waist Slab",
      formula: "DL_waist = t * γ_c * width",
      substitution: `DL_waist = ${waistThickness/1000} * 25 * ${widthOfStair/1000} = ${waistSlabWeight.toFixed(2)} kN/m`,
      result: `${waistSlabWeight.toFixed(2)} kN/m`,
      isCodeReference: "IS 875 Part 1"
    });

    calculationSteps.push({
      step: 8,
      title: "Dead Load - Steps",
      formula: "DL_steps = (R/2) * γ_c * width",
      substitution: `DL_steps = (${risePerStep}/2) * 25 * ${widthOfStair/1000} / 1000 = ${stepWeight.toFixed(2)} kN/m`,
      result: `${stepWeight.toFixed(2)} kN/m`,
      isCodeReference: "IS 875 Part 1"
    });

    calculationSteps.push({
      step: 9,
      title: "Total Dead Load",
      formula: "DL_total = DL_waist + DL_steps + Finishes",
      substitution: `DL_total = ${waistSlabWeight.toFixed(2)} + ${stepWeight.toFixed(2)} + ${(finishesLoad || 1.0) * (widthOfStair / 1000)} = ${deadLoadPerMeter.toFixed(2)} kN/m`,
      result: `${deadLoadPerMeter.toFixed(2)} kN/m`,
      isCodeReference: "IS 875 Part 1"
    });

    // Step 10: Live Load
    const liveLoadPerMeter = (liveLoad || 3.0) * (widthOfStair / 1000);
    calculationSteps.push({
      step: 10,
      title: "Live Load",
      formula: "LL = Live load intensity * width",
      substitution: `LL = ${liveLoad || 3.0} * ${widthOfStair/1000} = ${liveLoadPerMeter.toFixed(2)} kN/m`,
      result: `${liveLoadPerMeter.toFixed(2)} kN/m`,
      isCodeReference: "IS 875 Part 2"
    });

    // Step 11: Total Load per meter run
    const totalLoadPerMeter = deadLoadPerMeter + liveLoadPerMeter;
    calculationSteps.push({
      step: 11,
      title: "Total Load per meter run",
      formula: "w = DL + LL",
      substitution: `w = ${deadLoadPerMeter.toFixed(2)} + ${liveLoadPerMeter.toFixed(2)} = ${totalLoadPerMeter.toFixed(2)} kN/m`,
      result: `${totalLoadPerMeter.toFixed(2)} kN/m`,
      isCodeReference: "IS 875"
    });

    // Step 12: Factored Load
    const cosTheta = Math.cos(inclinationAngle * Math.PI / 180);
    const factoredLoad = (1.5 * totalLoadPerMeter) / cosTheta;
    calculationSteps.push({
      step: 12,
      title: "Factored Load (along slope)",
      formula: "wu = 1.5 * w / cos(θ)",
      substitution: `wu = 1.5 * ${totalLoadPerMeter.toFixed(2)} / cos(${inclinationAngle.toFixed(2)}°) = ${factoredLoad.toFixed(2)} kN/m`,
      result: `${factoredLoad.toFixed(2)} kN/m`,
      isCodeReference: "IS 456:2000 Cl. 36.4"
    });

    // Step 13: Bending Moment
    const span = spanOfStair; // Already in meters
    const bendingMoment = (factoredLoad * span * span) / 8;
    calculationSteps.push({
      step: 13,
      title: "Bending Moment",
      formula: "Mu = wu * L² / 8",
      substitution: `Mu = ${factoredLoad.toFixed(2)} * ${span}² / 8 = ${bendingMoment.toFixed(2)} kNm`,
      result: `${bendingMoment.toFixed(2)} kNm`,
      isCodeReference: "IS 456:2000 Cl. 22.2"
    });

    // Step 14: Effective Depth Calculation
    const effectiveDepth = waistThickness - clearCover - mainBarDiameter/2;
    calculationSteps.push({
      step: 14,
      title: "Effective Depth",
      formula: "d = D - cover - φ/2",
      substitution: `d = ${waistThickness} - ${clearCover} - ${mainBarDiameter}/2 = ${effectiveDepth} mm`,
      result: `${effectiveDepth} mm`,
      isCodeReference: "IS 456:2000 Cl. 26.4.1"
    });

    // Step 15: Check depth adequacy
    const requiredDepth = Math.sqrt((bendingMoment * 1000000) / (0.138 * fck * widthOfStair));
    calculationSteps.push({
      step: 15,
      title: "Required Depth Check",
      formula: "d_req = √(Mu * 10⁶ / (0.138 * fck * b))",
      substitution: `d_req = √(${bendingMoment.toFixed(2)} * 10⁶ / (0.138 * ${fck} * ${widthOfStair})) = ${requiredDepth.toFixed(1)} mm`,
      result: `${requiredDepth.toFixed(1)} mm`,
      isCodeReference: "IS 456:2000 Cl. 38.1"
    });

    const depthCheck = effectiveDepth >= requiredDepth;
    calculationSteps.push({
      step: 16,
      title: "Depth Adequacy Check",
      formula: "d_provided >= d_req",
      substitution: `${effectiveDepth} >= ${requiredDepth.toFixed(1)}`,
      result: depthCheck ? "SAFE" : "UNSAFE",
      isCodeReference: "IS 456:2000 Cl. 38.1"
    });

    // Step 17: Steel Area Calculation
    const jValue = 0.9; // Assumed lever arm factor
    const requiredSteelArea = (bendingMoment * 1000000) / (0.87 * fy * jValue * effectiveDepth);
    calculationSteps.push({
      step: 17,
      title: "Required Steel Area",
      formula: "Ast = Mu * 10⁶ / (0.87 * fy * j * d)",
      substitution: `Ast = ${bendingMoment.toFixed(2)} * 10⁶ / (0.87 * ${fy} * ${jValue} * ${effectiveDepth}) = ${requiredSteelArea.toFixed(0)} mm²`,
      result: `${requiredSteelArea.toFixed(0)} mm²`,
      isCodeReference: "IS 456:2000 Cl. 38.1"
    });

    // Step 18: Minimum Steel Area
    const minimumSteelArea = 0.0012 * widthOfStair * waistThickness;
    calculationSteps.push({
      step: 18,
      title: "Minimum Steel Area",
      formula: "Ast_min = 0.0012 * b * D",
      substitution: `Ast_min = 0.0012 * ${widthOfStair} * ${waistThickness} = ${minimumSteelArea.toFixed(0)} mm²`,
      result: `${minimumSteelArea.toFixed(0)} mm²`,
      isCodeReference: "IS 456:2000 Cl. 26.5.2.1"
    });

    // Step 19: Provided Steel Area
    const providedSteelArea = Math.max(requiredSteelArea, minimumSteelArea);
    calculationSteps.push({
      step: 19,
      title: "Provided Steel Area",
      formula: "Ast_provided = max(Ast, Ast_min)",
      substitution: `Ast_provided = max(${requiredSteelArea.toFixed(0)}, ${minimumSteelArea.toFixed(0)}) = ${providedSteelArea.toFixed(0)} mm²`,
      result: `${providedSteelArea.toFixed(0)} mm²`,
      isCodeReference: "IS 456:2000 Cl. 26.5.2.1"
    });

    // Step 20: Main Reinforcement Details
    const mainBarArea = Math.PI * Math.pow(mainBarDiameter, 2) / 4;
    const numberOfMainBars = Math.ceil(providedSteelArea / mainBarArea);
    const mainBarSpacing = Math.floor(widthOfStair / numberOfMainBars);

    calculationSteps.push({
      step: 20,
      title: "Main Reinforcement - Number of Bars",
      formula: "n = Ast_provided / Area_per_bar",
      substitution: `n = ${providedSteelArea.toFixed(0)} / ${mainBarArea.toFixed(1)} = ${numberOfMainBars}`,
      result: `${numberOfMainBars} bars`,
      isCodeReference: "Design Calculation"
    });

    calculationSteps.push({
      step: 21,
      title: "Main Reinforcement - Spacing",
      formula: "s = width / number_of_bars",
      substitution: `s = ${widthOfStair} / ${numberOfMainBars} = ${mainBarSpacing} mm`,
      result: `${mainBarSpacing} mm c/c`,
      isCodeReference: "IS 456:2000 Cl. 26.3.3"
    });

    // Step 22: Distribution Steel
    const distributionSteelArea = Math.max(0.15 * providedSteelArea, 0.0012 * widthOfStair * waistThickness);
    const distributionBarArea = Math.PI * Math.pow(distributionBarDiameter, 2) / 4;
    const numberOfDistributionBars = Math.ceil(distributionSteelArea / distributionBarArea);
    const distributionBarSpacing = Math.floor(widthOfStair / numberOfDistributionBars);

    calculationSteps.push({
      step: 22,
      title: "Distribution Steel Area",
      formula: "Ast_dist = max(0.15 * Ast_main, 0.12% * b * D)",
      substitution: `Ast_dist = max(0.15 * ${providedSteelArea.toFixed(0)}, ${(0.0012 * widthOfStair * waistThickness).toFixed(0)}) = ${distributionSteelArea.toFixed(0)} mm²`,
      result: `${distributionSteelArea.toFixed(0)} mm²`,
      isCodeReference: "IS 456:2000 Cl. 26.5.2.2"
    });

    calculationSteps.push({
      step: 23,
      title: "Distribution Steel - Spacing",
      formula: "s_dist = width / number_of_bars",
      substitution: `s_dist = ${widthOfStair} / ${numberOfDistributionBars} = ${distributionBarSpacing} mm`,
      result: `${distributionBarSpacing} mm c/c`,
      isCodeReference: "IS 456:2000 Cl. 26.3.3"
    });

    // Step 24: Shear Force and Check
    const shearForce = (factoredLoad * span) / 2;
    const shearStress = (shearForce * 1000) / (widthOfStair * effectiveDepth);
    const allowableShearStress = 0.25 * Math.sqrt(fck); // τc_max

    calculationSteps.push({
      step: 24,
      title: "Shear Force",
      formula: "Vu = wu * L / 2",
      substitution: `Vu = ${factoredLoad.toFixed(2)} * ${span} / 2 = ${shearForce.toFixed(2)} kN`,
      result: `${shearForce.toFixed(2)} kN`,
      isCodeReference: "IS 456:2000 Cl. 40.1"
    });

    calculationSteps.push({
      step: 25,
      title: "Shear Stress",
      formula: "τv = Vu * 1000 / (b * d)",
      substitution: `τv = ${shearForce.toFixed(2)} * 1000 / (${widthOfStair} * ${effectiveDepth}) = ${shearStress.toFixed(3)} N/mm²`,
      result: `${shearStress.toFixed(3)} N/mm²`,
      isCodeReference: "IS 456:2000 Cl. 40.1"
    });

    const shearCheck = shearStress <= allowableShearStress;
    calculationSteps.push({
      step: 26,
      title: "Shear Check",
      formula: "τv <= τc_max",
      substitution: `${shearStress.toFixed(3)} <= ${allowableShearStress.toFixed(3)}`,
      result: shearCheck ? "SAFE" : "UNSAFE",
      isCodeReference: "IS 456:2000 Table 20"
    });

    // Step 27: Deflection Check
    const spanToDepthRatio = (span * 1000) / effectiveDepth;
    const allowableSpanToDepthRatio = 20; // For simply supported slabs
    const deflectionCheck = spanToDepthRatio <= allowableSpanToDepthRatio;

    calculationSteps.push({
      step: 27,
      title: "Deflection Check",
      formula: "L/d <= 20 (for simply supported)",
      substitution: `${span * 1000}/${effectiveDepth} = ${spanToDepthRatio.toFixed(1)} <= 20`,
      result: deflectionCheck ? "SAFE" : "EXCESSIVE DEFLECTION",
      isCodeReference: "IS 456:2000 Cl. 23.2.1"
    });

    // Step 28: Development Length
    const developmentLength = (mainBarDiameter * fy) / (4 * 1.6 * Math.sqrt(fck));
    calculationSteps.push({
      step: 28,
      title: "Development Length",
      formula: "Ld = φ * fy / (4 * τbd)",
      substitution: `Ld = ${mainBarDiameter} * ${fy} / (4 * 1.6 * √${fck}) = ${developmentLength.toFixed(0)} mm`,
      result: `${developmentLength.toFixed(0)} mm`,
      isCodeReference: "IS 456:2000 Cl. 26.2.1"
    });

    // Create design summary
    const designSummary = {
      overallStatus: depthCheck && shearCheck && deflectionCheck && riserTreadCheck ? "SAFE" : "UNSAFE",
      numberOfSteps: numberOfSteps,
      inclinationAngle: inclinationAngle.toFixed(2),
      factoredLoad: factoredLoad.toFixed(2),
      bendingMoment: bendingMoment.toFixed(2),
      effectiveDepth: effectiveDepth,
      mainReinforcement: `${numberOfMainBars}-φ${mainBarDiameter}mm @ ${mainBarSpacing}mm c/c`,
      distributionReinforcement: `${numberOfDistributionBars}-φ${distributionBarDiameter}mm @ ${distributionBarSpacing}mm c/c`,
      checks: {
        riserTreadCheck: riserTreadCheck ? "SAFE" : "UNSAFE",
        depthCheck: depthCheck ? "SAFE" : "UNSAFE", 
        shearCheck: shearCheck ? "SAFE" : "UNSAFE",
        deflectionCheck: deflectionCheck ? "SAFE" : "UNSAFE"
      }
    };

    // Create new staircase design document
    const staircaseDesign = new StaircaseDesign({
      projectId: projectId,
      userId: userId,
      
      // Required staircaseId
      staircaseId: `STAIR_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      
      // Input parameters (nested object as per model schema)
      inputParameters: {
        staircaseType: inputData.staircaseType,
        floorHeight: inputData.floorHeight,                    // Use original frontend field names
        riserHeight: inputData.riserHeight,
        treadWidth: inputData.treadWidth,
        stairWidth: inputData.stairWidth,
        landingWidth: inputData.landingWidth,
        liveLoad: inputData.liveLoad,
        floorFinishLoad: inputData.floorFinishLoad,
        concreteGrade: inputData.concreteGrade,
        steelGrade: inputData.steelGrade,
        clearCover: inputData.clearCover
      },
      
      // Calculated results (nested object as per model schema)
      calculatedResults: {
        // Material Properties
        fck: fck,
        fy: fy,
        
        // Stair Dimensions
        numberOfSteps: numberOfSteps,
        totalGoing: totalGoing,
        inclinationAngle: inclinationAngle,
        
        // Loads
        deadLoadPerMeter: deadLoadPerMeter,
        liveLoadPerMeter: liveLoadPerMeter,
        factoredLoad: factoredLoad,
        
        // Structural Analysis
        bendingMoment: bendingMoment,
        shearForce: shearForce,
        effectiveDepth: effectiveDepth,
        
        // Reinforcement
        requiredSteelArea: requiredSteelArea,
        providedSteelArea: providedSteelArea,
        numberOfMainBars: numberOfMainBars,
        mainBarSpacing: mainBarSpacing,
        distributionSteelArea: distributionSteelArea,
        numberOfDistributionBars: numberOfDistributionBars,
        distributionBarSpacing: distributionBarSpacing,
        
        // Design Checks
        riserTreadCheck: riserTreadCheck,
        depthCheck: depthCheck,
        shearCheck: shearCheck,
        deflectionCheck: deflectionCheck,
        
        // Overall Status
        designStatus: riserTreadCheck && depthCheck && shearCheck && deflectionCheck ? 'Pass' : 'Fail'
      },
      
      // Additional data
      calculationSteps: calculationSteps,
      designSummary: designSummary
    });

    // Save to database
    await staircaseDesign.save();

    // Return response
    res.status(201).json({
      success: true,
      message: 'Staircase design created successfully',
      data: {
        designId: staircaseDesign._id,
        staircaseId: staircaseDesign.staircaseId,
        designSummary,
        calculationSteps,
        inputParameters: staircaseDesign.inputParameters,
        calculatedResults: staircaseDesign.calculatedResults
      }
    });

  } catch (error) {
    console.error('Error creating staircase design:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Get staircase design by ID
export const getStaircaseDesign = async (req, res) => {
  try {
    const { designId } = req.params;
    const userId = req.user.id;
    
    const staircaseDesign = await StaircaseDesign.findOne({
      _id: designId,
      userId: userId
    });
    
    if (!staircaseDesign) {
      return res.status(404).json({
        success: false,
        message: 'Staircase design not found'
      });
    }

    res.status(200).json({
      success: true,
      data: staircaseDesign
    });

  } catch (error) {
    console.error('Error fetching staircase design:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Get all staircase designs for a project
export const getProjectStaircaseDesigns = async (req, res) => {
  try {
    const { projectId } = req.params;
    const userId = req.user.id;
    
    const staircaseDesigns = await StaircaseDesign.find({
      projectId: projectId,
      userId: userId
    }).sort({ createdAt: -1 });
    
    res.status(200).json({
      success: true,
      data: staircaseDesigns
    });

  } catch (error) {
    console.error('Error fetching staircase designs:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Update staircase design
export const updateStaircaseDesign = async (req, res) => {
  try {
    const { designId } = req.params;
    const userId = req.user.id;
    
    const staircaseDesign = await StaircaseDesign.findOneAndUpdate(
      { _id: designId, userId: userId },
      { ...req.body, updatedAt: new Date() },
      { new: true }
    );
    
    if (!staircaseDesign) {
      return res.status(404).json({
        success: false,
        message: 'Staircase design not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Staircase design updated successfully',
      data: staircaseDesign
    });

  } catch (error) {
    console.error('Error updating staircase design:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Delete staircase design
export const deleteStaircaseDesign = async (req, res) => {
  try {
    const { designId } = req.params;
    const userId = req.user.id;
    
    const staircaseDesign = await StaircaseDesign.findOneAndDelete({
      _id: designId,
      userId: userId
    });
    
    if (!staircaseDesign) {
      return res.status(404).json({
        success: false,
        message: 'Staircase design not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Staircase design deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting staircase design:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Legacy function for backward compatibility
export const designStaircase = createStaircaseDesign;

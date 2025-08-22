import ShearWallDesign from '../../models/ShearWallDesign.js';

// Create comprehensive shear wall design with detailed calculations
export const createShearWallDesign = async (req, res) => {
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
      wallType,
      wallHeight,
      wallLength,
      wallThickness,
      numberOfStoreys,
      seismicZone,
      importanceFactor,
      responseReductionFactor,
      soilType,
      totalBuildingWeight,
      lateralLoad,
      axialLoad,
      concreteGrade,
      steelGrade,
      clearCover,
      mainBarDiameter,
      horizontalBarDiameter
    } = inputData;

    // Input validation
    if (!wallType || !wallHeight || !wallLength || !wallThickness || 
        !numberOfStoreys || !seismicZone || !importanceFactor || 
        !responseReductionFactor || !soilType || !totalBuildingWeight || 
        !lateralLoad || !concreteGrade || !steelGrade || !clearCover || 
        !mainBarDiameter || !horizontalBarDiameter) {
      return res.status(400).json({ error: 'All required fields must be provided' });
    }

    // Material properties based on IS 456:2000
    const fckValues = { 'M25': 25, 'M30': 30, 'M35': 35 };
    const fyValues = { 'Fe 415': 415, 'Fe 500': 500 };
    
    const fck = fckValues[concreteGrade];
    const fy = fyValues[steelGrade];
    
    if (!fck || !fy) {
      return res.status(400).json({ error: 'Invalid concrete or steel grade' });
    }

    // Seismic parameters based on IS 1893:2016
    const zoneFactors = { 'II': 0.10, 'III': 0.16, 'IV': 0.24, 'V': 0.36 };
    const soilFactors = { 'Type I': 1.0, 'Type II': 1.2, 'Type III': 1.5 };
    
    const Z = zoneFactors[seismicZone];
    const I = parseFloat(importanceFactor);
    const R = parseFloat(responseReductionFactor);
    const Sa = soilFactors[soilType];
    
    if (!Z || !Sa) {
      return res.status(400).json({ error: 'Invalid seismic zone or soil type' });
    }

    // Initialize calculation steps array
    const calculationSteps = [];
    
    // Step 1: Material Properties
    calculationSteps.push({
      step: 1,
      title: "Material Properties - Concrete",
      formula: "fck = Characteristic compressive strength of concrete",
      substitution: `fck = ${fck} N/mm² (${concreteGrade})`,
      result: `${fck} N/mm²`,
      isCodeReference: "IS 456:2000 Table 2"
    });

    calculationSteps.push({
      step: 2,
      title: "Material Properties - Steel",
      formula: "fy = Characteristic yield strength of steel",
      substitution: `fy = ${fy} N/mm² (${steelGrade})`,
      result: `${fy} N/mm²`,
      isCodeReference: "IS 456:2000 Table 3"
    });

    // Step 3: Seismic Parameters
    calculationSteps.push({
      step: 3,
      title: "Seismic Zone Factor",
      formula: "Z = Zone factor",
      substitution: `Z = ${Z} (Zone ${seismicZone})`,
      result: `${Z}`,
      isCodeReference: "IS 1893:2016 Table 3"
    });

    calculationSteps.push({
      step: 4,
      title: "Importance Factor",
      formula: "I = Importance factor",
      substitution: `I = ${I}`,
      result: `${I}`,
      isCodeReference: "IS 1893:2016 Table 8"
    });

    calculationSteps.push({
      step: 5,
      title: "Response Reduction Factor",
      formula: "R = Response reduction factor",
      substitution: `R = ${R}`,
      result: `${R}`,
      isCodeReference: "IS 1893:2016 Table 9"
    });

    calculationSteps.push({
      step: 6,
      title: "Soil Amplification Factor",
      formula: "Sa = Soil amplification factor",
      substitution: `Sa = ${Sa} (${soilType})`,
      result: `${Sa}`,
      isCodeReference: "IS 1893:2016 Table 2"
    });

    // Step 7: Design Horizontal Acceleration
    const Ah = (Z * I * Sa) / (2 * R);
    calculationSteps.push({
      step: 7,
      title: "Design Horizontal Acceleration",
              formula: "Ah = Z * I * Sa / (2 * R)",
              substitution: `Ah = ${Z} * ${I} * ${Sa} / (2 * ${R}) = ${Ah.toFixed(4)}`,
      result: `${Ah.toFixed(4)}`,
      isCodeReference: "IS 1893:2016 Cl. 6.4.2"
    });

    // Step 8: Base Shear
    const baseShear = Ah * totalBuildingWeight;
    calculationSteps.push({
      step: 8,
      title: "Base Shear",
              formula: "Vb = Ah * W",
              substitution: `Vb = ${Ah.toFixed(4)} * ${totalBuildingWeight} = ${baseShear.toFixed(2)} kN`,
      result: `${baseShear.toFixed(2)} kN`,
      isCodeReference: "IS 1893:2016 Cl. 7.5.3"
    });

    // Step 9: Lateral Load Distribution
    const lateralLoadPerFloor = lateralLoad / numberOfStoreys;
    calculationSteps.push({
      step: 9,
      title: "Lateral Load per Floor",
      formula: "V_floor = Total lateral load / Number of storeys",
      substitution: `V_floor = ${lateralLoad} / ${numberOfStoreys} = ${lateralLoadPerFloor.toFixed(2)} kN`,
      result: `${lateralLoadPerFloor.toFixed(2)} kN`,
      isCodeReference: "IS 1893:2016 Cl. 7.7.1"
    });

    // Step 10: Flexural Moment
    const flexuralMoment = (lateralLoad * wallHeight) / 2;
    calculationSteps.push({
      step: 10,
      title: "Flexural Moment",
              formula: "Mu = V * H / 2",
              substitution: `Mu = ${lateralLoad} * ${wallHeight} / 2 = ${flexuralMoment.toFixed(2)} kNm`,
      result: `${flexuralMoment.toFixed(2)} kNm`,
      isCodeReference: "IS 456:2000 Cl. 38.1"
    });

    // Step 11: Effective Depth
    const effectiveDepth = wallThickness - clearCover - mainBarDiameter/2;
    calculationSteps.push({
      step: 11,
      title: "Effective Depth",
      formula: "d = t - cover - φ/2",
      substitution: `d = ${wallThickness} - ${clearCover} - ${mainBarDiameter}/2 = ${effectiveDepth} mm`,
      result: `${effectiveDepth} mm`,
      isCodeReference: "IS 456:2000 Cl. 26.4"
    });

    // Step 12: Required Depth Check
    const requiredDepth = Math.sqrt((flexuralMoment * 1000000) / (0.138 * fck * wallLength));
    const depthCheck = effectiveDepth >= requiredDepth;
    calculationSteps.push({
      step: 12,
      title: "Required Depth Check",
              formula: "d_req = √(Mu / (0.138 * fck * b))",
              substitution: `d_req = √(${flexuralMoment * 1000000} / (0.138 * ${fck} * ${wallLength})) = ${requiredDepth.toFixed(0)} mm`,
      result: depthCheck ? "SAFE" : "UNSAFE",
      isCodeReference: "IS 456:2000 Cl. 23.1.1"
    });

    // Step 13: Moment of Resistance Factor
    const momentResistanceFactor = (flexuralMoment * 1000000) / (fck * wallLength * effectiveDepth * effectiveDepth);
    calculationSteps.push({
      step: 13,
      title: "Moment of Resistance Factor",
              formula: "k = Mu / (fck * b * d²)",
              substitution: `k = ${flexuralMoment * 1000000} / (${fck} * ${wallLength} * ${effectiveDepth}²) = ${momentResistanceFactor.toFixed(6)}`,
      result: `${momentResistanceFactor.toFixed(6)}`,
      isCodeReference: "IS 456:2000 Cl. 23.1.1"
    });

    // Step 14: Lever Arm Factor
    const leverArmFactor = 0.5 + Math.sqrt(0.25 - momentResistanceFactor);
    const leverArm = leverArmFactor * effectiveDepth;
    calculationSteps.push({
      step: 14,
      title: "Lever Arm",
      formula: "j = 0.5 + √(0.25 - k); z = j * d",
      substitution: `j = 0.5 + √(0.25 - ${momentResistanceFactor.toFixed(6)}) = ${leverArmFactor.toFixed(3)}; z = ${leverArmFactor.toFixed(3)} * ${effectiveDepth} = ${leverArm.toFixed(1)} mm`,
      result: `${leverArm.toFixed(1)} mm`,
      isCodeReference: "IS 456:2000 Cl. 23.1.1"
    });

    // Step 15: Required Steel Area
    const requiredSteel = (flexuralMoment * 1000000) / (0.87 * fy * leverArm);
    calculationSteps.push({
      step: 15,
      title: "Required Steel Area",
      formula: "Ast = Mu / (0.87 * fy * z)",
      substitution: `Ast = ${flexuralMoment * 1000000} / (0.87 * ${fy} * ${leverArm.toFixed(1)}) = ${requiredSteel.toFixed(0)} mm²`,
      result: `${requiredSteel.toFixed(0)} mm²`,
      isCodeReference: "IS 456:2000 Cl. 26.5.1"
    });

    // Step 16: Minimum Steel Area
    const minimumSteel = 0.0025 * wallLength * wallThickness;
    calculationSteps.push({
      step: 16,
      title: "Minimum Steel Area",
      formula: "Ast_min = 0.0025 * b * D",
      substitution: `Ast_min = 0.0025 * ${wallLength} * ${wallThickness} = ${minimumSteel.toFixed(0)} mm²`,
      result: `${minimumSteel.toFixed(0)} mm²`,
      isCodeReference: "IS 456:2000 Cl. 26.5.1.1"
    });

    // Step 17: Governing Steel Area
    const governingSteel = Math.max(requiredSteel, minimumSteel);
    calculationSteps.push({
      step: 17,
      title: "Governing Steel Area",
      formula: "Ast = max(Ast_required, Ast_min)",
      substitution: `Ast = max(${requiredSteel.toFixed(0)}, ${minimumSteel.toFixed(0)}) = ${governingSteel.toFixed(0)} mm²`,
      result: `${governingSteel.toFixed(0)} mm²`,
      isCodeReference: "IS 456:2000 Cl. 26.5.1.1"
    });

    // Step 18: Main Bar Area and Spacing
    const mainBarArea = Math.PI * (mainBarDiameter/2) * (mainBarDiameter/2);
    const numberOfMainBars = Math.ceil(governingSteel / mainBarArea);
    const mainBarSpacing = wallLength / (numberOfMainBars - 1);
    
    calculationSteps.push({
      step: 18,
      title: "Main Bar Configuration",
      formula: "N_bars = Ast / (π * φ²/4); Spacing = L / (N-1)",
      substitution: `N_bars = ${governingSteel.toFixed(0)} / (π * ${mainBarDiameter}²/4) = ${numberOfMainBars} bars; Spacing = ${wallLength} / (${numberOfMainBars}-1) = ${mainBarSpacing.toFixed(0)} mm`,
      result: `${numberOfMainBars} bars of ${mainBarDiameter}mm @ ${mainBarSpacing.toFixed(0)} mm c/c`,
      isCodeReference: "IS 456:2000 Cl. 26.3.3"
    });

    // Step 19: Shear Force
    const shearForce = lateralLoad;
    calculationSteps.push({
      step: 19,
      title: "Shear Force",
      formula: "Vu = Lateral load",
      substitution: `Vu = ${lateralLoad} kN`,
      result: `${lateralLoad} kN`,
      isCodeReference: "IS 456:2000 Cl. 40.1"
    });

    // Step 20: Shear Stress
    const shearStress = (shearForce * 1000) / (wallLength * effectiveDepth);
    calculationSteps.push({
      step: 20,
      title: "Shear Stress",
      formula: "τv = Vu / (b * d)",
      substitution: `τv = ${shearForce * 1000} / (${wallLength} * ${effectiveDepth}) = ${shearStress.toFixed(2)} N/mm²`,
      result: `${shearStress.toFixed(2)} N/mm²`,
      isCodeReference: "IS 456:2000 Cl. 40.1"
    });

    // Step 21: Permissible Shear Stress
    const steelPercentage = (governingSteel / (wallLength * effectiveDepth)) * 100;
    let permissibleShearStress;
    
    if (steelPercentage <= 0.25) {
      permissibleShearStress = 0.25;
    } else if (steelPercentage <= 0.5) {
      permissibleShearStress = 0.35;
    } else if (steelPercentage <= 0.75) {
      permissibleShearStress = 0.42;
    } else {
      permissibleShearStress = 0.48;
    }
    
    calculationSteps.push({
      step: 21,
      title: "Permissible Shear Stress",
      formula: "τc = f(steel percentage) from IS 456 Table 19",
      substitution: `Steel% = ${steelPercentage.toFixed(2)}%, τc = ${permissibleShearStress} N/mm²`,
      result: `${permissibleShearStress} N/mm²`,
      isCodeReference: "IS 456:2000 Table 19"
    });

    // Step 22: Shear Check
    const shearCheck = shearStress <= permissibleShearStress;
    calculationSteps.push({
      step: 22,
      title: "Shear Check",
      formula: "τv <= τc",
      substitution: `${shearStress.toFixed(2)} <= ${permissibleShearStress}`,
      result: shearCheck ? "SAFE" : "UNSAFE",
      isCodeReference: "IS 456:2000 Cl. 40.1"
    });

    // Step 23: Horizontal Reinforcement
    const horizontalBarArea = Math.PI * (horizontalBarDiameter/2) * (horizontalBarDiameter/2);
    const minimumHorizontalSteel = 0.0025 * wallThickness * 1000; // per meter height
    const horizontalBarSpacing = (horizontalBarArea * 1000) / minimumHorizontalSteel;
    
    calculationSteps.push({
      step: 23,
      title: "Horizontal Reinforcement",
      formula: "Asv_min = 0.0025 * t * 1000 mm; Spacing = (π * φ²/4) * 1000 / Asv_min",
      substitution: `Asv_min = 0.0025 * ${wallThickness} * 1000 = ${minimumHorizontalSteel.toFixed(0)} mm²/m; Spacing = ${horizontalBarArea.toFixed(0)} * 1000 / ${minimumHorizontalSteel.toFixed(0)} = ${horizontalBarSpacing.toFixed(0)} mm`,
      result: `${horizontalBarDiameter}mm @ ${horizontalBarSpacing.toFixed(0)} mm c/c`,
      isCodeReference: "IS 13920:2016 Cl. 10.3.2"
    });

    // Step 24: Axial Load Check (if provided)
    let axialCheck = "NOT APPLICABLE";
    let axialInteraction = 0;
    
    if (axialLoad && axialLoad > 0) {
      const axialCapacity = 0.4 * fck * wallLength * wallThickness + 0.67 * fy * governingSteel;
      const momentCapacity = (0.87 * fy * governingSteel * leverArm) / 1000000;
      axialInteraction = (axialLoad * 1000) / axialCapacity + (flexuralMoment) / momentCapacity;
      axialCheck = axialInteraction <= 1.0 ? "SAFE" : "UNSAFE";
      
      calculationSteps.push({
        step: 24,
        title: "Axial Load Check",
        formula: "Pu/Puz + Mu/Muz <= 1.0",
        substitution: `Puz = 0.4 * fck * b * D + 0.67 * fy * Ast = ${axialCapacity.toFixed(0)} N; Muz = ${momentCapacity.toFixed(2)} kNm; Interaction = ${axialInteraction.toFixed(3)}`,
        result: axialCheck,
        isCodeReference: "IS 456:2000 Cl. 39.3"
      });
    }

    // Step 25: Boundary Element Check
    const edgeStress = (axialLoad * 1000) / (wallLength * wallThickness) + (flexuralMoment * 1000000) / (wallLength * wallThickness * wallThickness / 6);
    const boundaryElementRequired = edgeStress > (0.2 * fck);
    
    calculationSteps.push({
      step: 25,
      title: "Boundary Element Check",
      formula: "σ_edge = P/A + M/Z; Check if σ_edge > 0.2 * fck",
      substitution: `σ_edge = ${axialLoad || 0} * 1000 / (${wallLength} * ${wallThickness}) + ${flexuralMoment * 1000000} / (${wallLength} * ${wallThickness}² / 6) = ${edgeStress.toFixed(2)} N/mm²; 0.2 * fck = ${0.2 * fck} N/mm²`,
      result: boundaryElementRequired ? "REQUIRED" : "NOT REQUIRED",
      isCodeReference: "IS 13920:2016 Cl. 10.4"
    });

    // Step 26: Aspect Ratio Check
    const aspectRatio = wallHeight / wallLength;
    const aspectRatioCheck = aspectRatio >= 0.5 && aspectRatio <= 4.0;
    
    calculationSteps.push({
      step: 26,
      title: "Aspect Ratio Check",
      formula: "hw/Lw should be between 0.5 and 4.0",
      substitution: `hw/Lw = ${wallHeight} / ${wallLength} = ${aspectRatio.toFixed(2)}`,
      result: aspectRatioCheck ? "ACCEPTABLE" : "NOT ACCEPTABLE",
      isCodeReference: "IS 13920:2016 Cl. 10.2"
    });

    // Step 27: Deflection Check
    const momentOfInertia = (wallLength * wallThickness * wallThickness * wallThickness) / 12;
    const modularRatio = 280 / (3 * fck);
    const deflection = (5 * lateralLoad * 1000 * Math.pow(wallHeight * 1000, 4)) / (384 * modularRatio * 25000 * momentOfInertia);
    const permissibleDeflection = (wallHeight * 1000) / 250;
    const deflectionCheck = deflection <= permissibleDeflection;
    
    calculationSteps.push({
      step: 27,
      title: "Deflection Check",
      formula: "δ = 5wL⁴/(384EI); δ_allow = L/250",
      substitution: `δ = ${deflection.toFixed(2)} mm; δ_allow = ${permissibleDeflection.toFixed(2)} mm`,
      result: deflectionCheck ? "SAFE" : "UNSAFE",
      isCodeReference: "IS 456:2000 Table 23"
    });

    // Step 28: Overall Design Summary
    const overallStatus = depthCheck && shearCheck && aspectRatioCheck && deflectionCheck && 
                         (axialCheck === "SAFE" || axialCheck === "NOT APPLICABLE") ? "SAFE" : "UNSAFE";
    
    calculationSteps.push({
      step: 28,
      title: "Overall Design Status",
      formula: "All checks must be satisfied",
      substitution: `Depth: ${depthCheck ? "SAFE" : "UNSAFE"}, Shear: ${shearCheck ? "SAFE" : "UNSAFE"}, Aspect: ${aspectRatioCheck ? "SAFE" : "UNSAFE"}, Deflection: ${deflectionCheck ? "SAFE" : "UNSAFE"}, Axial: ${axialCheck}`,
      result: overallStatus,
      isCodeReference: "IS 456:2000 & IS 13920:2016"
    });

    // Create design summary
    const designSummary = {
      overallStatus,
      aspectRatio: aspectRatio.toFixed(2),
      baseShear: `${baseShear.toFixed(2)} kN`,
      flexuralMoment: `${flexuralMoment.toFixed(2)} kNm`,
      effectiveDepth: effectiveDepth,
      mainReinforcement: `${numberOfMainBars} bars of ${mainBarDiameter}mm @ ${mainBarSpacing.toFixed(0)} mm c/c`,
      horizontalReinforcement: `${horizontalBarDiameter}mm @ ${horizontalBarSpacing.toFixed(0)} mm c/c`,
      boundaryElement: boundaryElementRequired ? "REQUIRED" : "NOT REQUIRED",
      checks: {
        depthCheck: depthCheck ? "SAFE" : "UNSAFE",
        shearCheck: shearCheck ? "SAFE" : "UNSAFE",
        aspectRatioCheck: aspectRatioCheck ? "SAFE" : "UNSAFE",
        deflectionCheck: deflectionCheck ? "SAFE" : "UNSAFE",
        axialCheck: axialCheck
      }
    };

    // Create the design document
    const shearWallDesign = new ShearWallDesign({
      projectId: projectId,
      userId: userId,
      
      // Input parameters
      wallType,
      wallHeight,
      wallLength,
      wallThickness,
      numberOfStoreys,
      seismicZone,
      importanceFactor,
      responseReductionFactor,
      soilType,
      totalBuildingWeight,
      lateralLoad,
      axialLoad: axialLoad || 0,
      concreteGrade,
      steelGrade,
      clearCover,
      mainBarDiameter,
      horizontalBarDiameter,
      
      // Calculated results
      aspectRatio,
      baseShear,
      flexuralMoment,
      effectiveDepth,
      requiredSteel,
      governingSteel,
      mainBarConfiguration: `${numberOfMainBars} bars of ${mainBarDiameter}mm @ ${mainBarSpacing.toFixed(0)} mm c/c`,
      horizontalBarConfiguration: `${horizontalBarDiameter}mm @ ${horizontalBarSpacing.toFixed(0)} mm c/c`,
      shearStress,
      permissibleShearStress,
      boundaryElementRequired,
      
      // Calculation steps and summary
      calculationSteps,
      designSummary
    });

    // Save to database
    const savedDesign = await shearWallDesign.save();

    res.status(201).json({
      success: true,
      message: 'Shear wall design completed successfully',
      data: savedDesign
    });

  } catch (error) {
    console.error('Error in createShearWallDesign:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating shear wall design',
      error: error.message
    });
  }
};

// Get single shear wall design
export const getShearWallDesign = async (req, res) => {
  try {
    const { designId } = req.params;
    const userId = req.user.id;
    
    const design = await ShearWallDesign.findOne({
      _id: designId,
      userId: userId
    });
    
    if (!design) {
      return res.status(404).json({
        success: false,
        message: 'Shear wall design not found'
      });
    }

    res.json({
      success: true,
      data: design
    });
  } catch (error) {
    console.error('Error in getShearWallDesign:', error);
    res.status(500).json({
      success: false,
      message: 'Error retrieving shear wall design',
      error: error.message
    });
  }
};

// Get all shear wall designs for a project
export const getProjectShearWallDesigns = async (req, res) => {
  try {
    const { projectId } = req.params;
    const userId = req.user.id;
    
    const designs = await ShearWallDesign.find({
      projectId: projectId,
      userId: userId
    }).sort({ createdAt: -1 });
    
    res.json({
      success: true,
      data: designs
    });
  } catch (error) {
    console.error('Error in getProjectShearWallDesigns:', error);
    res.status(500).json({
      success: false,
      message: 'Error retrieving shear wall designs',
      error: error.message
    });
  }
};

// Update shear wall design
export const updateShearWallDesign = async (req, res) => {
  try {
    const { designId } = req.params;
    const userId = req.user.id;
    
    const updatedDesign = await ShearWallDesign.findOneAndUpdate(
      { _id: designId, userId: userId },
      req.body,
      { new: true, runValidators: true }
    );

    if (!updatedDesign) {
      return res.status(404).json({
        success: false,
        message: 'Shear wall design not found'
      });
    }

    res.json({
      success: true,
      message: 'Shear wall design updated successfully',
      data: updatedDesign
    });
  } catch (error) {
    console.error('Error in updateShearWallDesign:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating shear wall design',
      error: error.message
    });
  }
};

// Delete shear wall design
export const deleteShearWallDesign = async (req, res) => {
  try {
    const { designId } = req.params;
    const userId = req.user.id;
    
    const deletedDesign = await ShearWallDesign.findOneAndDelete({
      _id: designId,
      userId: userId
    });

    if (!deletedDesign) {
      return res.status(404).json({
        success: false,
        message: 'Shear wall design not found'
      });
    }

    res.json({
      success: true,
      message: 'Shear wall design deleted successfully',
      data: deletedDesign
    });
  } catch (error) {
    console.error('Error in deleteShearWallDesign:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting shear wall design',
      error: error.message
    });
  }
};

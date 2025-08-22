import FootingDesign from '../../models/FootingDesign.js';

// Create footing design with comprehensive calculations
export const createFootingDesign = async (req, res) => {
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
      columnLoad,
      columnWidth,
      columnDepth,
      soilSBC,
      footingLength,
      footingWidth,
      footingDepth,
      concreteGrade,
      steelGrade,
      clearCover,
      barDiameter,
      unitWeightSoil = 18
    } = inputData;

    // Input validation
    if (!columnLoad || !columnWidth || !columnDepth || !soilSBC || 
        !footingLength || !footingWidth || !footingDepth || 
        !concreteGrade || !steelGrade || !clearCover || !barDiameter) {
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

    // Step 3: Required Footing Area
    const requiredArea = columnLoad / soilSBC;
    calculationSteps.push({
      step: 3,
      title: "Required Footing Area",
      formula: "A_req = P_u / σ_sbc",
      substitution: `A_req = ${columnLoad} / ${soilSBC} = ${requiredArea.toFixed(2)} m²`,
      result: `${requiredArea.toFixed(2)} m²`,
      isCodeReference: "IS 1904:1986 Cl. 4.2.1"
    });

    // Step 4: Provided Footing Area
    const providedArea = footingLength * footingWidth;
    calculationSteps.push({
      step: 4,
      title: "Provided Footing Area",
              formula: "A_provided = L * B",
              substitution: `A_provided = ${footingLength} * ${footingWidth} = ${providedArea.toFixed(2)} m²`,
      result: `${providedArea.toFixed(2)} m²`,
      isCodeReference: "Design Calculation"
    });

    // Check if provided area is adequate
    const areaCheck = providedArea >= requiredArea;
    calculationSteps.push({
      step: 5,
      title: "Area Check",
              formula: "A_provided >= A_req",
              substitution: `${providedArea.toFixed(2)} >= ${requiredArea.toFixed(2)}`,
      result: areaCheck ? "SAFE" : "UNSAFE",
      isCodeReference: "IS 1904:1986 Cl. 4.2.1"
    });

    // Step 6: Net Upward Pressure
    const netPressure = columnLoad / providedArea;
    calculationSteps.push({
      step: 6,
      title: "Net Upward Pressure",
      formula: "q = P_u / A_provided",
      substitution: `q = ${columnLoad} / ${providedArea.toFixed(2)} = ${netPressure.toFixed(2)} kN/m²`,
      result: `${netPressure.toFixed(2)} kN/m²`,
      isCodeReference: "IS 1904:1986 Cl. 4.2.2"
    });

    // Step 7: Projection calculations
    const projectionX = (footingLength - columnWidth/1000) / 2; // Convert mm to m
    const projectionY = (footingWidth - columnDepth/1000) / 2;
    
    calculationSteps.push({
      step: 7,
      title: "Projection in X-direction",
      formula: "a_x = (L - col_width) / 2",
      substitution: `a_x = (${footingLength} - ${columnWidth/1000}) / 2 = ${projectionX.toFixed(3)} m`,
      result: `${projectionX.toFixed(3)} m`,
      isCodeReference: "IS 1904:1986 Cl. 4.3.1"
    });

    calculationSteps.push({
      step: 8,
      title: "Projection in Y-direction",
      formula: "a_y = (B - col_depth) / 2",
      substitution: `a_y = (${footingWidth} - ${columnDepth/1000}) / 2 = ${projectionY.toFixed(3)} m`,
      result: `${projectionY.toFixed(3)} m`,
      isCodeReference: "IS 1904:1986 Cl. 4.3.1"
    });

    // Step 9: Bending Moment in X-direction
    const momentX = netPressure * footingWidth * Math.pow(projectionX, 2) / 2;
    calculationSteps.push({
      step: 9,
      title: "Bending Moment in X-direction",
      formula: "M_ux = q * B * a_x² / 2",
      substitution: `M_ux = ${netPressure.toFixed(2)} * ${footingWidth} * ${projectionX.toFixed(3)}² / 2 = ${momentX.toFixed(2)} kNm`,
      result: `${momentX.toFixed(2)} kNm`,
      isCodeReference: "IS 1904:1986 Cl. 4.3.2"
    });

    // Step 10: Bending Moment in Y-direction
    const momentY = netPressure * footingLength * Math.pow(projectionY, 2) / 2;
    calculationSteps.push({
      step: 10,
      title: "Bending Moment in Y-direction",
      formula: "M_uy = q * L * a_y² / 2",
      substitution: `M_uy = ${netPressure.toFixed(2)} * ${footingLength} * ${projectionY.toFixed(3)}² / 2 = ${momentY.toFixed(2)} kNm`,
      result: `${momentY.toFixed(2)} kNm`,
      isCodeReference: "IS 1904:1986 Cl. 4.3.2"
    });

    // Step 11: Effective Depth
    const effectiveDepth = footingDepth - clearCover - barDiameter/2;
    calculationSteps.push({
      step: 11,
      title: "Effective Depth",
      formula: "d = D - cover - φ/2",
      substitution: `d = ${footingDepth} - ${clearCover} - ${barDiameter}/2 = ${effectiveDepth} mm`,
      result: `${effectiveDepth} mm`,
      isCodeReference: "IS 456:2000 Cl. 26.4.1"
    });

    // Step 12: Check for depth adequacy (X-direction)
    const requiredDepthX = Math.sqrt((momentX * 1000000) / (0.138 * fck * footingWidth * 1000));
    calculationSteps.push({
      step: 12,
      title: "Required Depth Check (X-direction)",
      formula: "d_req = √(M_ux * 10⁶ / (0.138 * fck * B * 1000))",
      substitution: `d_req = √(${momentX.toFixed(2)} * 10⁶ / (0.138 * ${fck} * ${footingWidth} * 1000)) = ${requiredDepthX.toFixed(1)} mm`,
      result: `${requiredDepthX.toFixed(1)} mm`,
      isCodeReference: "IS 456:2000 Cl. 38.1"
    });

    // Step 13: Check for depth adequacy (Y-direction)
    const requiredDepthY = Math.sqrt((momentY * 1000000) / (0.138 * fck * footingLength * 1000));
    calculationSteps.push({
      step: 13,
      title: "Required Depth Check (Y-direction)",
      formula: "d_req = √(M_uy * 10⁶ / (0.138 * fck * L * 1000))",
      substitution: `d_req = √(${momentY.toFixed(2)} * 10⁶ / (0.138 * ${fck} * ${footingLength} * 1000)) = ${requiredDepthY.toFixed(1)} mm`,
      result: `${requiredDepthY.toFixed(1)} mm`,
      isCodeReference: "IS 456:2000 Cl. 38.1"
    });

    const depthCheck = effectiveDepth >= Math.max(requiredDepthX, requiredDepthY);
    calculationSteps.push({
      step: 14,
      title: "Depth Adequacy Check",
              formula: "d_provided >= d_req",
              substitution: `${effectiveDepth} >= ${Math.max(requiredDepthX, requiredDepthY).toFixed(1)}`,
      result: depthCheck ? "SAFE" : "UNSAFE",
      isCodeReference: "IS 456:2000 Cl. 38.1"
    });

    // Step 15: Steel Area in X-direction
    const jValue = 0.9; // j = 0.9 (assumed)
    const astX = (momentX * 1000000) / (0.87 * fy * jValue * effectiveDepth);
    calculationSteps.push({
      step: 15,
      title: "Steel Area in X-direction",
      formula: "Ast_x = M_ux * 10⁶ / (0.87 * fy * j * d)",
      substitution: `Ast_x = ${momentX.toFixed(2)} * 10⁶ / (0.87 * ${fy} * ${jValue} * ${effectiveDepth}) = ${astX.toFixed(0)} mm²`,
      result: `${astX.toFixed(0)} mm²`,
      isCodeReference: "IS 456:2000 Cl. 38.1"
    });

    // Step 16: Steel Area in Y-direction
    const astY = (momentY * 1000000) / (0.87 * fy * jValue * effectiveDepth);
    calculationSteps.push({
      step: 16,
      title: "Steel Area in Y-direction",
      formula: "Ast_y = M_uy * 10⁶ / (0.87 * fy * j * d)",
      substitution: `Ast_y = ${momentY.toFixed(2)} * 10⁶ / (0.87 * ${fy} * ${jValue} * ${effectiveDepth}) = ${providedAstY.toFixed(0)} mm²`,
      result: `${astY.toFixed(0)} mm²`,
      isCodeReference: "IS 456:2000 Cl. 38.1"
    });

    // Step 17: Minimum Steel Area
    const minAst = 0.0012 * footingLength * 1000 * footingDepth; // 0.12% of gross area
    calculationSteps.push({
      step: 17,
      title: "Minimum Steel Area",
      formula: "Ast_min = 0.0012 * L * 1000 * D",
      substitution: `Ast_min = 0.0012 * ${footingLength} * 1000 * ${footingDepth} = ${minAst.toFixed(0)} mm²`,
      result: `${minAst.toFixed(0)} mm²`,
      isCodeReference: "IS 456:2000 Cl. 26.5.2.1"
    });

    // Step 18: Provided Steel Area (X-direction)
    const providedAstX = Math.max(astX, minAst);
    calculationSteps.push({
      step: 18,
      title: "Provided Steel Area (X-direction)",
      formula: "Ast_provided_x = max(Ast_x, Ast_min)",
      substitution: `Ast_provided_x = max(${astX.toFixed(0)}, ${minAst.toFixed(0)}) = ${providedAstX.toFixed(0)} mm²`,
      result: `${providedAstX.toFixed(0)} mm²`,
      isCodeReference: "IS 456:2000 Cl. 26.5.2.1"
    });

    // Step 19: Provided Steel Area (Y-direction)
    const providedAstY = Math.max(astY, minAst);
    calculationSteps.push({
      step: 19,
      title: "Provided Steel Area (Y-direction)",
      formula: "Ast_provided_y = max(Ast_y, Ast_min)",
      substitution: `Ast_provided_y = max(${astY.toFixed(0)}, ${minAst.toFixed(0)}) = ${providedAstY.toFixed(0)} mm²`,
      result: `${providedAstY.toFixed(0)} mm²`,
      isCodeReference: "IS 456:2000 Cl. 26.5.2.1"
    });

    // Step 20: Bar spacing calculations
    const barArea = Math.PI * Math.pow(barDiameter, 2) / 4;
    const barsRequiredX = Math.ceil(providedAstX / barArea);
    const barsRequiredY = Math.ceil(providedAstY / barArea);
    const spacingX = Math.floor((footingWidth * 1000) / barsRequiredX);
    const spacingY = Math.floor((footingLength * 1000) / barsRequiredY);

    calculationSteps.push({
      step: 20,
      title: "Bar Spacing in X-direction",
      formula: "s_x = B * 1000 / n_bars_x",
      substitution: `s_x = ${footingWidth} * 1000 / ${barsRequiredX} = ${spacingX} mm`,
      result: `${spacingX} mm c/c`,
      isCodeReference: "IS 456:2000 Cl. 26.3.3"
    });

    calculationSteps.push({
      step: 21,
      title: "Bar Spacing in Y-direction",
      formula: "s_y = L * 1000 / n_bars_y",
      substitution: `s_y = ${footingLength} * 1000 / ${barsRequiredY} = ${spacingY} mm`,
      result: `${spacingY} mm c/c`,
      isCodeReference: "IS 456:2000 Cl. 26.3.3"
    });

    // Step 22: One-way Shear Check
    const shearForceX = netPressure * footingWidth * (projectionX - effectiveDepth/1000);
    const shearStressX = (shearForceX * 1000) / (footingWidth * 1000 * effectiveDepth);
    const allowableShearStress = 0.25 * Math.sqrt(fck); // τc_max from IS 456:2000 Table 20
    
    calculationSteps.push({
      step: 22,
      title: "One-way Shear Force",
      formula: "V_u = q * B * (a_x - d/1000)",
      substitution: `V_u = ${netPressure.toFixed(2)} * ${footingWidth} * (${projectionX.toFixed(3)} - ${effectiveDepth}/1000) = ${shearForceX.toFixed(2)} kN`,
      result: `${shearForceX.toFixed(2)} kN`,
      isCodeReference: "IS 456:2000 Cl. 40.1"
    });

    calculationSteps.push({
      step: 23,
      title: "One-way Shear Stress",
      formula: "τ_v = V_u * 1000 / (B * 1000 * d)",
      substitution: `τ_v = ${shearForceX.toFixed(2)} * 1000 / (${footingWidth} * 1000 * ${effectiveDepth}) = ${shearStressX.toFixed(3)} N/mm²`,
      result: `${shearStressX.toFixed(3)} N/mm²`,
      isCodeReference: "IS 456:2000 Cl. 40.1"
    });

    const oneWayShearCheck = shearStressX <= allowableShearStress;
    calculationSteps.push({
      step: 24,
      title: "One-way Shear Check",
              formula: "τ_v <= τ_c_max",
              substitution: `${shearStressX.toFixed(3)} <= ${allowableShearStress.toFixed(3)}`,
      result: oneWayShearCheck ? "SAFE" : "UNSAFE",
      isCodeReference: "IS 456:2000 Table 20"
    });

    // Step 25: Punching Shear Check
    const punchingPerimeter = 2 * (columnWidth + columnDepth + 2 * effectiveDepth);
    const punchingShearForce = columnLoad - netPressure * (columnWidth/1000 + effectiveDepth/1000) * (columnDepth/1000 + effectiveDepth/1000);
    const punchingShearStress = (punchingShearForce * 1000) / (punchingPerimeter * effectiveDepth);
    const allowablePunchingShear = 0.25 * Math.sqrt(fck);

    calculationSteps.push({
      step: 25,
      title: "Punching Shear Perimeter",
      formula: "u = 2 * (col_width + col_depth + 2d)",
      substitution: `u = 2 * (${columnWidth} + ${columnDepth} + 2*${effectiveDepth}) = ${punchingPerimeter} mm`,
      result: `${punchingPerimeter} mm`,
      isCodeReference: "IS 456:2000 Cl. 31.6.2"
    });

    calculationSteps.push({
      step: 26,
      title: "Punching Shear Force",
      formula: "V_u = P_u - q * (col_width + d) * (col_depth + d) / 10⁶",
      substitution: `V_u = ${columnLoad} - ${netPressure.toFixed(2)} * (${columnWidth} + ${effectiveDepth}) * (${columnDepth} + ${effectiveDepth}) / 10⁶ = ${punchingShearForce.toFixed(2)} kN`,
      result: `${punchingShearForce.toFixed(2)} kN`,
      isCodeReference: "IS 456:2000 Cl. 31.6.2"
    });

    calculationSteps.push({
      step: 27,
      title: "Punching Shear Stress",
      formula: "τ_p = V_u * 1000 / (u * d)",
      substitution: `τ_p = ${punchingShearForce.toFixed(2)} * 1000 / (${punchingPerimeter} * ${effectiveDepth}) = ${punchingShearStress.toFixed(3)} N/mm²`,
      result: `${punchingShearStress.toFixed(3)} N/mm²`,
      isCodeReference: "IS 456:2000 Cl. 31.6.2"
    });

    const punchingShearCheck = punchingShearStress <= allowablePunchingShear;
    calculationSteps.push({
      step: 28,
      title: "Punching Shear Check",
              formula: "τ_p <= τ_c_max",
              substitution: `${punchingShearStress.toFixed(3)} <= ${allowablePunchingShear.toFixed(3)}`,
      result: punchingShearCheck ? "SAFE" : "UNSAFE",
      isCodeReference: "IS 456:2000 Table 20"
    });

    // Create design summary
    const designSummary = {
      overallStatus: areaCheck && depthCheck && oneWayShearCheck && punchingShearCheck ? "SAFE" : "UNSAFE",
      requiredArea: requiredArea.toFixed(2),
      providedArea: providedArea.toFixed(2),
      netPressure: netPressure.toFixed(2),
      effectiveDepth: effectiveDepth,
      steelAreaX: providedAstX.toFixed(0),
      steelAreaY: providedAstY.toFixed(0),
      reinforcementX: `${barsRequiredX}-φ${barDiameter}mm @ ${spacingX}mm c/c`,
      reinforcementY: `${barsRequiredY}-φ${barDiameter}mm @ ${spacingY}mm c/c`,
      checks: {
        areaCheck: areaCheck ? "SAFE" : "UNSAFE",
        depthCheck: depthCheck ? "SAFE" : "UNSAFE",
        oneWayShear: oneWayShearCheck ? "SAFE" : "UNSAFE",
        punchingShear: punchingShearCheck ? "SAFE" : "UNSAFE"
      }
    };

    // Create new footing design document
    const footingDesign = new FootingDesign({
      projectId: projectId,
      userId: userId,
      
      // Input parameters
      columnLoad,
      columnWidth,
      columnDepth,
      soilSBC,
      footingLength,
      footingWidth,
      footingDepth,
      concreteGrade,
      steelGrade,
      clearCover,
      barDiameter,
      unitWeightSoil,
      
      // Calculated results
      requiredArea,
      providedArea,
      netPressure,
      projectionX,
      projectionY,
      momentX,
      momentY,
      effectiveDepth,
      astX,
      astY,
      providedAstX,
      providedAstY,
      barsRequiredX,
      barsRequiredY,
      spacingX,
      spacingY,
      
      // Design checks
      areaCheck,
      depthCheck,
      oneWayShearCheck,
      punchingShearCheck,
      
      // Additional data
      calculationSteps,
      designSummary,
      
      createdAt: new Date(),
      updatedAt: new Date()
    });

    // Save to database
    await footingDesign.save();

    // Return response
    res.status(201).json({
      success: true,
      message: 'Footing design created successfully',
      data: {
        designId: footingDesign._id,
        designSummary,
        calculationSteps,
        inputParameters: {
          columnLoad,
          columnWidth,
          columnDepth,
          soilSBC,
          footingLength,
          footingWidth,
          footingDepth,
          concreteGrade,
          steelGrade,
          clearCover,
          barDiameter,
          unitWeightSoil
        }
      }
    });

  } catch (error) {
    console.error('Error creating footing design:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Get footing design by ID
export const getFootingDesign = async (req, res) => {
  try {
    const { designId } = req.params;
    const userId = req.user.id;
    
    const footingDesign = await FootingDesign.findOne({
      _id: designId,
      userId: userId
    });
    
    if (!footingDesign) {
      return res.status(404).json({
        success: false,
        message: 'Footing design not found'
      });
    }

    res.status(200).json({
      success: true,
      data: footingDesign
    });

  } catch (error) {
    console.error('Error fetching footing design:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Get all footing designs for a project
export const getProjectFootingDesigns = async (req, res) => {
  try {
    const { projectId } = req.params;
    const userId = req.user.id;
    
    const footingDesigns = await FootingDesign.find({ 
      projectId: projectId,
      userId: userId
    }).sort({ createdAt: -1 });
    
    res.status(200).json({
      success: true,
      data: footingDesigns
    });

  } catch (error) {
    console.error('Error fetching footing designs:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Update footing design
export const updateFootingDesign = async (req, res) => {
  try {
    const { designId } = req.params;
    const userId = req.user.id;
    const updateData = req.body;
    
    const footingDesign = await FootingDesign.findOneAndUpdate(
      { _id: designId, userId: userId },
      { ...updateData, updatedAt: new Date() },
      { new: true }
    );
    
    if (!footingDesign) {
      return res.status(404).json({
        success: false,
        message: 'Footing design not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Footing design updated successfully',
      data: footingDesign
    });

  } catch (error) {
    console.error('Error updating footing design:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Delete footing design
export const deleteFootingDesign = async (req, res) => {
  try {
    const { designId } = req.params;
    const userId = req.user.id;
    
    const footingDesign = await FootingDesign.findOneAndDelete({
      _id: designId,
      userId: userId
    });
    
    if (!footingDesign) {
      return res.status(404).json({
        success: false,
        message: 'Footing design not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Footing design deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting footing design:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

import ColumnDesign from '../../models/ColumnDesign.js';

// Material Properties as per IS 456:2000
const MATERIAL_PROPERTIES = {
  concrete: {
    M20: { fck: 20, density: 25, Es: 22360 },
    M25: { fck: 25, density: 25, Es: 25000 },
    M30: { fck: 30, density: 25, Es: 27386 },
    M35: { fck: 35, density: 25, Es: 30000 },
    M40: { fck: 40, density: 25, Es: 32000 }
  },
  steel: {
    "Fe 415": { fy: 415, Es: 200000 },
    "Fe 500": { fy: 500, Es: 200000 }
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
  40: { area: 1256.6, diameter: 40 }
};

/**
 * Enhanced Column Design as per IS 456:2000 with detailed calculation steps
 */
export const createColumnDesign = async (req, res) => {
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
      columnType,
      columnWidth,
      columnDepth,
      effectiveLength,
      axialLoad,
      moment = 0,
      concreteGrade,
      steelGrade,
      clearCover,
      numberOfBars,
      barDiameter
    } = inputData;

    // Initialize calculation steps array
    const calculationSteps = [];
    
    // Get material properties
    const fck = MATERIAL_PROPERTIES.concrete[concreteGrade].fck;
    const fy = MATERIAL_PROPERTIES.steel[steelGrade].fy;
    const Es = MATERIAL_PROPERTIES.steel[steelGrade].Es;

    calculationSteps.push({
      step: "Material Properties",
      description: "Material properties as per IS 456:2000",
      formula: `fck = ${fck} N/mm², fy = ${fy} N/mm²`,
      substitution: `${concreteGrade} concrete, ${steelGrade} steel`,
      result: `Characteristic strength values obtained`,
      reference: "IS 456:2000, Table 2 & Clause 6.2.1"
    });

    // Calculate cross-sectional area
    const grossArea = columnWidth * columnDepth;
    calculationSteps.push({
      step: "Gross Cross-Sectional Area",
      description: "Total area of concrete section",
              formula: "Ag = b * D",
              substitution: `= ${columnWidth} * ${columnDepth}`,
      result: `${grossArea.toFixed(0)} mm²`,
      reference: "IS 456:2000, Clause 39.1"
    });

    // Calculate slenderness ratio
    const leastDimension = Math.min(columnWidth, columnDepth);
    const slendernessRatio = (effectiveLength * 1000) / leastDimension;
    
    calculationSteps.push({
      step: "Slenderness Ratio",
      description: "Check for short/long column classification",
      formula: "λ = Le / least dimension",
      substitution: `= ${effectiveLength * 1000} / ${leastDimension}`,
      result: `${slendernessRatio.toFixed(2)}`,
      reference: "IS 456:2000, Clause 25.1.2"
    });

    const columnClassification = slendernessRatio <= 12 ? "Short Column" : "Long Column";
    calculationSteps.push({
      step: "Column Classification",
      description: "Column type based on slenderness ratio",
              formula: "λ <= 12 → Short Column, λ > 12 → Long Column",
      substitution: `${slendernessRatio.toFixed(2)} ${slendernessRatio <= 12 ? '<=' : '>'} 12`,
      result: columnClassification,
      reference: "IS 456:2000, Clause 25.1.2"
    });

    // Calculate minimum steel area
    const minimumSteelArea = 0.008 * grossArea;
    calculationSteps.push({
      step: "Minimum Steel Area",
      description: "Minimum reinforcement requirement",
              formula: "Ast,min = 0.8% * Ag",
              substitution: `= 0.008 * ${grossArea}`,
      result: `${minimumSteelArea.toFixed(0)} mm²`,
      reference: "IS 456:2000, Clause 26.5.3.1"
    });

    // Calculate maximum steel area
    const maximumSteelArea = 0.06 * grossArea;
    calculationSteps.push({
      step: "Maximum Steel Area",
      description: "Maximum reinforcement limit",
              formula: "Ast,max = 6% * Ag",
              substitution: `= 0.06 * ${grossArea}`,
      result: `${maximumSteelArea.toFixed(0)} mm²`,
      reference: "IS 456:2000, Clause 26.5.3.1"
    });

    // Calculate provided steel area
    let providedSteelArea = 0;
    let barArrangement = null;
    
    if (numberOfBars && barDiameter) {
      providedSteelArea = numberOfBars * BAR_PROPERTIES[barDiameter].area;
      barArrangement = {
        numberOfBars,
        barDiameter,
        totalArea: providedSteelArea
      };
      
      calculationSteps.push({
        step: "Provided Steel Area",
        description: "Actual steel area from bar arrangement",
        formula: "Ast = n * (π/4 * φ²)",
        substitution: `= ${numberOfBars} * ${BAR_PROPERTIES[barDiameter].area.toFixed(1)}`,
        result: `${providedSteelArea.toFixed(0)} mm²`,
        reference: "IS 456:2000, Clause 26.5.3"
      });
    } else {
      // Use minimum steel if no bars specified
      providedSteelArea = minimumSteelArea;
      // Auto-select bar arrangement
      barArrangement = selectOptimalBarArrangement(minimumSteelArea, columnWidth, columnDepth, clearCover);
      
      calculationSteps.push({
        step: "Provided Steel Area",
        description: "Using minimum steel requirement",
        formula: "Ast = Ast,min",
        substitution: `= ${minimumSteelArea.toFixed(0)} mm²`,
        result: `${providedSteelArea.toFixed(0)} mm² (minimum requirement)`,
        reference: "IS 456:2000, Clause 26.5.3.1"
      });
    }

    // Calculate effective area of concrete
    const effectiveConcreteArea = grossArea - providedSteelArea;
    calculationSteps.push({
      step: "Effective Concrete Area",
      description: "Net concrete area after deducting steel",
      formula: "Ac = Ag - Ast",
      substitution: `= ${grossArea} - ${providedSteelArea.toFixed(0)}`,
      result: `${effectiveConcreteArea.toFixed(0)} mm²`,
      reference: "IS 456:2000, Clause 39.3"
    });

    // Calculate steel percentage
    const steelPercentage = (providedSteelArea / grossArea) * 100;
    calculationSteps.push({
      step: "Steel Percentage",
      description: "Percentage of steel reinforcement",
              formula: "p = (Ast / Ag) * 100",
              substitution: `= (${providedSteelArea.toFixed(0)} / ${grossArea}) * 100`,
      result: `${steelPercentage.toFixed(2)}%`,
      reference: "IS 456:2000, Clause 26.5.3.1"
    });

    // Calculate axial load capacity
    const axialCapacity = 0.4 * fck * effectiveConcreteArea + 0.67 * fy * providedSteelArea;
    calculationSteps.push({
      step: "Axial Load Capacity",
      description: "Ultimate axial load carrying capacity",
              formula: "Pu = 0.4 * fck * Ac + 0.67 * fy * Ast",
              substitution: `= 0.4 * ${fck} * ${effectiveConcreteArea.toFixed(0)} + 0.67 * ${fy} * ${providedSteelArea.toFixed(0)}`,
      result: `${(axialCapacity / 1000).toFixed(1)} kN`,
      reference: "IS 456:2000, Clause 39.3"
    });

    // Convert input axial load to N for comparison
    const axialLoadN = axialLoad * 1000;
    
    // Safety check
    const safetyFactor = axialCapacity / axialLoadN;
    const capacityCheck = safetyFactor >= 1.0 ? "Safe" : "Unsafe";
    
    calculationSteps.push({
      step: "Capacity Check",
      description: "Check if provided section is adequate",
      formula: "Safety Factor = Pu,capacity / Pu,applied",
      substitution: `= ${(axialCapacity / 1000).toFixed(1)} / ${axialLoad}`,
      result: `${safetyFactor.toFixed(2)} - ${capacityCheck}`,
      reference: "IS 456:2000, Clause 39.3"
    });

    // Long column check and buckling effects
    let bucklingEffects = null;
    if (slendernessRatio > 12) {
      const additionalMoment = calculateAdditionalMoment(axialLoadN, effectiveLength, columnWidth, columnDepth, fck, Es);
      bucklingEffects = {
        additionalMoment: additionalMoment / 1000000, // Convert to kN-m
        totalMoment: moment + (additionalMoment / 1000000)
      };
      
      calculationSteps.push({
        step: "Additional Moment (Long Column)",
        description: "Additional moment due to slenderness effects",
        formula: "Ma = Pu * ea, where ea = Le²/(2000 * r)",
        substitution: `Column is slender (λ = ${slendernessRatio.toFixed(2)} > 12)`,
        result: `Additional moment = ${bucklingEffects.additionalMoment.toFixed(2)} kN-m`,
        reference: "IS 456:2000, Clause 39.7"
      });
    }

    // Interaction check for combined loading
    let interactionCheck = null;
    const totalMoment = bucklingEffects ? bucklingEffects.totalMoment : moment;
    
    if (totalMoment > 0) {
      // Simplified moment capacity for rectangular section
      const momentCapacity = calculateMomentCapacity(columnWidth, columnDepth, fck, fy, providedSteelArea, clearCover);
      
      const axialRatio = axialLoadN / axialCapacity;
      const momentRatio = (totalMoment * 1000000) / momentCapacity;
      const interactionRatio = axialRatio + momentRatio;
      
      interactionCheck = {
        axialRatio: axialRatio,
        momentRatio: momentRatio,
        interactionRatio: interactionRatio,
        status: interactionRatio <= 1.0 ? "Pass" : "Fail"
      };
      
      calculationSteps.push({
        step: "Interaction Check",
        description: "Combined axial load and moment check",
        formula: "Pu/Puz + Mu/Muz <= 1.0",
        substitution: `${axialRatio.toFixed(3)} + ${momentRatio.toFixed(3)} = ${interactionRatio.toFixed(3)}`,
        result: `${interactionCheck.status} (${interactionRatio <= 1.0 ? '<=' : '>'} 1.0)`,
        reference: "IS 456:2000, Clause 39.6"
      });
    }

    // Calculate tie/stirrup requirements
    const tieRequirements = calculateTieRequirements(barArrangement.barDiameter, leastDimension, fy);
    calculationSteps.push({
      step: "Tie Requirements",
      description: "Lateral reinforcement spacing and diameter",
      formula: "Spacing = min(16φ, least dimension, 300mm)",
              substitution: `= min(16*${barArrangement.barDiameter}, ${leastDimension}, 300)`,
      result: `φ${tieRequirements.diameter}mm @ ${tieRequirements.spacing}mm c/c`,
      reference: "IS 456:2000, Clause 26.5.3.2 & IS 13920:2016, Clause 7.3.3"
    });

    // Perform design checks
    const designChecks = performColumnDesignChecks({
      slendernessRatio,
      steelPercentage,
      minimumSteelArea,
      maximumSteelArea,
      providedSteelArea,
      axialCapacity,
      axialLoad: axialLoadN,
      interactionCheck,
      leastDimension,
      effectiveLength
    });

    // Determine overall design status
    const designStatus = Object.values(designChecks).every(check => check.status === "Pass") ? "Pass" : 
                        Object.values(designChecks).some(check => check.status === "Fail") ? "Fail" : "Warning";

    // Generate design notes
    const designNotes = generateColumnDesignNotes({
      columnClassification,
      capacityCheck,
      steelPercentage,
      designStatus,
      designChecks,
      bucklingEffects,
      interactionCheck
    });

    // Prepare response data
    const responseData = {
      inputParameters: {
        columnType,
        columnWidth,
        columnDepth,
        effectiveLength,
        axialLoad,
        moment,
        concreteGrade,
        steelGrade,
        clearCover,
        numberOfBars,
        barDiameter
      },
      calculatedResults: {
        // Material Properties
        fck,
        fy,
        Es,
        
        // Geometric Properties
        grossArea: parseFloat(grossArea.toFixed(0)),
        effectiveConcreteArea: parseFloat(effectiveConcreteArea.toFixed(0)),
        leastDimension: parseFloat(leastDimension.toFixed(0)),
        slendernessRatio: parseFloat(slendernessRatio.toFixed(2)),
        
        // Steel Design
        minimumSteelArea: parseFloat(minimumSteelArea.toFixed(0)),
        maximumSteelArea: parseFloat(maximumSteelArea.toFixed(0)),
        providedSteelArea: parseFloat(providedSteelArea.toFixed(0)),
        steelPercentage: parseFloat(steelPercentage.toFixed(2)),
        
        // Bar Arrangement
        barArrangement,
        
        // Capacity
        axialCapacity: parseFloat((axialCapacity / 1000).toFixed(1)),
        safetyFactor: parseFloat(safetyFactor.toFixed(2)),
        capacityCheck,
        
        // Classification
        columnClassification,
        
        // Long Column Effects
        bucklingEffects,
        
        // Interaction Check
        interactionCheck,
        
        // Tie Requirements
        tieRequirements,
        
        // Design Checks
        designChecks,
        
        // Overall Status
        designStatus,
        
        // Design Notes
        designNotes
      },
      
      // Detailed calculation steps with formulas
      calculationSteps
    };

    // Save to database
    try {
      const columnDesign = new ColumnDesign({
        projectId: projectId,
        userId: userId,
        columnId: `Column-${Date.now()}`,
        inputParameters: responseData.inputParameters,
        calculatedResults: responseData.calculatedResults
      });

      await columnDesign.save();
      responseData.designId = columnDesign._id;
    } catch (dbError) {
      console.log("Database save error:", dbError.message);
      // Continue without saving to database
    }

    res.status(200).json({
      success: true,
      message: "Column design calculation completed successfully",
      data: responseData
    });

  } catch (error) {
    console.error("Column design calculation error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error during column design calculation",
      error: error.message
    });
  }
};

// Helper function to select optimal bar arrangement
function selectOptimalBarArrangement(requiredArea, width, depth, clearCover) {
  const barSizes = [12, 16, 20, 25];
  
  for (const barSize of barSizes) {
    const barArea = BAR_PROPERTIES[barSize].area;
    const numberOfBars = Math.ceil(requiredArea / barArea);
    
    // Check if bars can fit
    if (canAccommodateBars(numberOfBars, barSize, width, depth, clearCover)) {
      return {
        numberOfBars,
        barDiameter: barSize,
        totalArea: numberOfBars * barArea
      };
    }
  }
  
  // Default arrangement if no optimal found
  return {
    numberOfBars: 4,
    barDiameter: 20,
    totalArea: 4 * BAR_PROPERTIES[20].area
  };
}

// Helper function to check bar accommodation
function canAccommodateBars(numberOfBars, barSize, width, depth, clearCover) {
  const effectiveWidth = width - 2 * clearCover - barSize;
  const effectiveDepth = depth - 2 * clearCover - barSize;
  const minSpacing = Math.max(40, barSize); // Minimum spacing
  
  // For rectangular arrangement
  const barsPerSide = Math.floor(effectiveWidth / (barSize + minSpacing)) + 1;
  const maxBars = 2 * (barsPerSide - 1) + 2 * Math.floor(effectiveDepth / (barSize + minSpacing));
  
  return numberOfBars <= maxBars;
}

// Helper function to calculate additional moment for long columns
function calculateAdditionalMoment(axialLoad, effectiveLength, width, depth, fck, Es) {
  const I = (width * Math.pow(depth, 3)) / 12; // Moment of inertia
  const radiusOfGyration = Math.sqrt(I / (width * depth));
  const eccentricity = Math.pow(effectiveLength * 1000, 2) / (2000 * radiusOfGyration);
  return axialLoad * eccentricity;
}

// Helper function to calculate moment capacity (simplified)
function calculateMomentCapacity(width, depth, fck, fy, steelArea, clearCover) {
  const effectiveDepth = depth - clearCover - 10; // Assuming 20mm bar
  const leverArm = 0.9 * effectiveDepth; // Simplified
  return 0.87 * fy * steelArea * leverArm;
}

// Helper function to calculate tie requirements
function calculateTieRequirements(mainBarDia, leastDimension, fy) {
  const spacing1 = 16 * mainBarDia; // 16 times main bar diameter
  const spacing2 = leastDimension; // Least dimension of column
  const spacing3 = 300; // Maximum 300mm
  
  const spacing = Math.min(spacing1, spacing2, spacing3);
  
  let tieDiameter;
  if (mainBarDia <= 12) tieDiameter = 6;
  else if (mainBarDia <= 16) tieDiameter = 8;
  else if (mainBarDia <= 20) tieDiameter = 8;
  else if (mainBarDia <= 32) tieDiameter = 10;
  else tieDiameter = 12;
  
  return {
    diameter: tieDiameter,
    spacing: spacing,
    legs: 2
  };
}

// Helper function to perform design checks
function performColumnDesignChecks(params) {
  const checks = {};
  
  // Slenderness check
  checks.slendernessCheck = {
    status: params.slendernessRatio <= 60 ? "Pass" : "Fail",
    value: params.slendernessRatio,
    requirement: 60,
    description: "Maximum slenderness ratio"
  };
  
  // Minimum steel check
  checks.minimumSteelCheck = {
    status: params.providedSteelArea >= params.minimumSteelArea ? "Pass" : "Fail",
    value: params.providedSteelArea,
    requirement: params.minimumSteelArea,
    description: "Minimum steel requirement"
  };
  
  // Maximum steel check
  checks.maximumSteelCheck = {
    status: params.providedSteelArea <= params.maximumSteelArea ? "Pass" : "Warning",
    value: params.providedSteelArea,
    requirement: params.maximumSteelArea,
    description: "Maximum steel limit"
  };
  
  // Steel percentage check
  checks.steelPercentageCheck = {
    status: params.steelPercentage >= 0.8 && params.steelPercentage <= 6.0 ? "Pass" : "Warning",
    value: params.steelPercentage,
    requirement: "0.8% - 6.0%",
    description: "Steel percentage range"
  };
  
  // Capacity check
  checks.capacityCheck = {
    status: params.axialCapacity >= params.axialLoad ? "Pass" : "Fail",
    value: params.axialCapacity / 1000,
    requirement: params.axialLoad / 1000,
    description: "Axial load capacity"
  };
  
  // Interaction check (if applicable)
  if (params.interactionCheck) {
    checks.interactionCheck = {
      status: params.interactionCheck.status,
      value: params.interactionCheck.interactionRatio,
      requirement: 1.0,
      description: "Combined loading interaction"
    };
  }
  
  // Minimum dimension check
  checks.minimumDimensionCheck = {
    status: params.leastDimension >= 200 ? "Pass" : "Warning",
    value: params.leastDimension,
    requirement: 200,
    description: "Minimum column dimension"
  };
  
  return checks;
}

// Helper function to generate design notes
function generateColumnDesignNotes(params) {
  const notes = [];
  
  notes.push(`Design completed for ${params.columnClassification.toLowerCase()} as per IS 456:2000`);
  notes.push(`Axial load capacity check: ${params.capacityCheck}`);
  notes.push(`Steel reinforcement: ${params.steelPercentage.toFixed(2)}% of gross area`);
  
  if (params.bucklingEffects) {
    notes.push("Additional moment considered for long column effects");
  }
  
  if (params.interactionCheck) {
    notes.push(`Combined loading interaction: ${params.interactionCheck.status}`);
  }
  
  // Add warnings based on checks
  Object.entries(params.designChecks).forEach(([checkName, check]) => {
    if (check.status === "Fail") {
      notes.push(`Warning: ${check.description} failed`);
    } else if (check.status === "Warning") {
      notes.push(`Note: ${check.description} requires attention`);
    }
  });
  
  notes.push("Design based on Limit State Method as per IS 456:2000");
  notes.push("Lateral reinforcement as per IS 13920:2016 for ductile detailing");
  
  return notes;
}

// Get single column design
export const getColumnDesign = async (req, res) => {
  try {
    const { designId } = req.params;
    const userId = req.user.id;

    const columnDesign = await ColumnDesign.findOne({
      _id: designId,
      userId: userId
    }).populate("projectId", "name");

    if (!columnDesign) {
      return res.status(404).json({
        success: false,
        message: "Column design not found"
      });
    }

    res.status(200).json({
      success: true,
      data: columnDesign
    });
  } catch (error) {
    console.error("Error fetching column design:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching column design",
      error: error.message
    });
  }
};

// Get all column designs for a project
export const getProjectColumnDesigns = async (req, res) => {
  try {
    const { projectId } = req.params;
    const userId = req.user.id;

    const columnDesigns = await ColumnDesign.find({
      projectId: projectId,
      userId: userId
    })
      .populate("projectId", "name")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: columnDesigns.length,
      data: columnDesigns
    });
  } catch (error) {
    console.error("Error fetching project column designs:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching project column designs",
      error: error.message
    });
  }
};

// Update column design
export const updateColumnDesign = async (req, res) => {
  try {
    const { designId } = req.params;
    const userId = req.user.id;
    const updateData = req.body;

    const columnDesign = await ColumnDesign.findByIdAndUpdate(
      designId,
      updateData,
      { new: true, runValidators: true }
    );

    if (!columnDesign) {
      return res.status(404).json({
        success: false,
        message: "Column design not found"
      });
    }

    if (columnDesign.userId.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: "Access denied"
      });
    }

    return res.status(200).json({
      success: true,
      message: "Column design updated successfully",
      data: columnDesign
    });

  } catch (error) {
    console.error('Error in updateColumnDesign:', error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message
    });
  }
};

// Delete column design
export const deleteColumnDesign = async (req, res) => {
  try {
    const { designId } = req.params;
    const userId = req.user.id;

    const columnDesign = await ColumnDesign.findByIdAndDelete(designId);

    if (!columnDesign) {
      return res.status(404).json({
        success: false,
        message: "Column design not found"
      });
    }

    if (columnDesign.userId.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: "Access denied"
      });
    }

    return res.status(200).json({
      success: true,
      message: "Column design deleted successfully"
    });

  } catch (error) {
    console.error('Error in deleteColumnDesign:', error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message
    });
  }
};

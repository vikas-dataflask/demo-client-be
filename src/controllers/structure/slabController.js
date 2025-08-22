import SlabDesign from "../../models/SlabDesign.js";

// Material Properties as per IS 456:2000
const MATERIAL_PROPERTIES = {
  concrete: {
    M20: { fck: 20, density: 25 },
    M25: { fck: 25, density: 25 },
    M30: { fck: 30, density: 25 },
  },
  steel: {
    "Fe 415": { fy: 415, Es: 200000 },
    "Fe 500": { fy: 500, Es: 200000 },
  },
};

// IS 456 Table 26 - Moment coefficients for two-way slabs
const MOMENT_COEFFICIENTS = {
  "Simply Supported": {
    shortSpan: { positive: 0.045, negative: 0 },
    longSpan: { positive: 0.036, negative: 0 },
  },
  "Continuous": {
    shortSpan: { positive: 0.035, negative: 0.047 },
    longSpan: { positive: 0.028, negative: 0.037 },
  },
  "Fixed": {
    shortSpan: { positive: 0.024, negative: 0.048 },
    longSpan: { positive: 0.019, negative: 0.038 },
  },
};

// Standard bar diameters and areas (mm²)
const BAR_PROPERTIES = {
  8: { area: 50.3, diameter: 8 },
  10: { area: 78.5, diameter: 10 },
  12: { area: 113.1, diameter: 12 },
  16: { area: 201.1, diameter: 16 },
  20: { area: 314.2, diameter: 20 },
};

/**
 * Calculate slab design as per IS 456:2000
 */
export const calculateSlabDesign = async (req, res) => {
  try {
    const userId = req.user.id;  // Extract user ID from JWT token
    const inputData = req.body;
    const projectId = inputData.projectId;  // Get project ID from request body

    // Validate input data
    if (!inputData || !projectId) {
      return res.status(400).json({
        success: false,
        message: "Invalid input data or project ID",
      });
    }

    // Extract input parameters
    const {
      slabType,
      spanLengthShort,
      spanLengthLong,
      slabThickness,
      supportCondition,
      liveLoad,
      floorFinishLoad,
      concreteGrade,
      steelGrade,
      coverToReinforcement,
    } = inputData;

    // Get material properties
    const fck = MATERIAL_PROPERTIES.concrete[concreteGrade].fck;
    const fy = MATERIAL_PROPERTIES.steel[steelGrade].fy;
    const concreteDensity = MATERIAL_PROPERTIES.concrete[concreteGrade].density;

    // Calculate loads
    const selfWeight = (slabThickness / 1000) * concreteDensity; // kN/m²
    const deadLoad = selfWeight + floorFinishLoad;
    const totalLoad = deadLoad + liveLoad;
    const factoredLoad = 1.5 * totalLoad; // As per IS 456:2000

    // Calculate moments
    let ultimateBendingMoment;
    let momentCoefficient;

    if (slabType === "One-way") {
      // One-way slab moment calculation
      const span = Math.max(spanLengthShort, spanLengthLong);
      
      switch (supportCondition) {
        case "Simply Supported":
          momentCoefficient = 1/8;
          break;
        case "Continuous":
          momentCoefficient = 1/10;
          break;
        case "Fixed":
          momentCoefficient = 1/12;
          break;
        default:
          momentCoefficient = 1/8;
      }
      
      ultimateBendingMoment = factoredLoad * Math.pow(span, 2) * momentCoefficient;
    } else {
      // Two-way slab moment calculation using IS 456 Table 26
      const spanRatio = spanLengthLong / spanLengthShort;
      const coefficients = MOMENT_COEFFICIENTS[supportCondition];
      
      if (spanRatio <= 2.0) {
        // Use short span positive moment coefficient
        momentCoefficient = coefficients.shortSpan.positive;
      } else {
        // For span ratio > 2, design as one-way slab
        momentCoefficient = 1/8;
      }
      
      ultimateBendingMoment = factoredLoad * Math.pow(spanLengthShort, 2) * momentCoefficient;
    }

    // Calculate effective depth
    const b = 1000; // Width of slab strip = 1000mm
    const requiredEffectiveDepth = Math.sqrt(ultimateBendingMoment * 1000000 / (0.138 * fck * b));
    const providedEffectiveDepth = slabThickness - coverToReinforcement;
    const totalDepth = slabThickness;

    // Calculate steel area
    const Mu = ultimateBendingMoment * 1000000; // Convert to N-mm
    const j = 0.9; // Lever arm factor
    const requiredSteelArea = Mu / (0.87 * fy * j * providedEffectiveDepth);
    
    // Minimum steel area as per IS 456:2000
    const minimumSteelArea = 0.0012 * b * slabThickness; // 0.12% of gross area

    // Provided steel area (use maximum of required and minimum)
    const providedSteelArea = Math.max(requiredSteelArea, minimumSteelArea);

    // Determine bar size and spacing
    const { recommendedBarSize, barSpacing, numberOfBars } = calculateReinforcement(
      providedSteelArea,
      b,
      slabThickness
    );

    // Perform design checks
    const checks = performDesignChecks({
      slabThickness,
      spanLengthShort,
      spanLengthLong,
      providedSteelArea,
      minimumSteelArea,
      barSpacing,
      factoredLoad,
      fck,
      fy,
      providedEffectiveDepth,
    });

    // Determine overall design status
    const designStatus = Object.values(checks).every(check => check.status === "Pass") ? "Pass" : "Fail";

    // Create design notes
    const designNotes = generateDesignNotes({
      slabType,
      spanRatio: spanLengthLong / spanLengthShort,
      checks,
      momentCoefficient,
    });

    // Prepare calculation results
    const calculatedResults = {
      fck,
      fy,
      selfWeight: Number(selfWeight.toFixed(2)),
      deadLoad: Number(deadLoad.toFixed(2)),
      totalLoad: Number(totalLoad.toFixed(2)),
      factoredLoad: Number(factoredLoad.toFixed(2)),
      ultimateBendingMoment: Number(ultimateBendingMoment.toFixed(2)),
      momentCoefficient: Number(momentCoefficient.toFixed(4)),
      requiredEffectiveDepth: Number(requiredEffectiveDepth.toFixed(2)),
      providedEffectiveDepth: Number(providedEffectiveDepth.toFixed(2)),
      totalDepth: Number(totalDepth.toFixed(2)),
      requiredSteelArea: Number(requiredSteelArea.toFixed(2)),
      minimumSteelArea: Number(minimumSteelArea.toFixed(2)),
      providedSteelArea: Number(providedSteelArea.toFixed(2)),
      recommendedBarSize,
      barSpacing: Number(barSpacing.toFixed(0)),
      numberOfBars: Number(numberOfBars.toFixed(0)),
      checks,
      designStatus,
      designNotes,
    };

    // Save to database
    const slabDesign = new SlabDesign({
      project: projectId,
      user: userId,
      designName: `Slab Design - ${slabType}`,
      inputParameters: {
        slabType,
        spanLengthShort: Number(spanLengthShort),
        spanLengthLong: Number(spanLengthLong),
        slabThickness: Number(slabThickness),
        supportCondition,
        liveLoad: Number(liveLoad),
        floorFinishLoad: Number(floorFinishLoad),
        concreteGrade,
        steelGrade,
        coverToReinforcement: Number(coverToReinforcement),
      },
      calculatedResults,
    });

    await slabDesign.save();

    // Return response
    res.json({
      success: true,
      message: "Slab design calculation completed successfully",
      data: {
        designId: slabDesign._id,
        inputParameters: slabDesign.inputParameters,
        calculatedResults,
      },
    });

  } catch (error) {
    console.error("Slab design calculation error:", error);
    res.status(500).json({
      success: false,
      message: "Error calculating slab design",
      error: error.message,
    });
  }
};

/**
 * Calculate reinforcement details
 */
function calculateReinforcement(requiredArea, width, thickness) {
  const barSizes = [8, 10, 12, 16, 20];
  let bestBarSize = 10;
  let bestSpacing = 300;
  let bestNumberOfBars = 0;

  for (const barSize of barSizes) {
    const barArea = BAR_PROPERTIES[barSize].area;
    const numberOfBars = Math.ceil(requiredArea / barArea);
    const spacing = Math.floor(width / numberOfBars);
    
    // Check if spacing is within limits (150mm to 300mm)
    if (spacing >= 150 && spacing <= 300) {
      bestBarSize = barSize;
      bestSpacing = spacing;
      bestNumberOfBars = numberOfBars;
      break;
    }
  }

  return {
    recommendedBarSize: `T${bestBarSize}`,
    barSpacing: bestSpacing,
    numberOfBars: bestNumberOfBars,
  };
}

/**
 * Perform design checks as per IS 456:2000
 */
function performDesignChecks(params) {
  const {
    slabThickness,
    spanLengthShort,
    spanLengthLong,
    providedSteelArea,
    minimumSteelArea,
    barSpacing,
    factoredLoad,
    fck,
    fy,
    providedEffectiveDepth,
  } = params;

  const checks = {};

  // Minimum steel check
  checks.minSteelCheck = {
    status: providedSteelArea >= minimumSteelArea ? "Pass" : "Fail",
    value: providedSteelArea,
    requirement: minimumSteelArea,
  };

      // Maximum bar spacing check (3 * effective depth or 300mm, whichever is less)
  const maxAllowedSpacing = Math.min(3 * providedEffectiveDepth, 300);
  checks.maxBarSpacingCheck = {
    status: barSpacing <= maxAllowedSpacing ? "Pass" : "Fail",
    value: barSpacing,
    requirement: maxAllowedSpacing,
  };

  // Shear check (simplified)
  const shearForce = (factoredLoad * spanLengthShort) / 2;
  const shearStress = shearForce * 1000 / (1000 * providedEffectiveDepth);
  const allowableShearStress = 0.25 * Math.sqrt(fck);
  checks.shearCheck = {
    status: shearStress <= allowableShearStress ? "Pass" : "Fail",
    value: shearStress,
    requirement: allowableShearStress,
  };

  // Deflection check (span to depth ratio)
  const actualSpanToDepthRatio = spanLengthShort * 1000 / providedEffectiveDepth;
  const allowableSpanToDepthRatio = 20; // Basic value for simply supported slab
  checks.deflectionCheck = {
    status: actualSpanToDepthRatio <= allowableSpanToDepthRatio ? "Pass" : "Warning",
    value: actualSpanToDepthRatio,
    requirement: allowableSpanToDepthRatio,
  };

  return checks;
}

/**
 * Generate design notes
 */
function generateDesignNotes(params) {
  const { slabType, spanRatio, checks, momentCoefficient } = params;
  const notes = [];

  notes.push(`Design performed as per IS 456:2000 using Limit State Method`);
  notes.push(`Slab type: ${slabType}`);
  
  if (slabType === "Two-way" && spanRatio > 2.0) {
    notes.push(`Span ratio (${spanRatio.toFixed(2)}) > 2.0, designed as one-way slab`);
  }

  notes.push(`Moment coefficient used: ${momentCoefficient.toFixed(4)}`);

  // Add check-specific notes
  if (checks.minSteelCheck.status === "Fail") {
    notes.push(`WARNING: Minimum steel requirement not satisfied`);
  }
  
  if (checks.maxBarSpacingCheck.status === "Fail") {
    notes.push(`WARNING: Bar spacing exceeds maximum allowed limit`);
  }
  
  if (checks.shearCheck.status === "Fail") {
    notes.push(`WARNING: Shear stress exceeds allowable limit`);
  }
  
  if (checks.deflectionCheck.status === "Warning") {
    notes.push(`WARNING: Span to depth ratio may cause excessive deflection`);
  }

  return notes;
}

/**
 * Get slab design by ID
 */
export const getSlabDesign = async (req, res) => {
  try {
    const { designId } = req.params;
    
    const slabDesign = await SlabDesign.findById(designId)
      .populate('project', 'name')
      .populate('user', 'username');

    if (!slabDesign) {
      return res.status(404).json({
        success: false,
        message: "Slab design not found",
      });
    }

    res.json({
      success: true,
      data: slabDesign,
    });
  } catch (error) {
    console.error("Get slab design error:", error);
    res.status(500).json({
      success: false,
      message: "Error retrieving slab design",
      error: error.message,
    });
  }
};

/**
 * Get all slab designs for a project
 */
export const getProjectSlabDesigns = async (req, res) => {
  try {
    const { projectId } = req.params;
    
    const slabDesigns = await SlabDesign.find({ project: projectId, isActive: true })
      .populate('user', 'username')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: slabDesigns,
    });
  } catch (error) {
    console.error("Get project slab designs error:", error);
    res.status(500).json({
      success: false,
      message: "Error retrieving slab designs",
      error: error.message,
    });
  }
};

/**
 * Update slab design
 */
export const updateSlabDesign = async (req, res) => {
  try {
    const { designId } = req.params;
    const userId = req.user.id;
    const updateData = req.body;

    const slabDesign = await SlabDesign.findByIdAndUpdate(
      designId,
      updateData,
      { new: true, runValidators: true }
    );

    if (!slabDesign) {
      return res.status(404).json({
        success: false,
        message: "Slab design not found"
      });
    }

    if (slabDesign.user.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: "Access denied"
      });
    }

    return res.status(200).json({
      success: true,
      message: "Slab design updated successfully",
      data: slabDesign
    });

  } catch (error) {
    console.error('Error in updateSlabDesign:', error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message
    });
  }
};

/**
 * Delete slab design
 */
export const deleteSlabDesign = async (req, res) => {
  try {
    const { designId } = req.params;
    const userId = req.user.id;

    const slabDesign = await SlabDesign.findByIdAndDelete(designId);

    if (!slabDesign) {
      return res.status(404).json({
        success: false,
        message: "Slab design not found"
      });
    }

    if (slabDesign.user.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: "Access denied"
      });
    }

    return res.status(200).json({
      success: true,
      message: "Slab design deleted successfully"
    });

  } catch (error) {
    console.error('Error in deleteSlabDesign:', error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message
    });
  }
};

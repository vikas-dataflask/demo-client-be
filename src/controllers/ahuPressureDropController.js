import AhuPressureDrop from "../models/ahuPressureDrop.js";
import { calculateAHU, calculateTotalAHUForMultipleEquipment } from "../services/calculations/HVAC/AHUCalculation.js";

// Save AHU pressure drop data
export const saveAhuPressureDropData = async (req, res) => {
  try {
    const { project_id, input_data } = req.body;

    if (!project_id || !input_data) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields: project_id, input_data",
      });
    }

    // Check if data already exists
    const existingData = await AhuPressureDrop.findOne({ project_id });
    if (existingData) {
      return res.status(400).json({
        success: false,
        message:
          "AHU pressure drop data already exists for this project. Use update instead.",
      });
    }

    // Perform AHU calculation
    const calculationResult = calculateAHU(input_data);

    const ahuPressureDropData = new AhuPressureDrop({
      project_id,
      equipmentList: [{
        // Input data
        flowrate: input_data.flowrate,
        width: input_data.width || 0,
        height: input_data.height || 0,
        diameter: input_data.diameter || 0,
        length: input_data.length || 0,
        coefficientOfFitting: input_data.coefficientOfFitting || 0,
        equipmentName: input_data.equipmentName || "",
        
        // Calculated results
        isDuctOrPlenum: calculationResult.isDuctOrPlenum,
        area: calculationResult.area,
        velocity: calculationResult.velocity,
        hydraulicDiameter: calculationResult.hydraulicDiameter,
        rectangularDucts: calculationResult.rectangularDucts,
        le: calculationResult.le,
        reynoldsNumber: calculationResult.reynoldsNumber,
        velocityPressure: calculationResult.velocityPressure,
        frictionFactor: calculationResult.frictionFactor,
        lambda: calculationResult.lambda,
        frictionPressureLoss: calculationResult.frictionPressureLoss,
        fittingPressureLoss: calculationResult.fittingPressureLoss,
        totalPressureLoss: calculationResult.totalPressureLoss,
        
        // Physical constants
        density: calculationResult.density,
        kinematicViscosity: calculationResult.kinematicViscosity,
      }],
      totalSystemPressureLoss: calculationResult.totalPressureLoss,
      equipmentCount: 1,
      successfulCalculations: 1,
      failedCalculations: 0,
    });

    const savedData = await ahuPressureDropData.save();

    res.status(201).json({
      success: true,
      message: "AHU pressure drop data saved successfully",
      data: {
        ...savedData.toObject(),
        calculationResult,
      },
    });
  } catch (error) {
    console.error("Error saving AHU pressure drop data:", error);
    res.status(500).json({
      success: false,
      message: "Error saving AHU pressure drop data",
      error: error.message,
    });
  }
};

// Get AHU pressure drop data by project_id (for autofill)
export const getAhuPressureDropData = async (req, res) => {
  try {
    const { project_id } = req.params;

    if (!project_id) {
      return res.status(400).json({
        success: false,
        message: "Missing required parameter: project_id",
      });
    }

    const ahuPressureDropData = await AhuPressureDrop.findOne({
      project_id,
    });

    if (!ahuPressureDropData) {
      return res.status(404).json({
        success: false,
        message: "AHU pressure drop data not found for this project",
      });
    }

    res.status(200).json({
      success: true,
      message: "AHU pressure drop data retrieved successfully",
      data: ahuPressureDropData,
    });
  } catch (error) {
    console.error("Error retrieving AHU pressure drop data:", error);
    res.status(500).json({
      success: false,
      message: "Error retrieving AHU pressure drop data",
      error: error.message,
    });
  }
};

// Update AHU pressure drop data
export const updateAhuPressureDropData = async (req, res) => {
  try {
    const { project_id } = req.params;
    const { input_data } = req.body;

    if (!project_id || !input_data) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields: project_id, input_data",
      });
    }

    const existingData = await AhuPressureDrop.findOne({ project_id });
    if (!existingData) {
      return res.status(404).json({
        success: false,
        message: "AHU pressure drop data not found for this project",
      });
    }

    // Perform AHU calculation
    const calculationResult = calculateAHU(input_data);

    const updatedData = await AhuPressureDrop.findOneAndUpdate(
      { project_id },
      {
        equipmentList: [{
          // Input data
          flowrate: input_data.flowrate,
          width: input_data.width || 0,
          height: input_data.height || 0,
          diameter: input_data.diameter || 0,
          length: input_data.length || 0,
          coefficientOfFitting: input_data.coefficientOfFitting || 0,
          equipmentName: input_data.equipmentName || "",
          
          // Calculated results
          isDuctOrPlenum: calculationResult.isDuctOrPlenum,
          area: calculationResult.area,
          velocity: calculationResult.velocity,
          hydraulicDiameter: calculationResult.hydraulicDiameter,
          rectangularDucts: calculationResult.rectangularDucts,
          le: calculationResult.le,
          reynoldsNumber: calculationResult.reynoldsNumber,
          velocityPressure: calculationResult.velocityPressure,
          frictionFactor: calculationResult.frictionFactor,
          lambda: calculationResult.lambda,
          frictionPressureLoss: calculationResult.frictionPressureLoss,
          fittingPressureLoss: calculationResult.fittingPressureLoss,
          totalPressureLoss: calculationResult.totalPressureLoss,
          
          // Physical constants
          density: calculationResult.density,
          kinematicViscosity: calculationResult.kinematicViscosity,
        }],
        totalSystemPressureLoss: calculationResult.totalPressureLoss,
        equipmentCount: 1,
        successfulCalculations: 1,
        failedCalculations: 0,
      },
      { new: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      message: "AHU pressure drop data updated successfully",
      data: {
        ...updatedData.toObject(),
        calculationResult,
      },
    });
  } catch (error) {
    console.error("Error updating AHU pressure drop data:", error);
    res.status(500).json({
      success: false,
      message: "Error updating AHU pressure drop data",
      error: error.message,
    });
  }
};

// New endpoint for calculating total system pressure drop for multiple equipment
export const calculateTotalSystemPressureDrop = async (req, res) => {
  try {
    const { equipmentList, project_id } = req.body;

    if (!equipmentList || !Array.isArray(equipmentList) || equipmentList.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Equipment list must be a non-empty array",
      });
    }

    // Perform total system calculation
    const result = calculateTotalAHUForMultipleEquipment(equipmentList);

    // Save the complete data to database if project_id is provided
    if (project_id) {
      try {
        // Check if data already exists
        const existingData = await AhuPressureDrop.findOne({ project_id });
        
        if (existingData) {
          // Update existing data
          await AhuPressureDrop.findOneAndUpdate(
            { project_id },
            {
              equipmentList: result.individualResults.map(equipment => ({
                // Input data
                flowrate: equipment.input_flowrate,
                width: equipment.input_width,
                height: equipment.input_height,
                diameter: equipment.input_diameter,
                length: equipment.input_length,
                coefficientOfFitting: equipment.input_coefficientOfFitting,
                equipmentName: equipment.input_equipmentName,
                
                // Calculated results
                isDuctOrPlenum: equipment.isDuctOrPlenum,
                area: equipment.area,
                velocity: equipment.velocity,
                hydraulicDiameter: equipment.hydraulicDiameter,
                rectangularDucts: equipment.rectangularDucts,
                le: equipment.le,
                reynoldsNumber: equipment.reynoldsNumber,
                velocityPressure: equipment.velocityPressure,
                frictionFactor: equipment.frictionFactor,
                lambda: equipment.lambda,
                frictionPressureLoss: equipment.frictionPressureLoss,
                fittingPressureLoss: equipment.fittingPressureLoss,
                totalPressureLoss: equipment.totalPressureLoss,
                
                // Physical constants
                density: equipment.density,
                kinematicViscosity: equipment.kinematicViscosity,
              })),
              totalSystemPressureLoss: result.totalSystemPressureLoss,
              equipmentCount: result.equipmentCount,
              successfulCalculations: result.successfulCalculations,
              failedCalculations: result.failedCalculations,
            },
            { new: true, runValidators: true }
          );
        } else {
          // Create new data
          const ahuPressureDropData = new AhuPressureDrop({
            project_id,
            equipmentList: result.individualResults.map(equipment => ({
              // Input data
              flowrate: equipment.input_flowrate,
              width: equipment.input_width,
              height: equipment.input_height,
              diameter: equipment.input_diameter,
              length: equipment.input_length,
              coefficientOfFitting: equipment.input_coefficientOfFitting,
              equipmentName: equipment.input_equipmentName,
              
              // Calculated results
              isDuctOrPlenum: equipment.isDuctOrPlenum,
              area: equipment.area,
              velocity: equipment.velocity,
              hydraulicDiameter: equipment.hydraulicDiameter,
              rectangularDucts: equipment.rectangularDucts,
              le: equipment.le,
              reynoldsNumber: equipment.reynoldsNumber,
              velocityPressure: equipment.velocityPressure,
              frictionFactor: equipment.frictionFactor,
              lambda: equipment.lambda,
              frictionPressureLoss: equipment.frictionPressureLoss,
              fittingPressureLoss: equipment.fittingPressureLoss,
              totalPressureLoss: equipment.totalPressureLoss,
              
              // Physical constants
              density: equipment.density,
              kinematicViscosity: equipment.kinematicViscosity,
            })),
            totalSystemPressureLoss: result.totalSystemPressureLoss,
            equipmentCount: result.equipmentCount,
            successfulCalculations: result.successfulCalculations,
            failedCalculations: result.failedCalculations,
          });
          
          await ahuPressureDropData.save();
        }
      } catch (saveError) {
        console.error("Error saving AHU data:", saveError);
        // Continue with the response even if save fails
      }
    }

    res.status(200).json({
      success: true,
      message: "Total system pressure drop calculated successfully",
      data: result,
    });
  } catch (error) {
    console.error("Error calculating total system pressure drop:", error);
    res.status(500).json({
      success: false,
      message: "Error calculating total system pressure drop",
      error: error.message,
    });
  }
};

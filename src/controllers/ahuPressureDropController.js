import AhuPressureDrop from "../models/ahuPressureDrop.js";

// Save AHU pressure drop data
export const saveAhuPressureDropData = async (req, res) => {
  try {
    const { project_id, room, input_data } = req.body;

    if (!project_id || !room || !input_data) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields: project_id, room, input_data",
      });
    }

    // Check if data already exists
    const existingData = await AhuPressureDrop.findOne({ project_id, room });
    if (existingData) {
      return res.status(400).json({
        success: false,
        message:
          "AHU pressure drop data already exists for this project and room. Use update instead.",
      });
    }

    // Create input summary
    const inputSummary = {
      airflow: input_data.airflow,
      velocity: input_data.velocity,
      ductShape: input_data.ductShape,
      ductDiameter: input_data.ductDiameter,
      ductWidth: input_data.ductWidth,
      ductHeight: input_data.ductHeight,
      coilPressureDrop: input_data.coilPressureDrop,
      filterPressureDrop: input_data.filterPressureDrop,
      additionalLosses: input_data.additionalLosses,
      fittingVelocity: input_data.fittingVelocity,
      airDensity: input_data.airDensity,
      selectedFittings: input_data.selectedFittings,
      selectedFittingsQuantities: input_data.selectedFittingsQuantities,
    };

    const ahuPressureDropData = new AhuPressureDrop({
      project_id,
      room,
      airflow: input_data.airflow,
      velocity: input_data.velocity,
      ductShape: input_data.ductShape,
      ductDiameter: input_data.ductDiameter,
      ductWidth: input_data.ductWidth,
      ductHeight: input_data.ductHeight,
      coilPressureDrop: input_data.coilPressureDrop,
      filterPressureDrop: input_data.filterPressureDrop,
      additionalLosses: input_data.additionalLosses,

      fittingVelocity: input_data.fittingVelocity,
      airDensity: input_data.airDensity,
      selectedFittings: input_data.selectedFittings,
      selectedFittingsQuantities: input_data.selectedFittingsQuantities,

      // ✅ NEWLY ADDED
      fittingLosses: input_data.fittingLosses || 0,

      totalPressureDrop: input_data.totalPressureDrop,
      breakdown: {
        coilDrop: input_data.coilPressureDrop,
        filterDrop: input_data.filterPressureDrop,
        fittingLosses: input_data.fittingLosses || 0,
        additionalLosses: input_data.additionalLosses || 0,
      },
      fittingBreakdown: input_data.fittingBreakdown,
      calculationSummary: input_data.calculationSummary,
      inputSummary,
    });

    const savedData = await ahuPressureDropData.save();

    res.status(201).json({
      success: true,
      message: "AHU pressure drop data saved successfully",
      data: savedData,
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

// Get AHU pressure drop data by project_id and room (for autofill)
export const getAhuPressureDropData = async (req, res) => {
  try {
    const { project_id, room } = req.params;

    if (!project_id || !room) {
      return res.status(400).json({
        success: false,
        message: "Missing required parameters: project_id and room",
      });
    }

    const ahuPressureDropData = await AhuPressureDrop.findOne({
      project_id,
      room,
    });

    if (!ahuPressureDropData) {
      return res.status(404).json({
        success: false,
        message: "AHU pressure drop data not found for this project and room",
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
    const { project_id, room } = req.params;
    const { input_data } = req.body;

    if (!project_id || !room || !input_data) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields: project_id, room, input_data",
      });
    }

    const existingData = await AhuPressureDrop.findOne({ project_id, room });
    if (!existingData) {
      return res.status(404).json({
        success: false,
        message: "AHU pressure drop data not found for this project and room",
      });
    }

    // Create input summary
    const inputSummary = {
      airflow: input_data.airflow,
      velocity: input_data.velocity,
      ductShape: input_data.ductShape,
      ductDiameter: input_data.ductDiameter,
      ductWidth: input_data.ductWidth,
      ductHeight: input_data.ductHeight,
      coilPressureDrop: input_data.coilPressureDrop,
      filterPressureDrop: input_data.filterPressureDrop,
      additionalLosses: input_data.additionalLosses,
      fittingVelocity: input_data.fittingVelocity,
      airDensity: input_data.airDensity,
      selectedFittings: input_data.selectedFittings,
      selectedFittingsQuantities: input_data.selectedFittingsQuantities,
    };

    const updatedData = await AhuPressureDrop.findOneAndUpdate(
      { project_id, room },
      {
        airflow: input_data.airflow,
        velocity: input_data.velocity,
        ductShape: input_data.ductShape,
        ductDiameter: input_data.ductDiameter,
        ductWidth: input_data.ductWidth,
        ductHeight: input_data.ductHeight,
        coilPressureDrop: input_data.coilPressureDrop,
        filterPressureDrop: input_data.filterPressureDrop,
        additionalLosses: input_data.additionalLosses,
        fittingVelocity: input_data.fittingVelocity,
        airDensity: input_data.airDensity,
        selectedFittings: input_data.selectedFittings,
        selectedFittingsQuantities: input_data.selectedFittingsQuantities,

        // ✅ NEWLY ADDED
        fittingLosses: input_data.fittingLosses || 0,

        totalPressureDrop: input_data.totalPressureDrop,
        breakdown: {
          coilDrop: input_data.coilPressureDrop,
          filterDrop: input_data.filterPressureDrop,
          fittingLosses: input_data.fittingLosses || 0,
          additionalLosses: input_data.additionalLosses || 0,
        },
        fittingBreakdown: input_data.fittingBreakdown,
        calculationSummary: input_data.calculationSummary,
        inputSummary,
      },
      { new: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      message: "AHU pressure drop data updated successfully",
      data: updatedData,
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

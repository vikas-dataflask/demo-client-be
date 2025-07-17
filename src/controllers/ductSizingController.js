import DuctSizing from "../models/ductSizing.js";
import { calculateDuctSize } from "../utils/ductSizer.js";

// Save duct sizing data
export const saveDuctSizingData = async (req, res) => {
  try {
    const { project_id, room, input_data } = req.body;

    if (!project_id || !room || !input_data) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields: project_id, room, input_data",
      });
    }

    // Check if data already exists for this project and room
    const existingData = await DuctSizing.findOne({
      project_id,
      room,
    });

    if (existingData) {
      return res.status(400).json({
        success: false,
        message: "Duct sizing data already exists for this project and room. Use update instead.",
      });
    }

    // Calculate duct sizing results
    const calculationInput = {
      airflowCFM: input_data.airflowCFM,
      maxVelocity: input_data.maxVelocity,
      shape: input_data.shape,
      aspectRatio: input_data.aspectRatio,
      room: room,
      heatLoadCapacity: input_data.heatLoadCapacity,
    };

    const calculatedResults = calculateDuctSize(calculationInput);

    // Create input summary
    const inputSummary = {
      airflowCFM: input_data.airflowCFM,
      velocity: input_data.maxVelocity,
      shape: input_data.shape,
      aspectRatio: input_data.aspectRatio,
      room: room,
      heatLoadCapacity: input_data.heatLoadCapacity,
    };

    // Create new duct sizing document
    const ductSizingData = new DuctSizing({
      project_id,
      room,
      airflowCFM: input_data.airflowCFM,
      velocity: input_data.maxVelocity,
      area_m2: calculatedResults.area_m2,
      roundDiameter_mm: calculatedResults.roundDiameter_mm,
      rectangular: calculatedResults.rectangular,
      heatLoadCapacity: input_data.heatLoadCapacity,
      inputSummary,
    });

    const savedData = await ductSizingData.save();

    res.status(201).json({
      success: true,
      message: "Duct sizing data saved successfully",
      data: savedData,
    });
  } catch (error) {
    console.error("Error saving duct sizing data:", error);
    res.status(500).json({
      success: false,
      message: "Error saving duct sizing data",
      error: error.message,
    });
  }
};

// Get duct sizing data by project_id and room (for autofill)
export const getDuctSizingData = async (req, res) => {
  try {
    const { project_id, room } = req.params;

    if (!project_id || !room) {
      return res.status(400).json({
        success: false,
        message: "Missing required parameters: project_id and room",
      });
    }

    const ductSizingData = await DuctSizing.findOne({
      project_id,
      room,
    });

    if (!ductSizingData) {
      return res.status(404).json({
        success: false,
        message: "Duct sizing data not found for this project and room",
      });
    }

    res.status(200).json({
      success: true,
      message: "Duct sizing data retrieved successfully",
      data: ductSizingData,
    });
  } catch (error) {
    console.error("Error retrieving duct sizing data:", error);
    res.status(500).json({
      success: false,
      message: "Error retrieving duct sizing data",
      error: error.message,
    });
  }
};

// Update duct sizing data
export const updateDuctSizingData = async (req, res) => {
  try {
    const { project_id, room } = req.params;
    const { input_data } = req.body;

    if (!project_id || !room || !input_data) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields: project_id, room, input_data",
      });
    }

    // Check if data exists
    const existingData = await DuctSizing.findOne({
      project_id,
      room,
    });

    if (!existingData) {
      return res.status(404).json({
        success: false,
        message: "Duct sizing data not found for this project and room",
      });
    }

    // Calculate new duct sizing results
    const calculationInput = {
      airflowCFM: input_data.airflowCFM,
      maxVelocity: input_data.maxVelocity,
      shape: input_data.shape,
      aspectRatio: input_data.aspectRatio,
      room: room,
      heatLoadCapacity: input_data.heatLoadCapacity,
    };

    const calculatedResults = calculateDuctSize(calculationInput);

    // Create input summary
    const inputSummary = {
      airflowCFM: input_data.airflowCFM,
      velocity: input_data.maxVelocity,
      shape: input_data.shape,
      aspectRatio: input_data.aspectRatio,
      room: room,
      heatLoadCapacity: input_data.heatLoadCapacity,
    };

    // Update the document
    const updatedData = await DuctSizing.findOneAndUpdate(
      {
        project_id,
        room,
      },
      {
        airflowCFM: input_data.airflowCFM,
        velocity: input_data.maxVelocity,
        area_m2: calculatedResults.area_m2,
        roundDiameter_mm: calculatedResults.roundDiameter_mm,
        rectangular: calculatedResults.rectangular,
        heatLoadCapacity: input_data.heatLoadCapacity,
        inputSummary,
      },
      {
        new: true,
        runValidators: true,
      }
    );

    res.status(200).json({
      success: true,
      message: "Duct sizing data updated successfully",
      data: updatedData,
    });
  } catch (error) {
    console.error("Error updating duct sizing data:", error);
    res.status(500).json({
      success: false,
      message: "Error updating duct sizing data",
      error: error.message,
    });
  }
}; 
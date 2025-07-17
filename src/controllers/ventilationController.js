import Ventilation from "../models/ventilationModel.js";
import { calculateVentilation } from "../services/calculations/HVAC/Ventilation.js";

// ✅ Save ventilation data (calculate in backend)
export const saveVentilationData = async (req, res) => {
  try {
    const { project_id, room, input_data } = req.body;

    if (!project_id || !room || !input_data) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields: project_id, room, input_data",
      });
    }

    // Prevent duplicates
    const existingData = await Ventilation.findOne({ project_id, room });
    if (existingData) {
      return res.status(400).json({
        success: false,
        message: "Ventilation data already exists. Use update instead.",
      });
    }

    // Always calculate in backend
    const result_data = calculateVentilation(input_data);

    // Save in DB
    const ventilationData = new Ventilation({
      project_id,
      room,
      input_data,
      result_data,
    });
    const savedData = await ventilationData.save();

    res.status(201).json({
      success: true,
      message: "Ventilation data saved successfully",
      data: savedData,
    });
  } catch (error) {
    console.error("Error saving ventilation data:", error);
    res.status(500).json({
      success: false,
      message: "Error saving ventilation data",
      error: error.message,
    });
  }
};

// ✅ Get ventilation data by project_id & room (for autofill)
export const getVentilationData = async (req, res) => {
  try {
    const { project_id, room } = req.params;

    if (!project_id || !room) {
      return res.status(400).json({
        success: false,
        message: "Missing required parameters: project_id and room",
      });
    }

    const ventilationData = await Ventilation.findOne({ project_id, room });
    if (!ventilationData) {
      return res.status(404).json({
        success: false,
        message: "Ventilation data not found for this project and room",
      });
    }

    res.status(200).json({
      success: true,
      message: "Ventilation data retrieved successfully",
      data: ventilationData,
    });
  } catch (error) {
    console.error("Error retrieving ventilation data:", error);
    res.status(500).json({
      success: false,
      message: "Error retrieving ventilation data",
      error: error.message,
    });
  }
};

// ✅ Update ventilation data (recalculates in backend)
export const updateVentilationData = async (req, res) => {
  try {
    const { project_id, room } = req.params;
    const { input_data } = req.body;

    if (!project_id || !room || !input_data) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields: project_id, room, input_data",
      });
    }

    const existingData = await Ventilation.findOne({ project_id, room });
    if (!existingData) {
      return res.status(404).json({
        success: false,
        message: "Ventilation data not found for this project and room",
      });
    }

    const result_data = calculateVentilation(input_data);

    const updatedData = await Ventilation.findOneAndUpdate(
      { project_id, room },
      { input_data, result_data },
      { new: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      message: "Ventilation data updated successfully",
      data: updatedData,
    });
  } catch (error) {
    console.error("Error updating ventilation data:", error);
    res.status(500).json({
      success: false,
      message: "Error updating ventilation data",
      error: error.message,
    });
  }
};

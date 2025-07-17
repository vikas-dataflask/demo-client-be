import ChillerPressureDrop from "../models/chillerPressureDrop.js";
import { calculateChillerPressureDrop } from "../utils/chillerPressureDrop.js";

// Save chiller pressure drop data
export const saveChillerPressureDropData = async (req, res) => {
  try {
    const { project_id, room, input_data, result_data } = req.body;

    if (!project_id || !room || !input_data) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields: project_id, room, input_data",
      });
    }

    // Check if data already exists for this project and room
    const existingData = await ChillerPressureDrop.findOne({
      project_id,
      room,
    });

    if (existingData) {
      return res.status(400).json({
        success: false,
        message:
          "Chiller pressure drop data already exists for this project and room. Use update instead.",
      });
    }

    // If result_data is not provided, calculate it using the PA version
    let finalResultData = result_data;
    if (!finalResultData) {
      try {
        finalResultData = calculateChillerPressureDrop(
          input_data,
          input_data.mode || "data"
        );
      } catch (err) {
        return res.status(400).json({
          success: false,
          message: "Error calculating chiller pressure drop result data",
          error: err.message,
        });
      }
    }

    // Create new chiller pressure drop document
    const chillerPressureDropData = new ChillerPressureDrop({
      project_id,
      room,
      mode: input_data.mode || "data",
      input_data,
      result_data: finalResultData,
    });

    const savedData = await chillerPressureDropData.save();

    res.status(201).json({
      success: true,
      message: "Chiller pressure drop data saved successfully",
      data: savedData,
    });
  } catch (error) {
    console.error("Error saving chiller pressure drop data:", error);
    res.status(500).json({
      success: false,
      message: "Error saving chiller pressure drop data",
      error: error.message,
    });
  }
};

// Get chiller pressure drop data by project_id and room (for autofill)
export const getChillerPressureDropData = async (req, res) => {
  try {
    const { project_id, room } = req.params;

    if (!project_id || !room) {
      return res.status(400).json({
        success: false,
        message: "Missing required parameters: project_id and room",
      });
    }

    const chillerPressureDropData = await ChillerPressureDrop.findOne({
      project_id,
      room,
    });

    if (!chillerPressureDropData) {
      return res.status(404).json({
        success: false,
        message:
          "Chiller pressure drop data not found for this project and room",
      });
    }

    res.status(200).json({
      success: true,
      message: "Chiller pressure drop data retrieved successfully",
      data: chillerPressureDropData,
    });
  } catch (error) {
    console.error("Error retrieving chiller pressure drop data:", error);
    res.status(500).json({
      success: false,
      message: "Error retrieving chiller pressure drop data",
      error: error.message,
    });
  }
};

// Update chiller pressure drop data
export const updateChillerPressureDropData = async (req, res) => {
  try {
    const { project_id, room } = req.params;
    const { input_data, result_data } = req.body;

    if (!project_id || !room || !input_data) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields: project_id, room, input_data",
      });
    }

    // Check if data exists
    const existingData = await ChillerPressureDrop.findOne({
      project_id,
      room,
    });

    if (!existingData) {
      return res.status(404).json({
        success: false,
        message:
          "Chiller pressure drop data not found for this project and room",
      });
    }

    // If result_data is not provided, calculate it using the PA version
    let finalResultData = result_data;
    if (!finalResultData) {
      try {
        finalResultData = calculateChillerPressureDrop(
          input_data,
          input_data.mode || "data"
        );
      } catch (err) {
        return res.status(400).json({
          success: false,
          message: "Error calculating chiller pressure drop result data",
          error: err.message,
        });
      }
    }

    // Update the document
    const updatedData = await ChillerPressureDrop.findOneAndUpdate(
      {
        project_id,
        room,
      },
      {
        mode: input_data.mode || "data",
        input_data,
        result_data: finalResultData,
      },
      {
        new: true,
        runValidators: true,
      }
    );

    res.status(200).json({
      success: true,
      message: "Chiller pressure drop data updated successfully",
      data: updatedData,
    });
  } catch (error) {
    console.error("Error updating chiller pressure drop data:", error);
    res.status(500).json({
      success: false,
      message: "Error updating chiller pressure drop data",
      error: error.message,
    });
  }
};

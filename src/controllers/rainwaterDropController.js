import RainwaterDrop from "../models/rainwaterDropModel.js";
import { calculateRainwaterDropSizing } from "../services/calculations/Plumbing/RainwaterDropSizing.js";

// Save or Update Rainwater Drop Calculation
export const saveRainwaterDrop = async (req, res) => {
  try {
    const { project_id, ...inputData } = req.body;

    if (!project_id) {
      return res.status(400).json({
        success: false,
        message: "Project ID is required",
      });
    }

    // Run calculation
    const resultData = calculateRainwaterDropSizing(inputData);

    // Upsert by project_id
    let existing = await RainwaterDrop.findOne({ project_id });
    if (existing) {
      existing.input_data = inputData;
      existing.result_data = resultData;
      await existing.save();
    } else {
      existing = await RainwaterDrop.create({
        project_id,
        input_data: inputData,
        result_data: resultData,
      });
    }

    res.status(200).json({
      success: true,
      message: "Rainwater drop data saved successfully",
      data: existing,
    });
  } catch (err) {
    console.error("Error saving rainwater drop data:", err);
    res.status(500).json({
      success: false,
      message: err.message || "Internal Server Error",
    });
  }
};

// Get Rainwater Drop Calculation by Project ID
export const getRainwaterDropByProject = async (req, res) => {
  try {
    const { project_id } = req.params;
    const data = await RainwaterDrop.findOne({ project_id });
    if (!data) {
      return res.status(404).json({
        success: false,
        message: "No rainwater drop data found for this project",
      });
    }
    res.status(200).json({
      success: true,
      data,
    });
  } catch (err) {
    console.error("Error fetching rainwater drop data:", err);
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
}; 
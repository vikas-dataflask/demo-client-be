import DrainagePipe from "../models/drainagePipeModel.js";
import { calculateDrainagePipeSizing } from "../services/calculations/Plumbing/DrainagePipeSizing.js";

// Save or Update Drainage Pipe Calculation
export const saveDrainagePipe = async (req, res) => {
  try {
    const { project_id, ...inputData } = req.body;

    if (!project_id) {
      return res.status(400).json({
        success: false,
        message: "Project ID is required",
      });
    }

    // Run calculation
    const resultData = calculateDrainagePipeSizing(inputData);

    // Upsert by project_id
    let existing = await DrainagePipe.findOne({ project_id });
    if (existing) {
      existing.input_data = inputData;
      existing.result_data = resultData;
      await existing.save();
    } else {
      existing = await DrainagePipe.create({
        project_id,
        input_data: inputData,
        result_data: resultData,
      });
    }

    res.status(200).json({
      success: true,
      message: "Drainage pipe data saved successfully",
      data: existing,
    });
  } catch (err) {
    console.error("Error saving drainage pipe data:", err);
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

// Get Drainage Pipe Calculation by Project ID
export const getDrainagePipeByProject = async (req, res) => {
  try {
    const { project_id } = req.params;
    const data = await DrainagePipe.findOne({ project_id });
    if (!data) {
      return res.status(404).json({
        success: false,
        message: "No drainage pipe data found for this project",
      });
    }
    res.status(200).json({
      success: true,
      data,
    });
  } catch (err) {
    console.error("Error fetching drainage pipe data:", err);
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
}; 
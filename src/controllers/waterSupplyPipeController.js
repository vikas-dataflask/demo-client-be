import WaterSupplyPipe from "../models/waterSupplyPipeModel.js";
import { calculateWaterSupplyPipes } from "../services/calculations/Plumbing/WaterSupplyPipes.js";

export const saveWaterSupplyPipeData = async (req, res) => {
  try {
    const { project_id, input_data } = req.body;

    if (!project_id) {
      return res.status(400).json({
        success: false,
        message: "Project ID is required",
      });
    }

    // ✅ Run the calculation here (expects an array of data)
    const calculatedResults = calculateWaterSupplyPipes([input_data]);

    if (!calculatedResults || calculatedResults.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Pipe sizing calculation failed",
      });
    }

    const result_data = calculatedResults[0];

    // ✅ Save to DB
    const newEntry = new WaterSupplyPipe({
      project_id,
      input_data,
      result_data,
    });

    await newEntry.save();

    res.status(201).json({
      success: true,
      message: "Water supply pipe sizing data saved successfully",
      data: newEntry,
    });
  } catch (error) {
    console.error("Error saving water supply pipe sizing data:", error);
    res.status(500).json({
      success: false,
      message: "Server error while saving data",
    });
  }
};

export const getWaterSupplyPipeData = async (req, res) => {
  try {
    const { project_id } = req.params;

    const records = await WaterSupplyPipe.find({ project_id }).sort({
      createdAt: -1,
    });

    res.status(200).json({
      success: true,
      data: records,
    });
  } catch (error) {
    console.error("Error fetching water supply pipe sizing data:", error);
    res.status(500).json({
      success: false,
      message: "Server error while retrieving data",
    });
  }
};

import HeatLoad from "../models/heatLoad.js";

export const storeHeatLoad = async (req, res) => {
  try {
    const { project_id, input_data, result_data } = req.body;

    if (!project_id) {
      return res.status(400).json({
        success: false,
        message: "Project ID is required",
      });
    }

    const newEntry = new HeatLoad({ project_id, input_data, result_data });
    const saved = await newEntry.save();

    res.status(201).json({
      success: true,
      message: "Heat load entry stored successfully",
      data: saved,
    });
  } catch (error) {
    console.error("Error storing heat load:", error);
    res.status(500).json({
      success: false,
      message: "Failed to store heat load data",
      error: error.message,
    });
  }
};

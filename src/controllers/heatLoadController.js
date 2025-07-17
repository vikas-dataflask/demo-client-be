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

export const getHeatLoadByProjectAndRoom = async (req, res) => {
  try {
    const { project_id, room } = req.query;

    if (!project_id) {
      return res.status(400).json({
        success: false,
        message: "Project ID is required",
      });
    }

    if (!room) {
      return res.status(400).json({
        success: false,
        message: "Room name is required",
      });
    }

    // Find the most recent heatload entry for the given project and room
    const heatLoadData = await HeatLoad.findOne({
      project_id: project_id,
      "input_data.room": room,
    }).sort({ createdAt: -1 }); // Get the most recent entry

    if (!heatLoadData) {
      return res.status(404).json({
        success: false,
        message: "No heat load data found for the specified project and room",
      });
    }

    res.status(200).json({
      success: true,
      message: "Heat load data retrieved successfully",
      data: {
        input_data: heatLoadData.input_data,
        result_data: heatLoadData.result_data,
        project_id: heatLoadData.project_id,
        createdAt: heatLoadData.createdAt,
      },
    });
  } catch (error) {
    console.error("Error retrieving heat load data:", error);
    res.status(500).json({
      success: false,
      message: "Failed to retrieve heat load data",
      error: error.message,
    });
  }
};

export const updateHeatLoad = async (req, res) => {
  try {
    const { project_id, room } = req.query;
    const { input_data, result_data } = req.body;

    if (!project_id) {
      return res.status(400).json({
        success: false,
        message: "Project ID is required",
      });
    }

    if (!room) {
      return res.status(400).json({
        success: false,
        message: "Room name is required",
      });
    }

    if (!input_data || !result_data) {
      return res.status(400).json({
        success: false,
        message: "Input data and result data are required",
      });
    }

    // Find the most recent heatload entry for the given project and room
    const existingHeatLoad = await HeatLoad.findOne({
      project_id: project_id,
      "input_data.room": room,
    }).sort({ createdAt: -1 });

    if (!existingHeatLoad) {
      return res.status(404).json({
        success: false,
        message: "No heat load data found for the specified project and room",
      });
    }

    // Update the existing entry
    const updatedHeatLoad = await HeatLoad.findByIdAndUpdate(
      existingHeatLoad._id,
      {
        input_data: input_data,
        result_data: result_data,
        updatedAt: new Date(),
      },
      { new: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      message: "Heat load data updated successfully",
      data: {
        input_data: updatedHeatLoad.input_data,
        result_data: updatedHeatLoad.result_data,
        project_id: updatedHeatLoad.project_id,
        createdAt: updatedHeatLoad.createdAt,
        updatedAt: updatedHeatLoad.updatedAt,
      },
    });
  } catch (error) {
    console.error("Error updating heat load data:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update heat load data",
      error: error.message,
    });
  }
};

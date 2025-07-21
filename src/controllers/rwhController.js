import RWH from "../models/rwhModel.js";

// ✅ Save RWH data (input + result)
export const addRwhData = async (req, res) => {
  try {
    const {
      project_id,
      input_data,
      result_data,
    } = req.body;

    if (!project_id) {
      return res
        .status(400)
        .json({ success: false, message: "Project ID is required" });
    }

    if (!input_data || !result_data) {
      return res
        .status(400)
        .json({ success: false, message: "Input data and result data are required" });
    }

    // Check if data already exists for this project and update it, or create new
    const existingData = await RWH.findOne({ project_id });
    
    let rwhData;
    if (existingData) {
      // Update existing data
      rwhData = await RWH.findOneAndUpdate(
        { project_id },
        {
          input_data,
          result_data,
          calculationDate: new Date(),
        },
        { new: true }
      );
    } else {
      // Create new data
      rwhData = await RWH.create({
        project_id,
        input_data,
        result_data,
      });
    }

    res.status(201).json({ 
      success: true, 
      data: rwhData,
      message: existingData ? "RWH data updated successfully" : "RWH data saved successfully"
    });
  } catch (error) {
    console.error("Error saving RWH data:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// ✅ Get saved RWH data (Autofill)
export const getRwhData = async (req, res) => {
  try {
    const { project_id } = req.params;
    
    if (!project_id) {
      return res
        .status(400)
        .json({ success: false, message: "Project ID is required" });
    }

    const data = await RWH.findOne({ project_id }).sort({ createdAt: -1 });

    if (!data) {
      return res.status(404).json({ 
        success: false, 
        message: "No RWH data found for this project" 
      });
    }

    res.status(200).json({ 
      success: true, 
      data: {
        input_data: data.input_data,
        result_data: data.result_data,
        calculationDate: data.calculationDate,
        createdAt: data.createdAt,
        updatedAt: data.updatedAt,
      }
    });
  } catch (error) {
    console.error("Error fetching RWH data:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// ✅ Delete RWH data for a project
export const deleteRwhData = async (req, res) => {
  try {
    const { project_id } = req.params;
    
    if (!project_id) {
      return res
        .status(400)
        .json({ success: false, message: "Project ID is required" });
    }

    const deletedData = await RWH.findOneAndDelete({ project_id });

    if (!deletedData) {
      return res.status(404).json({ 
        success: false, 
        message: "No RWH data found for this project" 
      });
    }

    res.status(200).json({ 
      success: true, 
      message: "RWH data deleted successfully" 
    });
  } catch (error) {
    console.error("Error deleting RWH data:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

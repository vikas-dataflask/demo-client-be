import FireHeadLoss from "../models/fireHeadLossModel.js";
import { calculateFireHeadLoss } from "../services/calculations/FireFight/FireHeadloss.js"; // Your calculation function

// ✅ Save or Update Fire Head Loss
export const saveFireHeadLoss = async (req, res) => {
  try {
    const { project_id, ...inputData } = req.body;

    if (!project_id) {
      return res.status(400).json({
        success: false,
        message: "Project ID is required",
      });
    }

    // ✅ Run calculation using your updated function
    const resultData = calculateFireHeadLoss(inputData);

    // ✅ Check if already exists
    let existing = await FireHeadLoss.findOne({ project_id });

    if (existing) {
      existing.input_data = inputData;
      existing.result_data = resultData;
      await existing.save();
    } else {
      existing = await FireHeadLoss.create({
        project_id,
        input_data: inputData,
        result_data: resultData,
      });
    }

    res.status(200).json({
      success: true,
      message: "Fire Head Loss data saved successfully",
      data: existing,
    });
  } catch (err) {
    console.error("Error saving Fire Head Loss:", err);
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

// ✅ Get Fire Head Loss by Project ID (Autofill)
export const getFireHeadLossByProject = async (req, res) => {
  try {
    const { project_id } = req.params;

    const data = await FireHeadLoss.findOne({ project_id });

    if (!data) {
      return res.status(404).json({
        success: false,
        message: "No Fire Head Loss data found for this project",
      });
    }

    res.status(200).json({
      success: true,
      data,
    });
  } catch (err) {
    console.error("Error fetching Fire Head Loss:", err);
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

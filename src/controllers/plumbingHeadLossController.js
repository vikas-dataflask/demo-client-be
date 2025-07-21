import PlumbingHeadLoss from "../models/plumbingHeadLossModel.js";
import calculatePlumbingHeadLoss from "../services/calculations/Plumbing/PlumbingHeadLoss.js";

// ✅ Save or Update Plumbing Head Loss
export const savePlumbingHeadLoss = async (req, res) => {
  try {
    const { project_id, ...inputData } = req.body;

    if (!project_id) {
      return res.status(400).json({
        success: false,
        message: "Project ID is required",
      });
    }

    // ✅ Run calculation using your updated function
    const resultData = calculatePlumbingHeadLoss(inputData);

    // ✅ Check if already exists
    let existing = await PlumbingHeadLoss.findOne({ project_id });

    if (existing) {
      existing.input_data = inputData;
      existing.result_data = resultData;
      await existing.save();
    } else {
      existing = await PlumbingHeadLoss.create({
        project_id,
        input_data: inputData,
        result_data: resultData,
      });
    }

    res.status(200).json({
      success: true,
      message: "Plumbing Head Loss data saved successfully",
      data: existing,
    });
  } catch (err) {
    console.error("Error saving Plumbing Head Loss:", err);
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

// ✅ Get Plumbing Head Loss by Project ID (Autofill)
export const getPlumbingHeadLossByProject = async (req, res) => {
  try {
    const { project_id } = req.params;

    const data = await PlumbingHeadLoss.findOne({ project_id });

    if (!data) {
      return res.status(404).json({
        success: false,
        message: "No Plumbing Head Loss data found for this project",
      });
    }

    res.status(200).json({
      success: true,
      data,
    });
  } catch (err) {
    console.error("Error fetching Plumbing Head Loss:", err);
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

// import CondenserCalculation from "../models/condenserModel.js";

// // Save condenser calculation data
// export const saveCondenserData = async (req, res) => {
//   try {
//     const { project_id, input_data, result_data } = req.body;

//     if (!project_id || !input_data) {
//       return res.status(400).json({
//         success: false,
//         message: "Missing required fields: project_id, input_data",
//       });
//     }

//     // Check if data already exists for this project
//     const existingData = await CondenserCalculation.findOne({
//       project_id,
//     });

//     if (existingData) {
//       return res.status(400).json({
//         success: false,
//         message: "Condenser calculation data already exists for this project. Use update instead.",
//       });
//     }

//     // Create new condenser calculation document
//     const condenserData = new CondenserCalculation({
//       project_id,
//       chillerTonnage: input_data.chillerTonnage,
//       flowRateLps: input_data.flowRateLps,
//       pipeInnerDiameterMm: input_data.pipeInnerDiameterMm,
//       mode: input_data.mode,
//       fluidType: input_data.fluidType,
//       temperatureC: input_data.temperatureC,
//       systemType: input_data.systemType,
//       totalEquivalentLength: result_data?.totalEquivalentLength,
//       headLoss: result_data?.headLoss,
//       message: result_data?.message,
//     });

//     const savedData = await condenserData.save();

//     res.status(201).json({
//       success: true,
//       message: "Condenser calculation data saved successfully",
//       data: savedData,
//     });
//   } catch (error) {
//     console.error("Error saving condenser calculation data:", error);
//     res.status(500).json({
//       success: false,
//       message: "Error saving condenser calculation data",
//       error: error.message,
//     });
//   }
// };

// // Get condenser calculation data by project_id (for autofill)
// export const getCondenserData = async (req, res) => {
//   try {
//     const { project_id } = req.params;

//     if (!project_id) {
//       return res.status(400).json({
//         success: false,
//         message: "Missing required parameter: project_id",
//       });
//     }

//     const condenserData = await CondenserCalculation.findOne({
//       project_id,
//     });

//     if (!condenserData) {
//       return res.status(404).json({
//         success: false,
//         message: "Condenser calculation data not found for this project",
//       });
//     }

//     res.status(200).json({
//       success: true,
//       message: "Condenser calculation data retrieved successfully",
//       data: condenserData,
//     });
//   } catch (error) {
//     console.error("Error retrieving condenser calculation data:", error);
//     res.status(500).json({
//       success: false,
//       message: "Error retrieving condenser calculation data",
//       error: error.message,
//     });
//   }
// };

// // Update condenser calculation data
// export const updateCondenserData = async (req, res) => {
//   try {
//     const { project_id } = req.params;
//     const { input_data, result_data } = req.body;

//     if (!project_id || !input_data) {
//       return res.status(400).json({
//         success: false,
//         message: "Missing required fields: project_id, input_data",
//       });
//     }

//     // Check if data exists
//     const existingData = await CondenserCalculation.findOne({
//       project_id,
//     });

//     if (!existingData) {
//       return res.status(404).json({
//         success: false,
//         message: "Condenser calculation data not found for this project",
//       });
//     }

//     // Update the document
//     const updatedData = await CondenserCalculation.findOneAndUpdate(
//       {
//         project_id,
//       },
//       {
//         chillerTonnage: input_data.chillerTonnage,
//         flowRateLps: input_data.flowRateLps,
//         pipeInnerDiameterMm: input_data.pipeInnerDiameterMm,
//         mode: input_data.mode,
//         fluidType: input_data.fluidType,
//         temperatureC: input_data.temperatureC,
//         systemType: input_data.systemType,
//         totalEquivalentLength: result_data?.totalEquivalentLength,
//         headLoss: result_data?.headLoss,
//         message: result_data?.message,
//       },
//       {
//         new: true,
//         runValidators: true,
//       }
//     );

//     res.status(200).json({
//       success: true,
//       message: "Condenser calculation data updated successfully",
//       data: updatedData,
//     });
//   } catch (error) {
//     console.error("Error updating condenser calculation data:", error);
//     res.status(500).json({
//       success: false,
//       message: "Error updating condenser calculation data",
//       error: error.message,
//     });
//   }
// };

import CondenserCalculation from "../models/condenserModel.js";
import { calculateCondenserPressureDrop } from "../utils/condenserPressureDrop.js";

// ✅ Save condenser pressure drop data
export const saveCondenserData = async (req, res) => {
  try {
    const { project_id, room, input_data, result_data } = req.body;

    if (!project_id || !input_data) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields: project_id, input_data",
      });
    }

    // ✅ Check if data already exists (project-level or project+room)
    const query = room ? { project_id, room } : { project_id };
    const existingData = await CondenserCalculation.findOne(query);

    if (existingData) {
      return res.status(400).json({
        success: false,
        message:
          "Condenser pressure drop data already exists for this project. Use update instead.",
      });
    }

    // ✅ Calculate result data if not provided
    let finalResultData = result_data;
    if (!finalResultData) {
      try {
        finalResultData = calculateCondenserPressureDrop(
          input_data,
          input_data.mode || "data"
        );
      } catch (err) {
        return res.status(400).json({
          success: false,
          message: "Error calculating condenser pressure drop result data",
          error: err.message,
        });
      }
    }

    // ✅ Create and save condenser document
    const condenserData = new CondenserCalculation({
      project_id,
      ...(room && { room }), // ✅ Only add room if provided
      mode: input_data.mode || "data",
      input_data,
      result_data: finalResultData,
    });

    const savedData = await condenserData.save();

    res.status(201).json({
      success: true,
      message: "Condenser pressure drop data saved successfully",
      data: savedData,
    });
  } catch (error) {
    console.error("Error saving condenser pressure drop data:", error);
    res.status(500).json({
      success: false,
      message: "Error saving condenser pressure drop data",
      error: error.message,
    });
  }
};

// ✅ Get condenser pressure drop data (project-level or project+room)
export const getCondenserData = async (req, res) => {
  try {
    const { project_id, room } = req.params;

    if (!project_id) {
      return res.status(400).json({
        success: false,
        message: "Missing required parameter: project_id",
      });
    }

    const query = room ? { project_id, room } : { project_id };
    const condenserData = await CondenserCalculation.findOne(query);

    if (!condenserData) {
      return res.status(404).json({
        success: false,
        message: "Condenser pressure drop data not found for this project",
      });
    }

    res.status(200).json({
      success: true,
      message: "Condenser pressure drop data retrieved successfully",
      data: condenserData,
    });
  } catch (error) {
    console.error("Error retrieving condenser pressure drop data:", error);
    res.status(500).json({
      success: false,
      message: "Error retrieving condenser pressure drop data",
      error: error.message,
    });
  }
};

// ✅ Update condenser pressure drop data (project-level or project+room)
export const updateCondenserData = async (req, res) => {
  try {
    const { project_id, room } = req.params;
    const { input_data, result_data } = req.body;

    if (!project_id || !input_data) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields: project_id, input_data",
      });
    }

    const query = room ? { project_id, room } : { project_id };
    const existingData = await CondenserCalculation.findOne(query);

    if (!existingData) {
      return res.status(404).json({
        success: false,
        message: "Condenser pressure drop data not found for this project",
      });
    }

    // ✅ Calculate result data if not provided
    let finalResultData = result_data;
    if (!finalResultData) {
      try {
        finalResultData = calculateCondenserPressureDrop(
          input_data,
          input_data.mode || "data"
        );
      } catch (err) {
        return res.status(400).json({
          success: false,
          message: "Error calculating condenser pressure drop result data",
          error: err.message,
        });
      }
    }

    // ✅ Update the document
    const updatedData = await CondenserCalculation.findOneAndUpdate(
      query,
      {
        mode: input_data.mode || "data",
        input_data,
        result_data: finalResultData,
      },
      { new: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      message: "Condenser pressure drop data updated successfully",
      data: updatedData,
    });
  } catch (error) {
    console.error("Error updating condenser pressure drop data:", error);
    res.status(500).json({
      success: false,
      message: "Error updating condenser pressure drop data",
      error: error.message,
    });
  }
};

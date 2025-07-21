import PlumbingPump from "../models/plumbingPumpModel.js";

// ✅ CALCULATE & SAVE PLUMBING PUMP DATA
export const calculateAndSavePlumbingPump = async (req, res) => {
  try {
    const { project_id, pumps } = req.body;

    if (!Array.isArray(pumps) || pumps.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid input data: 'pumps' array is required",
      });
    }

    const calculatedData = pumps.map((pump) => {
      const {
        flowrate_lpm,
        total_head,
        pipe_material,
        friction_loss_coefficient,
        pipe_dia,
        efficiency,
      } = pump;

      if (!flowrate_lpm || !total_head || !efficiency) {
        throw new Error(
          "Missing required fields: flowrate_lpm, total_head, efficiency"
        );
      }

      // ✅ Calculation (New Formula)
      const SG = 1;
      const eta = efficiency / 100;
      const pump_capacity_hp = (flowrate_lpm * total_head * SG) / (3960 * eta); // Flowrate in GPM
      const pump_capacity_kw = pump_capacity_hp * 0.746;

      return {
        flowrate_lpm,
        total_head,
        pipe_material,
        friction_loss_coefficient,
        pipe_dia,
        efficiency,
        pump_capacity_hp: Number(pump_capacity_hp.toFixed(2)),
        pump_capacity_kw: Number(pump_capacity_kw.toFixed(2)),
      };
    });

    // ✅ Save or Update in DB (Upsert by project_id)
    const savedData = await PlumbingPump.findOneAndUpdate(
      { project_id },
      { project_id, pumps: calculatedData },
      { upsert: true, new: true }
    );

    return res.status(200).json({
      success: true,
      message: "Plumbing pump calculation successful",
      data: savedData,
    });
  } catch (error) {
    console.error("Error in calculateAndSavePlumbingPump:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Something went wrong",
    });
  }
};

// ✅ GET STORED Plumbing PUMP DATA BY PROJECT ID
export const getPlumbingPumpByProject = async (req, res) => {
  try {
    const { project_id } = req.params;

    if (!project_id) {
      return res.status(400).json({
        success: false,
        message: "Project ID is required",
      });
    }

    const plumbingPumpData = await PlumbingPump.findOne({ project_id });

    if (!plumbingPumpData) {
      return res.status(404).json({
        success: false,
        message: "No plumbing pump data found for this project",
      });
    }

    return res.status(200).json({
      success: true,
      data: plumbingPumpData,
    });
  } catch (error) {
    console.error("Error in getplumbingPumpByProject:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Something went wrong",
    });
  }
};

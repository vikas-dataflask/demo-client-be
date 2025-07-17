import mongoose from "mongoose";

const fireHeadLossSchema = new mongoose.Schema(
  {
    project_id: {
      type: mongoose.Schema.Types.ObjectId, // Or String if your project_id is not an ObjectId
      required: true,
      ref: "Project",
    },
    input_data: {
      pipeDia: Number,
      pipeMaterial: String,
      pipeLengthHorizontal: Number,
      pipeLengthVertical: Number,
      fittings: {
        SE90: Number,
        SE45: Number,
        WE90: Number,
        GV: Number,
        NRV: Number,
        BFV: Number,
        GLV: Number,
        OTHER: Number,
      },
      frictionalLossCoefficient: Number,
      flowrateLpm: Number,
      staticLossMeter: Number,
      staticGainMeter: Number,
      velocity: Number,
      heightOfFitting: Number,
    },
    result_data: {
      K_total: String,
      H_friction: String,
      H_fitting: String,
      H_elevation: String,
      H_static: String,
      H_total: String,
      totalPressureLossBar: String,
    },
  },
  { timestamps: true }
);

export default mongoose.model("FireHeadLoss", fireHeadLossSchema);

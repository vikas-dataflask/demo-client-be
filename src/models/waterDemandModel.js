import mongoose from "mongoose";

const waterDemandSchema = new mongoose.Schema(
  {
    projectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Project", // assuming you have a Project collection
      required: true,
    },
    buildingType: {
      type: String,
      required: true,
    },
    inputs: {
      type: Map, // stores key-value pairs (e.g., passengers, floorArea)
      of: Number,
      required: true,
    },
    result: {
      breakdown: {
        type: Map, // stores key-value pairs (e.g., Occupancy: 1200)
        of: Number,
        default: {},
      },
      totalDemand: {
        type: Number,
        required: true,
      },
    },
  },
  { timestamps: true }
);

const WaterDemand = mongoose.model("WaterDemand", waterDemandSchema);
export default WaterDemand;

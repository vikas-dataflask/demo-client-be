import mongoose from "mongoose";

const rainwaterDropSchema = new mongoose.Schema(
  {
    project_id: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "Project",
    },
    // Store all user inputs
    input_data: {
      roofAreaM2: { type: Number, default: 0 },
      rainfallIntensityMmHr: { type: Number, default: 0 },
      preferredPipeSize: { type: Number, default: null },
      coefficientDischarge: { type: Number, default: 0.9 },
    },
    // Store calculation results
    result_data: {
      dischargeLps: { type: Number, default: 0 },
      dischargeM3Hr: { type: Number, default: 0 },
      dischargeLpm: { type: Number, default: 0 },
      recommendedPipeSize: { type: Number, default: 0 },
      numberOfPipes: { type: Number, default: 1 },
      theoreticalDiameterMm: { type: Number, default: 0 },
      closestStandardPipeSize: { type: Number, default: 0 },
      closestStandardCapacity: { type: Number, default: 0 },
      preferredPipeValidation: { type: Object, default: null },
      calculationMethod: { type: String, default: "British Standard BS EN 12056-3:2000" },
      warning: { type: String, default: null },
    },
  },
  { timestamps: true }
);

const RainwaterDrop = mongoose.model("RainwaterDrop", rainwaterDropSchema);

export default RainwaterDrop; 
import mongoose from "mongoose";

const areaSchema = new mongoose.Schema({
  type: { type: String, required: true },
  label: { type: String, required: true },
  area: { type: Number, required: true },
  coefficient: { type: Number, required: true },
});

const rwhSchema = new mongoose.Schema(
  {
    project_id: { type: String, required: true }, // for autofill

    // Input Data
    input_data: {
      catchmentAreaM2: { type: Number, required: true },
      annualRainfallMm: { type: Number, required: true },
      runoffCoefficient: { type: Number, required: true },
      pitVolumeM3: { type: Number, required: true },
      areas: [areaSchema],
    },

    // Result Data
    result_data: {
      totalCatchmentAreaM2: { type: Number, required: true },
      annualRainfallMm: { type: Number, required: true },
      weightedRunoffCoefficient: { type: Number, required: true },
      recommendedPitSizeM3: { type: Number, required: true },
      totalAnnualHarvestL: { type: Number, required: true },
      pitCount: { type: Number, required: true },
      areas: [areaSchema],
    },

    // Calculation metadata
    calculationDate: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

const RWH = mongoose.model("RWH", rwhSchema);

export default RWH;

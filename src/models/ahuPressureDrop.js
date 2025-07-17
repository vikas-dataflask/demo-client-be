// models/AhuPressureDrop.js
import mongoose from "mongoose";

const FittingSchema = new mongoose.Schema({
  type: { type: String, required: true },
  quantity: { type: Number, required: true },
  kValue: { type: Number, required: true },
});

const AhuPressureDropSchema = new mongoose.Schema({
  project_id: {
    type: String,
    required: true,
  },
  room: {
    type: String,
    required: true,
  },

  // Input Parameters
  airflow: { type: Number, required: true }, // CFM
  velocity: { type: Number }, // m/s
  ductShape: { type: String, enum: ["round", "rectangular"] },

  // Round duct
  ductDiameter: { type: Number },

  // Rectangular duct
  ductWidth: { type: Number },
  ductHeight: { type: Number },

  coilPressureDrop: { type: Number, required: true }, // Pa
  filterPressureDrop: { type: Number, required: true }, // Pa
  additionalLosses: { type: Number }, // Pa

  fittingVelocity: { type: Number }, // m/s
  airDensity: { type: Number },

  selectedFittings: [{ type: String }], // Array of fitting names as strings
  selectedFittingsQuantities: { type: Map, of: Number }, // Map of fitting name to quantity

  fittingLosses: { type: Number, default: 0 },

  // Output Data
  totalPressureDrop: { type: Number }, // Pa

  breakdown: {
    coilDrop: { type: Number },
    filterDrop: { type: Number },
    fittingLosses: { type: Number },
    additionalLosses: { type: Number },
  },

  fittingBreakdown: [
    {
      type: { type: String },
      quantity: { type: Number },
      kValue: { type: Number },
      loss: { type: Number }, // Optional individual loss per fitting
    },
  ],

  calculationSummary: {
    totalComponents: { type: Number },
    formula: { type: String },
  },

  inputSummary: {
    coilDrop: { type: Number },
    filterDrop: { type: Number },
    totalFittings: { type: Number },
    additionalLosses: { type: Number },
  },

  timestamp: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.model("AhuPressureDrop", AhuPressureDropSchema);

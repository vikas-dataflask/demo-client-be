// models/DuctSizing.js
import mongoose from "mongoose";

const rectangularSchema = new mongoose.Schema(
  {
    width_mm: { type: Number, required: true },
    height_mm: { type: Number, required: true },
    aspectRatio: { type: Number, required: true },
  },
  { _id: false }
);

const inputSummarySchema = new mongoose.Schema(
  {
    airflowCFM: { type: Number, required: true },
    velocity: { type: Number, required: true },
    shape: { type: String, enum: ["round", "rectangular"], required: true },
    aspectRatio: { type: Number }, // optional for round
    room: { type: String, required: true },
    heatLoadCapacity: { type: Number, required: true },
  },
  { _id: false }
);

const ductSizingSchema = new mongoose.Schema({
  project_id: {
    type: String,
    required: true,
  },
  room: { type: String, required: true },
  airflowCFM: { type: Number, required: true },
  velocity: { type: Number, required: true },
  area_m2: { type: Number, required: true },
  roundDiameter_mm: { type: Number, default: null },
  rectangular: { type: rectangularSchema, default: null },
  heatLoadCapacity: { type: Number, required: true },
  inputSummary: { type: inputSummarySchema, required: true },
  timestamp: { type: Date, default: Date.now },
});

export default mongoose.model("DuctSizing", ductSizingSchema);

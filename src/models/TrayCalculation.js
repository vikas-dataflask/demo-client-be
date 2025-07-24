import mongoose from "mongoose";

const cableSchema = new mongoose.Schema(
  {
    size: { type: String, required: true },
    quantity: { type: Number, required: true },
    od: { type: Number }, // optional, will be saved after calculation
    areaPerCable: { type: Number },
    totalAreaForSize: { type: Number },
  },
  { _id: false }
);

const trayCalculationSchema = new mongoose.Schema({
  projectId: { type: String, required: true }, // or ObjectId if linked to projects collection
  trayType: { type: String, required: true },
  fillFactor: { type: Number, required: true }, // store in fraction (0.4 = 40%)
  totalCableCount: { type: Number },
  totalCableArea: { type: Number },
  requiredTrayArea: { type: Number },
  recommendedTraySize: { type: String },
  actualFillPercentage: { type: Number },
  trayArea: { type: Number },
  success: { type: Boolean, default: true },
  warning: { type: String },
  largestStandardTray: { type: String },
  cableList: [cableSchema], // input + calculated cable details
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

trayCalculationSchema.pre("save", function (next) {
  this.updatedAt = Date.now();
  next();
});

const TrayCalculation = mongoose.model(
  "TrayCalculation",
  trayCalculationSchema
);

export default TrayCalculation;

import mongoose from "mongoose";

const equipmentResultSchema = new mongoose.Schema({
  equipmentType: { type: String, required: true },
  mdFactor: { type: Number },
  mdLoadKw: { type: Number },
  mdLoadKva: { type: Number },
  kvar: { type: Number },
  fullLoadCurrent: { type: Number },
  designCurrent: { type: Number },
});

const breakerSizingSchema = new mongoose.Schema(
  {
    projectId: { type: String, required: true }, // If project-based
    panel: { type: String, required: true },
    equipment: { type: String, required: true },
    connectedLoad: { type: Number, required: true },
    systemVoltage: { type: Number, required: true },
    powerFactor: { type: Number, required: true },
    loadFactor: { type: Number, required: true },
    demandFactor: { type: Number, required: true },
    spareCapacity: { type: Number, required: true },
    breakerSelection: { type: Number },

    // Equipment Results Array
    equipmentResults: [equipmentResultSchema],

    // Total Design Current
    totalDesignCurrent: { type: Number },

    // Results
    mdFactor: { type: Number },
    mdLoadKw: { type: Number },
    mdLoadKva: { type: Number },
    kvar: { type: Number },
    fullLoadCurrent: { type: Number },
    designCurrent: { type: Number },
  },
  { timestamps: true }
);

const BreakerSizing = mongoose.model("BreakerSizing", breakerSizingSchema);
export default BreakerSizing;

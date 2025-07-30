// models/AhuPressureDrop.js
import mongoose from "mongoose";

const AhuPressureDropSchema = new mongoose.Schema({
  project_id: {
    type: String,
    required: true,
  },

  // Multiple equipment data
  equipmentList: [{
    // Input Parameters
    flowrate: { type: Number, required: true }, // m^3/s
    width: { type: Number, default: 0 }, // m (optional)
    height: { type: Number, default: 0 }, // m (optional)
    diameter: { type: Number, default: 0 }, // m (optional)
    length: { type: Number, default: 0 }, // m (optional)
    coefficientOfFitting: { type: Number, default: 0.09 }, // user input (optional, default 0.09)
    equipmentName: { type: String, default: "" }, // equipment name for logic determination

    // Calculated Results
    isDuctOrPlenum: { type: Boolean, default: false },
    area: { type: Number },
    velocity: { type: Number },
    hydraulicDiameter: { type: Number },
    rectangularDucts: { type: Number },
    le: { type: Number },
    reynoldsNumber: { type: Number },
    velocityPressure: { type: Number },
    frictionFactor: { type: Number },
    lambda: { type: Number },
    frictionPressureLoss: { type: Number },
    fittingPressureLoss: { type: Number },
    totalPressureLoss: { type: Number },

    // Physical constants used
    density: { type: Number, default: 1.2 },
    kinematicViscosity: { type: Number, default: 0.000015 },
  }],

  // Total system results
  totalSystemPressureLoss: { type: Number },
  equipmentCount: { type: Number },
  successfulCalculations: { type: Number },
  failedCalculations: { type: Number },

  timestamp: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.model("AhuPressureDrop", AhuPressureDropSchema);

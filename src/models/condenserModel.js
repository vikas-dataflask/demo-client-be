// import mongoose from "mongoose";

// const CondenserCalculationSchema = new mongoose.Schema(
//   {
//     project_id: {
//       type: String,
//       required: true,
//     },

//     // Inputs
//     chillerTonnage: { type: Number, required: true },
//     flowRateLps: { type: Number, required: true },
//     pipeInnerDiameterMm: { type: Number, required: true },
//     mode: { type: String, enum: ["data", "theoretical"], required: true },
//     fluidType: { type: String, required: true },
//     temperatureC: { type: Number, required: true },
//     systemType: { type: String, required: true },

//     // Outputs
//     totalEquivalentLength: { type: String }, // as received in response
//     headLoss: { type: String },
//     message: { type: String },

//     // Meta
//     timestamp: { type: Date, default: Date.now },
//   },
//   { timestamps: true }
// );

// export default mongoose.model(
//   "CondenserCalculation",
//   CondenserCalculationSchema
// );

import mongoose from "mongoose";

const CondenserCalculationSchema = new mongoose.Schema(
  {
    project_id: {
      type: String,
      required: true,
    },
    room: {
      type: String,
      required: false, // optional, add if you want to store per room
    },

    mode: {
      type: String,
      enum: ["data", "theoretical"],
      required: true,
    },

    input_data: {
      chillerTonnage: Number,
      flowRateLps: Number,
      systemType: String,

      // Theoretical mode fields
      pipeInnerDiameterMm: Number,
      fluidType: String,
      temperatureC: Number,
      fluidProperties: {
        density: Number,
        viscosity: Number,
      },

      // Loss fields
      systemLoss: Number, // Pa
      pipeFrictionLoss: Number, // Pa
      coolingTowerLoss: Number, // ✅ NEW (extra field)
      fittingLossPa: Number, // Pa

      // Fitting details (per systemType)
      fittings: {
        type: Map,
        of: mongoose.Schema.Types.Mixed,
      },
      fittingVelocity: Number,
      airDensity: Number,
    },

    result_data: {
      estimatedDropKpa: Number,
      flowRateLps: Number,
      chillerTonnage: Number,
      velocity: Number,
      reynoldsNumber: Number,
      frictionFactor: Number,

      // Loss results
      fittingLossPa: Number, // Pa
      totalPressureDropPa: Number, // Pa

      assumptionsUsed: {
        method: String,
        formula: String,
        typicalRange: String,
        notes: String,
      },

      warning: String,

      fittingLosses: {
        type: Map,
        of: {
          totalFittingLoss: Number,
          totalKValue: Number,
          velocity: Number,
          airDensity: Number,
          fittings: [
            {
              type: String,
              quantity: Number,
              kValue: Number,
            },
          ],
        },
      },

      units: {
        pressureDrop: String,
        flowRate: String,
        tonnage: String,
      },
    },
  },
  { timestamps: true }
);

export default mongoose.model(
  "CondenserCalculation",
  CondenserCalculationSchema
);

import mongoose from "mongoose";

const ChillerPressureDropSchema = new mongoose.Schema(
  {
    project_id: {
      type: String,
      required: true,
    },
    room: {
      type: String,
      required: true,
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

      // For theoretical mode
      pipeInnerDiameterMm: Number,
      fluidType: String,
      temperatureC: Number,
      fluidProperties: {
        density: Number,
        viscosity: Number,
      },

      // New fields for losses
      systemLoss: Number, // Pa
      pipeFrictionLoss: Number, // Pa
      fittingLossPa: Number, // Pa (sum of all fitting losses)

      // Fitting details (can vary by systemType)
      fittings: {
        type: Map,
        of: mongoose.Schema.Types.Mixed, // Allows storing objects with selectedFittings and selectedFittingsQuantities
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

      // New fields for losses
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

export default mongoose.model("ChillerPressureDrop", ChillerPressureDropSchema);

import mongoose from "mongoose";

const HeatLoadSchema = new mongoose.Schema(
  {
    project_id: {
      type: String,
      required: true,
    },
    input_data: {
      room: String,
      area: Number,
      height: Number,
      occupancy: Number,
      lightLoad: Number,
      heatDissipation: Number,
      cfmSqft: Number,
      cfmPerson: Number,
      sensibleHeat: Number,
      latentHeat: Number,
      safetyFactor: { type: Number, default: 1.15 },
    },
    result_data: {
      temperature_difference: {
        summer: {
          db_diff: Number,
          rh_diff: Number,
          gr_lb_diff: Number,
        },
        monsoon: {
          db_diff: Number,
          rh_diff: Number,
          gr_lb_diff: Number,
        },
      },
      sensible_heat: {
        internal_heat: {
          people: Number,
          light: Number,
          equipment: Number,
          subtotal: Number,
          safety_factor: Number,
          room_sensible_heat: Number,
        },
      },
      latent_heat: {
        total_latent_heat_summer: Number,
        total_latent_heat_monsoon: Number,
      },
      total_heat: {
        total_heat_summer: Number,
        total_heat_monsoon: Number,
      },
      grand_total: {
        subtotal1: Number,
        subtotal2: Number,
        room_latent_heat1: Number,
        room_latent_heat2: Number,
      },
    },
  },
  { timestamps: true }
);

export default mongoose.model("HeatLoad", HeatLoadSchema);

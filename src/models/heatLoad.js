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
      summer: {
        sensible_heat: Number,
        latent_heat: Number,
        internal_heat: Number,
        heatload_total: Number,
        heatload_with_safety_factor: Number,
        calculations: {
          total_cfm: Number,
          dry_bulb_diff: Number,
          grains_lb_diff: Number,
          latent_heat_of_people: Number,
          heat_of_equipment: Number,
          heat_of_light: Number,
        },
      },
      monsoon: {
        sensible_heat: Number,
        latent_heat: Number,
        internal_heat: Number,
        heatload_total: Number,
        heatload_with_safety_factor: Number,
        calculations: {
          total_cfm: Number,
          dry_bulb_diff: Number,
          grains_lb_diff: Number,
          latent_heat_of_people: Number,
          heat_of_equipment: Number,
          heat_of_light: Number,
        },
      },
      constants: {
        specific_heat_of_air: Number,
        density_of_air: Number,
        latent_heat_factor: Number,
        safety_factor: Number,
      },
    },
  },
  { timestamps: true }
);

export default mongoose.model("HeatLoad", HeatLoadSchema);

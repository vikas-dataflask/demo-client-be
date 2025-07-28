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
      sensibleHeatOfPeople: Number,
      lightLoad: Number,
      heatDissipation: Number,
      cfmSqft: Number,
      cfmPerson: Number,
      sensibleHeat: Number,
      latentHeat: Number,
      internalHeat: Number,
      roomLatentHeat: Number,
      safetyFactor: { type: Number, default: 1.15 },
      // Add sun gain components
      sunGainComponents: [{
        name: String,
        summerSunGain: Number,
        monsoonSunGain: Number,
        area: Number,
        partGlassArea: Number,
        cfm: Number,
      }],
    },
    result_data: {
      summer: {
        sensible_heat: Number,
        latent_heat: Number,
        internal_heat: Number,
        room_latent_heat: Number,
        sun_gain_heat: Number, // Add sun gain heat
        heatload_total: Number,
        heatload_with_safety_factor: Number,
        calculations: {
          total_cfm: Number,
          dry_bulb_diff: Number,
          grains_lb_diff: Number,
          sensible_heat_of_people: Number,
          heat_of_equipment: Number,
          heat_of_light: Number,
          outside_air: Number,
          rlh_people: Number,
        },
      },
      monsoon: {
        sensible_heat: Number,
        latent_heat: Number,
        internal_heat: Number,
        room_latent_heat: Number,
        sun_gain_heat: Number, // Add sun gain heat
        heatload_total: Number,
        heatload_with_safety_factor: Number,
        calculations: {
          total_cfm: Number,
          dry_bulb_diff: Number,
          grains_lb_diff: Number,
          sensible_heat_of_people: Number,
          heat_of_equipment: Number,
          heat_of_light: Number,
          outside_air: Number,
          rlh_people: Number,
        },
      },
      // Add sun gain results
      sun_gain: {
        total_summer_sun_gain: Number,
        total_monsoon_sun_gain: Number,
        component_results: [{
          name: String,
          summerSunGain: Number,
          monsoonSunGain: Number,
          constant: Number,
          calculationType: String,
          input: {
            summerSunGain: Number,
            monsoonSunGain: Number,
            area: Number,
            partGlassArea: Number,
            cfm: Number,
          },
        }],
        constants: {
          glassConstant: Number,
          wallConstant: Number,
          partGlassConstant: Number,
          partWallConstant: Number,
          ceilingConstant: Number,
          floorConstant: Number,
          infiltrationConstant: Number,
          outsideAirConstant: Number,
          outsideAirDensityConstant: Number,
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

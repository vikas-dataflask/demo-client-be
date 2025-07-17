export const calculateHeatLoad = ({
  summer,
  monsoon,
  area,
  height,
  people,
  light,
  equipment,
  cfm_sqft,
  cfm_person,
  sensible_heat_people,
  latent_heat_people,
  internal_heat,
}) => {
  // Constants
  const SPECIFIC_HEAT_OF_AIR = 1.005; // kJ/kg·K
  const DENSITY_OF_AIR = 1.225; // kg/m³
  const LATENT_HEAT_FACTOR = 0.68; // for moisture removal
  const SAFETY_FACTOR = 1.15;

  // Calculate TOTAL CFM
  const TOTAL_CFM = (area * cfm_sqft) + (people * cfm_person);

  // Calculate for Summer Conditions
  const summer_outside_db = summer.outside_db;
  const summer_room_db = summer.room_db;
  const summer_dry_bulb_diff = summer_outside_db - summer_room_db;
  const summer_outside_gr_lb = summer.outside_gr_lb;
  const summer_room_gr_lb = summer.room_gr_lb;
  const summer_grains_lb_diff = summer_outside_gr_lb - summer_room_gr_lb;

  // Summer Sensible Heat
  const summer_sensible_heat = (SPECIFIC_HEAT_OF_AIR * DENSITY_OF_AIR * TOTAL_CFM * summer_dry_bulb_diff) / 1000;

  // Summer Latent Heat
  const summer_latent_heat = (LATENT_HEAT_FACTOR * TOTAL_CFM * summer_grains_lb_diff) / 1000;

  // Summer Internal Gains
  const summer_latent_heat_of_people = people * (summer_sensible_heat + summer_latent_heat);
  const summer_heat_of_equipment = equipment;
  const summer_heat_of_light = light;
  const summer_internal_gains = summer_latent_heat_of_people + summer_heat_of_equipment + summer_heat_of_light;

  // Summer HeatLoad Total
  const summer_heatload_total = summer_sensible_heat + summer_latent_heat + summer_internal_gains;

  // Summer HeatLoad with Safety Factor
  const summer_heatload_with_safety_factor = summer_heatload_total * SAFETY_FACTOR;

  // Calculate for Monsoon Conditions
  const monsoon_outside_db = monsoon.outside_db;
  const monsoon_room_db = monsoon.room_db;
  const monsoon_dry_bulb_diff = monsoon_outside_db - monsoon_room_db;
  const monsoon_outside_gr_lb = monsoon.outside_gr_lb;
  const monsoon_room_gr_lb = monsoon.room_gr_lb;
  const monsoon_grains_lb_diff = monsoon_outside_gr_lb - monsoon_room_gr_lb;

  // Monsoon Sensible Heat
  const monsoon_sensible_heat = (SPECIFIC_HEAT_OF_AIR * DENSITY_OF_AIR * TOTAL_CFM * monsoon_dry_bulb_diff) / 1000;

  // Monsoon Latent Heat
  const monsoon_latent_heat = (LATENT_HEAT_FACTOR * TOTAL_CFM * monsoon_grains_lb_diff) / 1000;

  // Monsoon Internal Gains
  const monsoon_latent_heat_of_people = people * (monsoon_sensible_heat + monsoon_latent_heat);
  const monsoon_heat_of_equipment = equipment;
  const monsoon_heat_of_light = light;
  const monsoon_internal_gains = monsoon_latent_heat_of_people + monsoon_heat_of_equipment + monsoon_heat_of_light;

  // Monsoon HeatLoad Total
  const monsoon_heatload_total = monsoon_sensible_heat + monsoon_latent_heat + monsoon_internal_gains;

  // Monsoon HeatLoad with Safety Factor
  const monsoon_heatload_with_safety_factor = monsoon_heatload_total * SAFETY_FACTOR;

  return {
    summer: {
      sensible_heat: parseFloat(summer_sensible_heat.toFixed(2)),
      latent_heat: parseFloat(summer_latent_heat.toFixed(2)),
      internal_heat: parseFloat(summer_internal_gains.toFixed(2)),
      heatload_total: parseFloat(summer_heatload_total.toFixed(2)),
      heatload_with_safety_factor: parseFloat(summer_heatload_with_safety_factor.toFixed(2)),
      calculations: {
        total_cfm: parseFloat(TOTAL_CFM.toFixed(2)),
        dry_bulb_diff: parseFloat(summer_dry_bulb_diff.toFixed(2)),
        grains_lb_diff: parseFloat(summer_grains_lb_diff.toFixed(2)),
        latent_heat_of_people: parseFloat(summer_latent_heat_of_people.toFixed(2)),
        heat_of_equipment: parseFloat(summer_heat_of_equipment.toFixed(2)),
        heat_of_light: parseFloat(summer_heat_of_light.toFixed(2)),
      }
    },
    monsoon: {
      sensible_heat: parseFloat(monsoon_sensible_heat.toFixed(2)),
      latent_heat: parseFloat(monsoon_latent_heat.toFixed(2)),
      internal_heat: parseFloat(monsoon_internal_gains.toFixed(2)),
      heatload_total: parseFloat(monsoon_heatload_total.toFixed(2)),
      heatload_with_safety_factor: parseFloat(monsoon_heatload_with_safety_factor.toFixed(2)),
      calculations: {
        total_cfm: parseFloat(TOTAL_CFM.toFixed(2)),
        dry_bulb_diff: parseFloat(monsoon_dry_bulb_diff.toFixed(2)),
        grains_lb_diff: parseFloat(monsoon_grains_lb_diff.toFixed(2)),
        latent_heat_of_people: parseFloat(monsoon_latent_heat_of_people.toFixed(2)),
        heat_of_equipment: parseFloat(monsoon_heat_of_equipment.toFixed(2)),
        heat_of_light: parseFloat(monsoon_heat_of_light.toFixed(2)),
      }
    },
    constants: {
      specific_heat_of_air: SPECIFIC_HEAT_OF_AIR,
      density_of_air: DENSITY_OF_AIR,
      latent_heat_factor: LATENT_HEAT_FACTOR,
      safety_factor: SAFETY_FACTOR
    }
  };
};

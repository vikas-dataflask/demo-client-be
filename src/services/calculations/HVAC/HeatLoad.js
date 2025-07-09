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
}) => {
  // PART-1: Outside & Inside Temperature Difference
  const summer_diff_db = summer.outside_db - summer.room_db;
  const summer_diff_rh = summer.outside_rh - summer.room_rh;
  const summer_diff_gr_lb = summer.outside_gr_lb - summer.room_gr_lb;

  const monsoon_diff_db = monsoon.outside_db - monsoon.room_db;
  const monsoon_diff_rh = monsoon.outside_rh - monsoon.room_rh;
  const monsoon_diff_gr_lb = monsoon.outside_gr_lb - monsoon.room_gr_lb;

  // PART-3: Internal Sensible Heat Load
  const internal_heat_people = people * 245;
  const internal_heat_light = light * 1.25 * 3.41;
  const internal_heat_equipment = equipment * 3.41;
  const subtotal_internal_heat =
    internal_heat_people + internal_heat_light + internal_heat_equipment;

  const safety_factor_internal_heat = subtotal_internal_heat * 0.05;
  const room_sensible_heat =
    subtotal_internal_heat + safety_factor_internal_heat;

  // PART-4: Latent Heat Calculation
  const latent_heat = people * latent_heat_people;
  const outside_heat_summer =
    (people * cfm_person + area * cfm_sqft) * summer_diff_gr_lb * 0.12 * 0.68;
  const outside_heat_monsoon =
    (people * cfm_person + area * cfm_sqft) * monsoon_diff_gr_lb * 0.12 * 0.68;

  const total_latent_heat_summer = latent_heat + outside_heat_summer;
  const total_latent_heat_monsoon = latent_heat + outside_heat_monsoon;

  // PART-5: Room Total Heat
  const room_total_sensible_summer =
    (people * cfm_person + area * cfm_sqft) * summer_diff_db * 0.9 * 1.08;
  const room_total_sensible_monsoon =
    (people * cfm_person + area * cfm_sqft) * monsoon_diff_db * 0.9 * 1.08;

  const room_total_latent_summer =
    (people * cfm_person + area * cfm_sqft) * summer_diff_gr_lb * 0.88 * 0.68;
  const room_total_latent_monsoon =
    (people * cfm_person + area * cfm_sqft) * monsoon_diff_gr_lb * 0.88 * 0.68;

  const total_heat_summer =
    room_total_sensible_summer + room_total_latent_summer;
  const total_heat_monsoon =
    room_total_sensible_monsoon + room_total_latent_monsoon;

  // PART-6: Grand Total
  const subtotal1 = 38013 + total_latent_heat_summer + total_heat_summer;
  const subtotal2 = 16035 + total_latent_heat_monsoon + total_heat_monsoon;

  const room_latent_heat1 = subtotal1 + subtotal1 * 0.05;
  const room_latent_heat2 = subtotal2 + subtotal2 * 0.05;

  return {
    temperature_difference: {
      summer: {
        db_diff: summer_diff_db,
        rh_diff: summer_diff_rh,
        gr_lb_diff: summer_diff_gr_lb,
      },
      monsoon: {
        db_diff: monsoon_diff_db,
        rh_diff: monsoon_diff_rh,
        gr_lb_diff: monsoon_diff_gr_lb,
      },
    },
    sensible_heat: {
      internal_heat: {
        people: internal_heat_people,
        light: internal_heat_light,
        equipment: internal_heat_equipment,
        subtotal: subtotal_internal_heat,
        safety_factor: safety_factor_internal_heat,
        room_sensible_heat,
      },
    },
    latent_heat: { total_latent_heat_summer, total_latent_heat_monsoon },
    total_heat: { total_heat_summer, total_heat_monsoon },
    grand_total: { subtotal1, subtotal2, room_latent_heat1, room_latent_heat2 },
  };
};

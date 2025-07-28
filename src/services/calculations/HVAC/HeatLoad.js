// Add sun gain calculation function
export const calculateSunGainHeatLoad = ({
  sunGainComponents,
  area,
  summer,
  monsoon,
  cfm_sqft,
  cfm_person,
  people,
}) => {
  // Constants for sun gain calculations
  const GLASS_CONSTANT = 0.56;
  const WALL_CONSTANT = 0.36;
  const PART_GLASS_CONSTANT = 1.13;
  const PART_WALL_CONSTANT = 0.32;
  const CEILING_CONSTANT = 0.38;
  const FLOOR_CONSTANT = 0.46;
  const INFILTRATION_CONSTANT = 1.08;
  const OUTSIDE_AIR_CONSTANT = 0.12;
  const OUTSIDE_AIR_DENSITY_CONSTANT = 1.08;

  let totalSummerSunGain = 0;
  let totalMonsoonSunGain = 0;
  const componentResults = [];

  // Calculate temperature differences
  const summerTempDiff = summer.outside_db - summer.room_db;
  const monsoonTempDiff = monsoon.outside_db - monsoon.room_db;
  
  // Calculate total CFM for outside air calculations
  const TOTAL_CFM = area * cfm_sqft + people * cfm_person;

  // Calculate sun gain for each component
  sunGainComponents.forEach((component, index) => {
    // Determine constant and calculation method based on component name
    const componentName = component.name.toLowerCase();
    let summerSunGain = 0;
    let monsoonSunGain = 0;
    let constant = WALL_CONSTANT; // default
    let calculationType = 'standard';

    if (componentName.includes('part-glass')) {
      // Part-Glass calculation: area * (temp diff - 10) * 1.13
      constant = PART_GLASS_CONSTANT;
      calculationType = 'part-glass';
      const partGlassArea = component.area || area;
      summerSunGain = partGlassArea * (summerTempDiff - 10) * constant;
      monsoonSunGain = partGlassArea * (monsoonTempDiff - 10) * constant;
    } else if (componentName.includes('part-wall')) {
      // Part-Wall calculation: (wall area - glass area) * (temp diff - 10) * 0.32
      constant = PART_WALL_CONSTANT;
      calculationType = 'part-wall';
      const partWallArea = component.area || area;
      const partGlassArea = component.partGlassArea || 0;
      const effectiveWallArea = partWallArea - partGlassArea;
      summerSunGain = effectiveWallArea * (summerTempDiff - 10) * constant;
      monsoonSunGain = effectiveWallArea * (monsoonTempDiff - 10) * constant;
    } else if (componentName.includes('glass') || componentName.includes('window') || componentName.includes('glazing')) {
      // Standard glass calculation
      constant = GLASS_CONSTANT;
      summerSunGain = component.summerSunGain * area * constant;
      monsoonSunGain = component.monsoonSunGain * area * constant;
    } else if (componentName.includes('wall') && !componentName.includes('part-wall')) {
      // Standard wall calculation
      constant = WALL_CONSTANT;
      summerSunGain = component.summerSunGain * area * constant;
      monsoonSunGain = component.monsoonSunGain * area * constant;
      // Part-Glass calculation: area * (temp diff - 10) * 1.13
      constant = PART_GLASS_CONSTANT;
      calculationType = 'part-glass';
      const partGlassArea = component.area || area; // Use component area if provided, otherwise use room area
      summerSunGain = partGlassArea * (summerTempDiff - 10) * constant;
      monsoonSunGain = partGlassArea * (monsoonTempDiff - 10) * constant;
    } else if (componentName.includes('part-wall')) {
      // Part-Wall calculation: (wall area - glass area) * (temp diff - 10) * 0.32
      constant = PART_WALL_CONSTANT;
      calculationType = 'part-wall';
      const partWallArea = component.area || area;
      const partGlassArea = component.partGlassArea || 0;
      const effectiveWallArea = partWallArea - partGlassArea;
      summerSunGain = effectiveWallArea * (summerTempDiff - 10) * constant;
      monsoonSunGain = effectiveWallArea * (monsoonTempDiff - 10) * constant;
    } else if (componentName.includes('ceiling')) {
      // Ceiling calculation: area * (temp diff - 10) * 0.38
      constant = CEILING_CONSTANT;
      calculationType = 'ceiling';
      const ceilingArea = component.area || area;
      summerSunGain = ceilingArea * (summerTempDiff - 10) * constant;
      monsoonSunGain = ceilingArea * (monsoonTempDiff - 10) * constant;
    } else if (componentName.includes('floor')) {
      // Floor calculation: area * (temp diff - 10) * 0.46
      constant = FLOOR_CONSTANT;
      calculationType = 'floor';
      const floorArea = component.area || area;
      summerSunGain = floorArea * (summerTempDiff - 10) * constant;
      monsoonSunGain = floorArea * (monsoonTempDiff - 10) * constant;
    } else if (componentName.includes('infiltration')) {
      // Infiltration calculation: area * temp diff * 1.08
      constant = INFILTRATION_CONSTANT;
      calculationType = 'infiltration';
      const infiltrationArea = component.area || area;
      summerSunGain = infiltrationArea * summerTempDiff * constant;
      monsoonSunGain = infiltrationArea * monsoonTempDiff * constant;
    } else if (componentName.includes('outside air') || componentName.includes('outside-air')) {
      // Outside air calculation: CFM * temp diff * 0.12 * 1.08
      constant = OUTSIDE_AIR_CONSTANT * OUTSIDE_AIR_DENSITY_CONSTANT;
      calculationType = 'outside-air';
      const componentCFM = component.cfm || TOTAL_CFM;
      summerSunGain = componentCFM * summerTempDiff * OUTSIDE_AIR_CONSTANT * OUTSIDE_AIR_DENSITY_CONSTANT;
      monsoonSunGain = componentCFM * monsoonTempDiff * OUTSIDE_AIR_CONSTANT * OUTSIDE_AIR_DENSITY_CONSTANT;
    } else {
      // Default to standard wall calculation
      constant = WALL_CONSTANT;
      summerSunGain = component.summerSunGain * area * constant;
      monsoonSunGain = component.monsoonSunGain * area * constant;
    }

    totalSummerSunGain += summerSunGain;
    totalMonsoonSunGain += monsoonSunGain;

    componentResults.push({
      name: component.name,
      summerSunGain: parseFloat(summerSunGain.toFixed(2)),
      monsoonSunGain: parseFloat(monsoonSunGain.toFixed(2)),
      constant: constant,
      calculationType: calculationType,
      input: {
        summerSunGain: component.summerSunGain,
        monsoonSunGain: component.monsoonSunGain,
        area: component.area,
        partGlassArea: component.partGlassArea,
        cfm: component.cfm,
      },
    });
  });

  return {
    totalSummerSunGain: parseFloat(totalSummerSunGain.toFixed(2)),
    totalMonsoonSunGain: parseFloat(totalMonsoonSunGain.toFixed(2)),
    componentResults,
    constants: {
      glassConstant: GLASS_CONSTANT,
      wallConstant: WALL_CONSTANT,
      partGlassConstant: PART_GLASS_CONSTANT,
      partWallConstant: PART_WALL_CONSTANT,
      ceilingConstant: CEILING_CONSTANT,
      floorConstant: FLOOR_CONSTANT,
      infiltrationConstant: INFILTRATION_CONSTANT,
      outsideAirConstant: OUTSIDE_AIR_CONSTANT,
      outsideAirDensityConstant: OUTSIDE_AIR_DENSITY_CONSTANT,
    },
  };
};

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
  sunGainComponents = [], // Add sun gain components parameter
}) => {
  // Constants
  const SPECIFIC_HEAT_OF_AIR = 0.9; // kJ/kg·K
  const DENSITY_OF_AIR = 1.08; // kg/m³
  const LATENT_HEAT_FACTOR = 0.68; // for moisture removal
  const LATENT_HEAT_FACTOR_2 = 0.88;
  const SAFETY_FACTOR = 1.15;
  const CONST_FOR_EQUIPMENT_AND_LIGHT = 3.41;
  const CONST_FOR_LIGHT = 1.25;
  const area_sqft = area * 10.76;

  // Calculate sun gain heat load
  const sunGainResult = calculateSunGainHeatLoad({
    sunGainComponents,
    area,
    summer,
    monsoon,
    cfm_sqft,
    cfm_person,
    people,
  });

  // Calculate TOTAL CFM
  const TOTAL_CFM = area * cfm_sqft + people * cfm_person;

  // Calculate for Summer Conditions
  const summer_outside_db = summer.outside_db;
  const summer_room_db = summer.room_db;
  const summer_dry_bulb_diff = summer_outside_db - summer_room_db;
  const summer_outside_gr_lb = summer.outside_gr_lb;
  const summer_room_gr_lb = summer.room_gr_lb;
  const summer_grains_lb_diff = summer_outside_gr_lb - summer_room_gr_lb;

  // Summer Sensible Heat
  const summer_sensible_heat =
    SPECIFIC_HEAT_OF_AIR * DENSITY_OF_AIR * TOTAL_CFM * summer_dry_bulb_diff;

  // Summer Latent Heat
  const summer_latent_heat =
    LATENT_HEAT_FACTOR *
    LATENT_HEAT_FACTOR_2 *
    TOTAL_CFM *
    summer_grains_lb_diff;

  // Summer Internal Gains
  const summer_sensible_heat_of_people = people * sensible_heat_people;
  const summer_heat_of_equipment = equipment * CONST_FOR_EQUIPMENT_AND_LIGHT;
  const summer_heat_of_light =
    light * area_sqft * CONST_FOR_LIGHT * CONST_FOR_EQUIPMENT_AND_LIGHT;
  const summer_internal_gains =
    summer_sensible_heat_of_people +
    summer_heat_of_equipment +
    summer_heat_of_light;

  // Calculate for Monsoon Conditions
  const monsoon_outside_db = monsoon.outside_db;
  const monsoon_room_db = monsoon.room_db;
  const monsoon_dry_bulb_diff = monsoon_outside_db - monsoon_room_db;
  const monsoon_outside_gr_lb = monsoon.outside_gr_lb;
  const monsoon_room_gr_lb = monsoon.room_gr_lb;
  const monsoon_grains_lb_diff = monsoon_outside_gr_lb - monsoon_room_gr_lb;

  // Monsoon Sensible Heat
  const monsoon_sensible_heat =
    SPECIFIC_HEAT_OF_AIR * DENSITY_OF_AIR * TOTAL_CFM * monsoon_dry_bulb_diff;

  // Monsoon Latent Heat
  const monsoon_latent_heat =
    LATENT_HEAT_FACTOR *
    LATENT_HEAT_FACTOR_2 *
    TOTAL_CFM *
    monsoon_grains_lb_diff;

  // Monsoon Internal Gains
  const monsoon_sensible_heat_of_people = people * sensible_heat_people;
  const monsoon_heat_of_equipment = equipment * CONST_FOR_EQUIPMENT_AND_LIGHT;
  const monsoon_heat_of_light =
    light * area_sqft * CONST_FOR_LIGHT * CONST_FOR_EQUIPMENT_AND_LIGHT;
  const monsoon_internal_gains =
    monsoon_sensible_heat_of_people +
    monsoon_heat_of_equipment +
    monsoon_heat_of_light;

  // Room Latent Heat
  const outside_air_summer = TOTAL_CFM * summer_grains_lb_diff * 0.12 * 0.68;
  const outside_air_monsoon = TOTAL_CFM * monsoon_grains_lb_diff * 0.12 * 0.68;
  const rlh_people_summer = people * 205;
  const rlh_people_monsoon = people * 205;
  const room_latent_heat_summer = outside_air_summer + rlh_people_summer;
  const room_latent_heat_monsoon = outside_air_monsoon + rlh_people_monsoon;

  // Summer HeatLoad Total (including sun gain)
  const summer_heatload_total =
    summer_sensible_heat +
    summer_latent_heat +
    summer_internal_gains +
    room_latent_heat_summer +
    sunGainResult.totalSummerSunGain;

  // Summer HeatLoad with Safety Factor
  const summer_heatload_with_safety_factor =
    summer_heatload_total * SAFETY_FACTOR;

  // Monsoon HeatLoad Total (including sun gain)
  const monsoon_heatload_total =
    monsoon_sensible_heat +
    monsoon_latent_heat +
    monsoon_internal_gains +
    room_latent_heat_monsoon +
    sunGainResult.totalMonsoonSunGain;

  // Monsoon HeatLoad with Safety Factor
  const monsoon_heatload_with_safety_factor =
    monsoon_heatload_total * SAFETY_FACTOR;

  return {
    summer: {
      sensible_heat: parseFloat(summer_sensible_heat.toFixed(2)),
      latent_heat: parseFloat(summer_latent_heat.toFixed(2)),
      internal_heat: parseFloat(summer_internal_gains.toFixed(2)),
      room_latent_heat: parseFloat(room_latent_heat_summer.toFixed(2)),
      sun_gain_heat: parseFloat(sunGainResult.totalSummerSunGain.toFixed(2)),
      heatload_total: parseFloat(summer_heatload_total.toFixed(2)),
      heatload_with_safety_factor: parseFloat(
        summer_heatload_with_safety_factor.toFixed(2)
      ),
      calculations: {
        total_cfm: parseFloat(TOTAL_CFM.toFixed(2)),
        dry_bulb_diff: parseFloat(summer_dry_bulb_diff.toFixed(2)),
        grains_lb_diff: parseFloat(summer_grains_lb_diff.toFixed(2)),
        sensible_heat_of_people: parseFloat(
          summer_sensible_heat_of_people.toFixed(2)
        ),
        heat_of_equipment: parseFloat(summer_heat_of_equipment.toFixed(2)),
        heat_of_light: parseFloat(summer_heat_of_light.toFixed(2)),
        outside_air: parseFloat(outside_air_summer.toFixed(2)),
        rlh_people: parseFloat(rlh_people_summer.toFixed(2)),
      },
    },
    monsoon: {
      sensible_heat: parseFloat(monsoon_sensible_heat.toFixed(2)),
      latent_heat: parseFloat(monsoon_latent_heat.toFixed(2)),
      internal_heat: parseFloat(monsoon_internal_gains.toFixed(2)),
      room_latent_heat: parseFloat(room_latent_heat_monsoon.toFixed(2)),
      sun_gain_heat: parseFloat(sunGainResult.totalMonsoonSunGain.toFixed(2)),
      heatload_total: parseFloat(monsoon_heatload_total.toFixed(2)),
      heatload_with_safety_factor: parseFloat(
        monsoon_heatload_with_safety_factor.toFixed(2)
      ),
      calculations: {
        total_cfm: parseFloat(TOTAL_CFM.toFixed(2)),
        dry_bulb_diff: parseFloat(monsoon_dry_bulb_diff.toFixed(2)),
        grains_lb_diff: parseFloat(monsoon_grains_lb_diff.toFixed(2)),
        sensible_heat_of_people: parseFloat(
          monsoon_sensible_heat_of_people.toFixed(2)
        ),
        heat_of_equipment: parseFloat(monsoon_heat_of_equipment.toFixed(2)),
        heat_of_light: parseFloat(monsoon_heat_of_light.toFixed(2)),
        outside_air: parseFloat(outside_air_monsoon.toFixed(2)),
        rlh_people: parseFloat(rlh_people_monsoon.toFixed(2)),
      },
    },
    sun_gain: {
      total_summer_sun_gain: sunGainResult.totalSummerSunGain,
      total_monsoon_sun_gain: sunGainResult.totalMonsoonSunGain,
      component_results: sunGainResult.componentResults,
      constants: sunGainResult.constants,
    },
    constants: {
      specific_heat_of_air: SPECIFIC_HEAT_OF_AIR,
      density_of_air: DENSITY_OF_AIR,
      latent_heat_factor: LATENT_HEAT_FACTOR,
      safety_factor: SAFETY_FACTOR,
    },
  };
};

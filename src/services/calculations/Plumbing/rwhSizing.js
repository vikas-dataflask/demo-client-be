export const calculateRWHSizing = (rwhData) => {
  if (!Array.isArray(rwhData) || rwhData.length === 0) {
    throw new Error("Invalid RWH input data. Expected an array.");
  }

  return rwhData.map((rwh) => {
    let { area_m2, intensity_mmhr, runoff_coefficient, storage_time_min } = rwh;

    if (
      !area_m2 ||
      !intensity_mmhr ||
      !runoff_coefficient ||
      !storage_time_min
    ) {
      throw new Error("Missing required input values");
    }

    // Calculate discharge
    let discharge_m3hr = runoff_coefficient * intensity_mmhr * (area_m2 / 1000);
    let discharge_m3s = discharge_m3hr / 3600;
    let discharge_lpm = discharge_m3s * 1000 * 60;

    // Calculate storage requirements
    let total_volume_water = discharge_lpm * storage_time_min;
    let tank_capacity_m3 = total_volume_water / 1000;

    // Harvesting pit calculations
    let harvesting_pit_depth_m = 2.5;
    let harvesting_pit_dia_m =
      Math.sqrt(tank_capacity_m3 / harvesting_pit_depth_m / 3.142) * 2;
    let harvesting_pit_length_width_m = Math.sqrt(
      tank_capacity_m3 / harvesting_pit_depth_m
    );

    return {
      ...rwh,
      discharge_m3hr,
      discharge_m3s,
      discharge_lpm,
      total_volume_water,
      tank_capacity_m3,
      harvesting_pit_depth_m,
      harvesting_pit_dia_m: parseFloat(harvesting_pit_dia_m.toFixed(2)),
      harvesting_pit_length_width_m: parseFloat(
        harvesting_pit_length_width_m.toFixed(2)
      ),
    };
  });
};

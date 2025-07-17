const calculateFlowrate = (area, height, acph) => {
    let volume = area * height;
    let flowrate_m3h = volume * acph;
    let flowrate_m3s = flowrate_m3h / 3600;
    return { volume, flowrate_m3s, flowrate_m3h };
  };
  
export const calculateVentilation = (input) => {
  // Extract values from input
  const { area, height, acph, number_of_fans, fan_diameter } = input;

  // Calculate volume and flowrate
  const volume = area * height;
  const flowrate_m3h = volume * acph;
  const flowrate_m3s = flowrate_m3h / 3600;

  // Use user input for number of fans
  const fans = Number(number_of_fans) || 1;

  // Flowrate per fan
  const flowrate_per_fan_m3h = flowrate_m3h / fans;
  const flowrate_per_fan_cfm = flowrate_per_fan_m3h / 3.6;

  return {
    volume,
    flowrate_m3h,
    flowrate_m3s,
    number_of_fans: fans,
    flowrate_per_fan_m3h,
    flowrate_per_fan_cfm,
    selected_fan_diameter: fan_diameter,
  };
};
  
  
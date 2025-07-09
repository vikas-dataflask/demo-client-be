// export const calculatePlumbingHeadloss = ({
//   number_of_staff,
//   number_of_passenger,
//   pd_occupancy,
//   station_area_for_cleaning,
//   gardening_area,
// }) => {
//   const raw_staff = number_of_staff * (45 * 0.35);
//   const raw_passenger = number_of_passenger * (15 * 0.65);
//   const raw_pd_occupancy = pd_occupancy * (45 * 0.35);
//   const raw_station_cleaning = station_area_for_cleaning * 1;
//   const raw_gardening = gardening_area * 6;
//   const raw_total_water_requirement =
//     raw_staff +
//     raw_passenger +
//     raw_pd_occupancy +
//     raw_station_cleaning +
//     raw_gardening;
//   const raw_ug_tank_1_day = raw_total_water_requirement;
//   const raw_ug_tank_half_day = raw_total_water_requirement / 2;

//   const treated_staff = number_of_staff * (45 * 0.65);
//   const treated_passenger = number_of_passenger * (15 * 0.35);
//   const treated_pd_occupancy = pd_occupancy * (45 * 0.65);
//   const treated_total_water_requirement =
//     treated_staff + treated_passenger + treated_pd_occupancy;
//   const treated_ug_tank_1_day = treated_total_water_requirement;
//   const treated_ug_tank_half_day = treated_total_water_requirement / 2;

//   return {
//     raw_water_requirement: {
//       number_of_staff: raw_staff,
//       number_of_passenger: raw_passenger,
//       pd_occupancy: raw_pd_occupancy,
//       station_area_for_cleaning: raw_station_cleaning,
//       gardening_area: raw_gardening,
//       total_water_requirement: raw_total_water_requirement,
//       ug_water_tank_1_day: raw_ug_tank_1_day,
//       ug_water_tank_half_day: raw_ug_tank_half_day,
//     },
//     treated_water_requirement: {
//       number_of_staff: treated_staff,
//       number_of_passenger: treated_passenger,
//       pd_occupancy: treated_pd_occupancy,
//       total_water_requirement: treated_total_water_requirement,
//       ug_water_tank_1_day: treated_ug_tank_1_day,
//       ug_water_tank_half_day: treated_ug_tank_half_day,
//     },
//   };
// };

export const calculatePlumbingHeadloss = ({
  pipeDia,
  pipeMaterial,
  pipeLengthHorizontal,
  pipeLengthVertical,
  fittings,
  frictionalLossCoefficient,
  flowrateLpm,
  staticLossMeter,
  staticGainMeter,
}) => {
  // Calculate equivalent length including fittings
  const diameter = pipeDia / 1000; // Convert mm to m
  let totalEquivalent = pipeLengthHorizontal + pipeLengthVertical;

  // Add equivalent lengths for fittings
  Object.entries(fittings).forEach(([fitting, count]) => {
    const equivalentFactors = {
      SE90: 30,
      SE45: 16,
      WE90: 30,
      GV: 8,
      NRV: 100,
      BFV: 0,
      GLV: 0,
      OTHER: 0,
    };
    totalEquivalent += (equivalentFactors[fitting] || 0) * count * diameter;
  });

  // Convert flow rate from LPM to m³/s
  const flowRateM3s = flowrateLpm / 1000 / 60;

  // Hazen-Williams formula for pressure loss
  const pressureLossPerMeterBar =
    (6.05 * Math.pow(flowrateLpm, 1.85) * Math.pow(10, 5)) /
    (Math.pow(frictionalLossCoefficient, 1.85) * Math.pow(pipeDia, 4.87));

  const pressureLossTotalBar = pressureLossPerMeterBar * totalEquivalent;
  const pressureLossTotalMeter =
    (pressureLossTotalBar * Math.pow(10, 5)) / (1000 * 9.81);

  // Total head loss including static components
  const totalPressureLossBar =
    pressureLossTotalBar + staticLossMeter - staticGainMeter;

  return {
    pipeDia,
    pipeMaterial,
    pipeLengthHorizontal,
    pipeLengthVertical,
    fittings,
    equivalentLength: totalEquivalent.toFixed(2),
    frictionalLossCoefficient,
    flowrateLpm,
    flowRateM3s: flowRateM3s.toFixed(6),
    pressureLossPerMeterBar: pressureLossPerMeterBar.toFixed(6),
    pressureLossTotalBar: pressureLossTotalBar.toFixed(3),
    pressureLossTotalMeter: pressureLossTotalMeter.toFixed(1),
    staticLossMeter,
    staticGainMeter,
    totalPressureLossBar: totalPressureLossBar.toFixed(3),
    totalPressureLossMeter: (totalPressureLossBar * 10.2).toFixed(1), // Convert bar to meters
  };
};

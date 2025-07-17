// export const calculateFirePump = (data) => {
//   return data.map((station) => {
//     let {
//       station_area,
//       total_pd_area,
//       station_height,
//       flowrate_lpm,
//       pipe_material,
//       friction_loss_coefficient,
//       pipe_dia,
//       residual_head,
//       total_pressure_loss,
//       efficiency,
//     } = station;

//     let flowrate_m3s = flowrate_lpm / 1000 / 60;
//     let total_head = residual_head + total_pressure_loss;
//     let efficiency_decimal = parseFloat(efficiency) / 100;
//     let pump_capacity_watts =
//       total_head * flowrate_m3s * 1000 * 9.81 * efficiency_decimal;
//     let pump_capacity_hp = pump_capacity_watts / 1000 / 0.745;
//     let pump_capacity_kw = pump_capacity_hp * 0.745;

//     return {
//       station_area,
//       total_pd_area,
//       station_height,
//       flowrate_lpm,
//       flowrate_m3s,
//       pipe_material,
//       friction_loss_coefficient,
//       pipe_dia,
//       residual_head,
//       total_pressure_loss,
//       total_head,
//       efficiency,
//       pump_capacity_watts,
//       pump_capacity_hp,
//       pump_capacity_kw,
//     };
//   });
// };

export const calculateFirePump = (data) => {
  return data.map((pump) => {
    const {
      flowrate_lpm, // Flow rate in L/min (user input)
      total_head, // Total head in meters (user input)
      pipe_material,
      friction_loss_coefficient,
      pipe_dia,
      efficiency, // Pump efficiency in %
    } = pump;

    // ✅ Convert inputs for calculation
    const Q_gpm = flowrate_lpm / 3.785; // Convert L/min → US GPM
    const SG = 1; // Specific Gravity (default: 1)
    const efficiency_decimal = parseFloat(efficiency) / 100;

    // ✅ Pump Capacity Calculation
    const pump_capacity_hp =
      (Q_gpm * total_head * SG) / (3960 * efficiency_decimal);
    const pump_capacity_kw = pump_capacity_hp * 0.746;

    return {
      flowrate_lpm,
      total_head,
      pipe_material,
      friction_loss_coefficient,
      pipe_dia,
      efficiency,
      pump_capacity_hp: pump_capacity_hp.toFixed(2),
      pump_capacity_kw: pump_capacity_kw.toFixed(2),
    };
  });
};

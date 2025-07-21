const calculatePlumbingHeadLoss = ({
  pipeDia,
  pipeMaterial,
  pipeLengthHorizontal,
  pipeLengthVertical,
  fittings,
  frictionalLossCoefficient,
  flowrateLpm,
  staticLossMeter,
  staticGainMeter,
  velocity,
  heightOfFitting,
}) => {
  // ✅ Convert units
  const d = pipeDia / 1000; // mm → m
  const L = pipeLengthHorizontal + pipeLengthVertical;
  const Q = flowrateLpm / 1000 / 60; // L/min → m³/s

  // ✅ Friction Loss (Hazen-Williams)
  const H_friction =
    (10.67 * L * Math.pow(flowrateLpm, 1.85)) /
    (Math.pow(frictionalLossCoefficient, 1.85) * Math.pow(pipeDia, 4.87));

  // ✅ Fitting Loss (K * v² / 2g)
  const K_values = {
    SE90: 1,
    SE45: 0.4,
    WE90: 0.5,
    GV: 0.2,
    NRV: 2,
    BFV: 0.5,
    GLV: 10,
    OTHER: 1,
  };

  const K_total = Object.entries(fittings).reduce(
    (sum, [fitting, count]) => sum + (K_values[fitting] || 0) * count,
    0
  );

  const g = 9.81;
  const H_fitting = (K_total * Math.pow(velocity, 2)) / (2 * g);

  // ✅ Elevation Loss (as per your formula)
  const H_elevation = 9.81 * heightOfFitting;

  // ✅ Static Head
  const H_static = staticLossMeter - staticGainMeter;

  // ✅ Total Head Loss
  const H_total = H_friction + H_fitting + H_elevation + H_static;
  const totalPressureLossBar = H_total * 0.0981;

  return {
    pipeDia,
    pipeMaterial,
    pipeLengthHorizontal,
    pipeLengthVertical,
    fittings,
    frictionalLossCoefficient,
    flowrateLpm,
    velocity,
    heightOfFitting,
    K_total: K_total.toFixed(3),
    H_friction: H_friction.toFixed(3),
    H_fitting: H_fitting.toFixed(3),
    H_elevation: H_elevation.toFixed(3),
    H_static: H_static.toFixed(3),
    H_total: H_total.toFixed(3),
    totalPressureLossBar: totalPressureLossBar.toFixed(3),
  };
};

export default calculatePlumbingHeadLoss;

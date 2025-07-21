import { convertFUToFlowRate, selectPipeSize, calculateVelocity } from "../../../utils/pipeSizer.js";

// Drainage fixture unit configuration (NBC standards)
const DRAINAGE_FU_CONFIG = {
  washBasin: 1.0,
  healthFaucet: 2.0,
  floorDrain: 2.0,
  serviceSink: 3.0,
  kitchenSink: 2.0,
  shower: 2.0,
  waterCloset: 6.0,
  urinal: 3.0,
  urinalTrap: 3.0,
};

export function calculateDrainagePipeSizing(input) {
  // Extract input values
  const {
    num_wb = 0,
    num_health_faucet = 0,
    num_floor_drain = 0,
    num_service_sink = 0,
    num_kitchen_sink = 0,
    num_shower = 0,
    num_wc = 0,
    num_urinal = 0,
    num_urinal_trap = 0,
    velocity = 0,
  } = input;

  // Calculate total fixture units (waste and soil)
  const total_fixture_unit_waste =
    num_wb * DRAINAGE_FU_CONFIG.washBasin +
    num_health_faucet * DRAINAGE_FU_CONFIG.healthFaucet +
    num_floor_drain * DRAINAGE_FU_CONFIG.floorDrain +
    num_service_sink * DRAINAGE_FU_CONFIG.serviceSink +
    num_kitchen_sink * DRAINAGE_FU_CONFIG.kitchenSink +
    num_shower * DRAINAGE_FU_CONFIG.shower;

  const total_fixture_unit_soil =
    num_wc * DRAINAGE_FU_CONFIG.waterCloset +
    num_urinal * DRAINAGE_FU_CONFIG.urinal +
    num_urinal_trap * DRAINAGE_FU_CONFIG.urinalTrap;

  // Estimate flow rate (LPM) using total fixture units (waste + soil)
  const total_fixture_units = total_fixture_unit_waste + total_fixture_unit_soil;
  const estimated_flow_rate_lpm = convertFUToFlowRate(total_fixture_units);

  // Convert flow rate to m3/s for diameter calculation
  const flowRateM3s = estimated_flow_rate_lpm / 1000 / 60;

  // Calculate diameter using the same formula as WaterSupplyPipes.js
  let calculated_diameter_mm = 0;
  if (velocity && velocity > 0) {
    const diameter_m = Math.sqrt((4 * flowRateM3s) / ((22 / 7) * velocity));
    calculated_diameter_mm = Math.round(diameter_m * 1000 * 100) / 100; // round to 2 decimal
  }

  // Select recommended pipe size (mm)
  const pipeSizeInfo = selectPipeSize(estimated_flow_rate_lpm);
  const recommended_pipe_size_mm = pipeSizeInfo.size;

  // Calculate velocity (m/s) for the recommended pipe size
  const calculated_velocity_ms = calculateVelocity(estimated_flow_rate_lpm, recommended_pipe_size_mm);

  return {
    total_fixture_unit_waste,
    total_fixture_unit_soil,
    estimated_flow_rate_lpm,
    recommended_pipe_size_mm,
    calculated_velocity_ms,
    calculated_diameter_mm, // include calculated diameter
    pipe_type: "waste",
  };
} 
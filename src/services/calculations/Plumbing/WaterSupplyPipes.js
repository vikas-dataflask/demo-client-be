import {
  calculatePipeSizing,
  getSupportedFixtureTypes,
} from "../../../utils/pipeSizer.js";

/**
 * Calculate water supply pipe sizing using fixture units (FU) as per IPC/NBC standards
 * @param {Array} waterSupplyData - Array of water supply data objects
 * @returns {Array} Array of calculation results
 */
export const calculateWaterSupplyPipes = (waterSupplyData) => {
  if (!Array.isArray(waterSupplyData) || waterSupplyData.length === 0) {
    throw new Error("Invalid water supply input data. Expected an array.");
  }

  return waterSupplyData.map((supplyData) => {
    // Validate required input values
    const requiredFields = [
      "num_wb",
      "num_health_faucet",
      "num_bib_tap",
      "num_service_sink",
      "num_kitchen_sink",
      "num_water_fountain",
      "num_wc",
      "num_urinal",
    ];

    for (const field of requiredFields) {
      if (supplyData[field] === undefined) {
        throw new Error(`Missing required input value: ${field}`);
      }
    }

    // Convert backend field names to fixture unit names
    const fixtures = {
      washBasin: supplyData.num_wb || 0,
      healthFaucet: supplyData.num_health_faucet || 0,
      bibTap: supplyData.num_bib_tap || 0,
      serviceSink: supplyData.num_service_sink || 0,
      kitchenSink: supplyData.num_kitchen_sink || 0,
      waterFountain: supplyData.num_water_fountain || 0,
      wcTank: supplyData.num_wc || 0,
      urinal: supplyData.num_urinal || 0,
    };

    // Prepare input for pipe sizing calculation
    const pipeSizingInput = {
      fixtures: fixtures,
    };

    // Add pipe parameters if available for pressure drop calculation
    if (supplyData.pipe_length && supplyData.pipe_material) {
      pipeSizingInput.pipeParams = {
        pipeLength: supplyData.pipe_length,
        pipeMaterial: supplyData.pipe_material,
      };
    }

    try {
      // Calculate pipe sizing using fixture units
      const results = calculatePipeSizing(pipeSizingInput);

      // Return results in the expected format for backward compatibility
      return {
        // Original input data
        ...supplyData,

        // Fixture unit calculations (backward compatibility)
        wb_domestic:
          results.fixtureUnits.fixtureBreakdown.washBasin?.coldFU || 0,
        health_faucet_domestic:
          results.fixtureUnits.fixtureBreakdown.healthFaucet?.coldFU || 0,
        bib_tap_domestic:
          results.fixtureUnits.fixtureBreakdown.bibTap?.coldFU || 0,
        service_sink_domestic:
          results.fixtureUnits.fixtureBreakdown.serviceSink?.coldFU || 0,
        kitchen_sink_domestic:
          results.fixtureUnits.fixtureBreakdown.kitchenSink?.coldFU || 0,
        water_fountain_domestic:
          results.fixtureUnits.fixtureBreakdown.waterFountain?.coldFU || 0,
        total_fixture_unit_domestic: results.fixtureUnits.coldWaterFU,

        // Flushing fixtures (backward compatibility)
        wc_flushing: results.fixtureUnits.fixtureBreakdown.wcTank?.coldFU || 0,
        urinal_flushing:
          results.fixtureUnits.fixtureBreakdown.urinal?.coldFU || 0,
        total_fixture_unit_flushing: results.fixtureUnits.coldWaterFU,

        // Flow rates (updated to use FU-based calculation)
        flow_lpm_domestic: results.flowRate.estimatedFlowRateLPM,
        flow_m3s_domestic: results.flowRate.flowRateM3s,
        flow_lpm_flushing: results.flowRate.estimatedFlowRateLPM,
        flow_m3s_flushing: results.flowRate.flowRateM3s,

        // Pipe sizing (updated to use FU-based calculation)
        pipe_size_provided_domestic: results.pipeSizing.recommendedPipeSizeMM,
        required_pipe_size_domestic: results.pipeSizing.recommendedPipeSizeMM,
        pipe_size_provided_flushing: results.pipeSizing.recommendedPipeSizeMM,
        required_pipe_size_flushing: results.pipeSizing.recommendedPipeSizeMM,

        // New detailed results
        fixture_units_cold: results.fixtureUnits.coldWaterFU,
        fixture_units_hot: results.fixtureUnits.hotWaterFU,
        estimated_flow_rate_lpm: results.flowRate.estimatedFlowRateLPM,
        recommended_pipe_size_mm: results.pipeSizing.recommendedPipeSizeMM,
        calculated_velocity_ms: results.pipeSizing.calculatedVelocity,
        velocity_within_limit: results.pipeSizing.isWithinVelocityLimit,
        pressure_drop_bar: results.pressureDrop.pressureDrop,
        fixture_breakdown: results.fixtureUnits.fixtureBreakdown,

        // Summary for easy access
        summary: results.summary,
      };
    } catch (error) {
      throw new Error(`Water supply pipe calculation failed: ${error.message}`);
    }
  });
};

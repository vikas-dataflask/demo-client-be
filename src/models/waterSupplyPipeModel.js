import mongoose from "mongoose";

const waterSupplyPipeSchema = new mongoose.Schema(
  {
    project_id: {
      type: mongoose.Schema.Types.ObjectId, // or String if you're not using ObjectId
      required: true,
      ref: "Project",
    },

    // ✅ Store all user inputs
    input_data: {
      num_wb: { type: Number, default: 0 },
      num_health_faucet: { type: Number, default: 0 },
      num_bib_tap: { type: Number, default: 0 },
      num_service_sink: { type: Number, default: 0 },
      num_kitchen_sink: { type: Number, default: 0 },
      num_water_fountain: { type: Number, default: 0 },
      num_wc: { type: Number, default: 0 },
      num_urinal: { type: Number, default: 0 },
      velocity: { type: Number, default: 0 },
    },

    // ✅ Store calculation results returned by your calculation logic
    result_data: {
      fixture_units_cold: { type: Number, default: 0 },
      fixture_units_hot: { type: Number, default: 0 },
      total_fixture_unit_domestic: { type: Number, default: 0 },
      estimated_flow_rate_lpm: { type: Number, default: 0 },
      flow_m3s_domestic: { type: Number, default: 0 },
      recommended_pipe_size_mm: { type: Number, default: 0 },
      calculated_velocity_ms: { type: Number, default: 0 },
      pressure_drop_bar: { type: Number, default: 0 },
    },
  },
  { timestamps: true }
);

const WaterSupplyPipe = mongoose.model(
  "WaterSupplyPipe",
  waterSupplyPipeSchema
);

export default WaterSupplyPipe;

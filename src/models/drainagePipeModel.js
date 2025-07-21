import mongoose from "mongoose";

const drainagePipeSchema = new mongoose.Schema(
  {
    project_id: {
      type: mongoose.Schema.Types.ObjectId, // or String if you're not using ObjectId
      required: true,
      ref: "Project",
    },
    // Store all user inputs
    input_data: {
      num_wb: { type: Number, default: 0 },
      num_health_faucet: { type: Number, default: 0 },
      num_floor_drain: { type: Number, default: 0 },
      num_service_sink: { type: Number, default: 0 },
      num_kitchen_sink: { type: Number, default: 0 },
      num_shower: { type: Number, default: 0 },
      num_wc: { type: Number, default: 0 },
      num_urinal: { type: Number, default: 0 },
      num_urinal_trap: { type: Number, default: 0 },
      velocity: { type: Number, default: 0 },
    },
    // Store calculation results
    result_data: {
      total_fixture_unit_waste: { type: Number, default: 0 },
      total_fixture_unit_soil: { type: Number, default: 0 },
      estimated_flow_rate_lpm: { type: Number, default: 0 },
      recommended_pipe_size_mm: { type: Number, default: 0 },
      calculated_velocity_ms: { type: Number, default: 0 },
      pipe_type: { type: String, default: "waste" },
    },
  },
  { timestamps: true }
);

const DrainagePipe = mongoose.model("DrainagePipe", drainagePipeSchema);

export default DrainagePipe; 
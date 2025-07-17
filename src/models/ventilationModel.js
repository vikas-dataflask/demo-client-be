import mongoose from "mongoose";

const ventilationSchema = new mongoose.Schema(
  {
    project_id: {
      type: String,
      required: true,
    },
    room: {
      type: String,
      required: true,
    },
    input_data: {
      area: Number,
      height: Number,
      acph: Number,
      fan_capacity: Number,
      fan_diameter: { type: String },
      number_of_fans: Number,
    },
    result_data: {
      volume: Number,
      flowrate_m3s: Number,
      flowrate_m3h: Number,
      number_of_fans: Number,
      flowrate_per_fan_m3h: Number,
      flowrate_per_fan_cfm: Number,
      selected_fan_diameter: { type: String },
    },
  },
  { timestamps: true }
);

const Ventilation = mongoose.model("Ventilation", ventilationSchema);

export default Ventilation;

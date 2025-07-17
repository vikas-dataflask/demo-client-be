import mongoose from "mongoose";

const pumpSchema = new mongoose.Schema({
  // ✅ Input Fields
  flowrate_lpm: { type: Number, required: true },
  total_head: { type: Number, required: true },
  pipe_material: { type: String, required: true },
  friction_loss_coefficient: { type: Number, required: true },
  pipe_dia: { type: Number, required: true },
  efficiency: { type: Number, required: true },

  // ✅ Calculated Output Fields
  pump_capacity_hp: { type: Number, required: true },
  pump_capacity_kw: { type: Number, required: true },
});

const firePumpSchema = new mongoose.Schema(
  {
    project_id: {
      type: String,
      required: true,
      unique: true,
    },
    pumps: [pumpSchema], // ✅ Saves both input & output
  },
  { timestamps: true }
);

const FirePump = mongoose.model("FirePump", firePumpSchema);
export default FirePump;

import mongoose, { Mongoose } from "mongoose";

const qeSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    service: {
      type: String,
      required: true,
    },
    building_type: {
      type: String,
      required: true,
    },
    sub_building_type: {
      type: String,
      required: true,
    },
    level: {
      type: String,
      required: true,
    },
    dxf_entities: { type: Object, default: null },
    grouped_layers: { type: Object, default: {} },
 // NEW FIELD: To store the refined, editable quantity data
    extracted_quantities_data: { type: Array, default: [] }, // NEW
  },
  { timestamps: true }
);

export default mongoose.model("qeProject", qeSchema);

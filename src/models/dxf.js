import mongoose, { Mongoose } from "mongoose";

const dxfSchema = new mongoose.Schema(
  {
    dxf_entities: { type: Object, default: null },
  },
  { timestamps: true }
);

export default mongoose.model("dxf", dxfSchema);

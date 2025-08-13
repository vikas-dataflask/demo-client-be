import mongoose from "mongoose";

const windowSchema = new mongoose.Schema({
  projectId: {
    type: String,
    required: true,
  },
  floorId: {
    type: String,
    required: true,
  },
  roomId: {
    type: String,
    required: true,
  },
  wallId: {
    type: String,
    required: true,
  },
  position: {
    x: { type: Number, required: true },
    y: { type: Number, required: true },
  },
  width: {
    type: Number,
    default: 1200, // 1.2m in mm
  },
  height: {
    type: Number,
    default: 1200, // 1.2m in mm
  },
  sillHeight: {
    type: Number,
    default: 900, // 0.9m in mm
  },
  windowType: {
    type: String,
    enum: ["Single", "Double", "D-glass", "Ventilation", "Fixed", "Sliding"],
    default: "Single",
  },
  material: {
    type: String,
    default: "Aluminum",
  },
  glazing: {
    type: String,
    enum: ["Single", "Double", "Triple"],
    default: "Double",
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  createdBy: {
    type: String,
    required: true,
  },
}, {
  timestamps: true,
});

// Index for efficient queries
windowSchema.index({ projectId: 1, floorId: 1, roomId: 1, wallId: 1 });

export default mongoose.model("Window", windowSchema); 
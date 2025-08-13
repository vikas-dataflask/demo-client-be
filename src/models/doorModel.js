import mongoose from "mongoose";

const doorSchema = new mongoose.Schema({
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
    default: 900, // 0.9m in mm
  },
  height: {
    type: Number,
    default: 2100, // 2.1m in mm
  },
  doorType: {
    type: String,
    enum: ["Single", "Double", "Sliding", "Folding", "Revolving"],
    default: "Single",
  },
  material: {
    type: String,
    default: "Wood",
  },
  direction: {
    type: String,
    enum: ["Left", "Right", "Both"],
    default: "Left",
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
doorSchema.index({ projectId: 1, floorId: 1, roomId: 1, wallId: 1 });

export default mongoose.model("Door", doorSchema); 
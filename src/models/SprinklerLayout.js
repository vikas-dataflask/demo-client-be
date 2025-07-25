import mongoose from "mongoose";

const sprinklerLayoutSchema = new mongoose.Schema(
  {
    projectId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "Project", // optional, if you have a Project model
    },
    roomId: {
      type: String, // or ObjectId if you store rooms in DB
      required: true,
    },

    // === Input Parameters ===
    length: { type: Number, required: true },
    width: { type: Number, required: true },
    hazardClass: {
      type: String,
      enum: ["Light", "Ordinary", "Extra"],
      required: true,
    },

    // === Output / Results ===
    actualSprinklersPlaced: { type: Number },
    rows: { type: Number },
    columns: { type: Number },
    roomArea: { type: Number },
    coveragePerSprinkler: { type: Number },
    spacing: { type: Number },
    actualSpacingX: { type: Number },
    actualSpacingY: { type: Number },
    isCompliant: { type: Boolean },
    coverageRatio: { type: Number },
    complianceMessage: { type: String },

    // Sprinkler positions array
    layout: [
      {
        id: String,
        x: Number,
        y: Number,
      },
    ],
  },
  { timestamps: true }
);

const SprinklerLayout = mongoose.model(
  "SprinklerLayout",
  sprinklerLayoutSchema
);

export default SprinklerLayout;

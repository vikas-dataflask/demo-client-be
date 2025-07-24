import mongoose from "mongoose";

const earthmatSchema = new mongoose.Schema(
  {
    projectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Project", // change to your Project model name if required
      required: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // assuming you track who created it
      required: true,
    },
    input: {
      faultCurrent: { type: Number, required: true },
      faultDuration: { type: Number, required: true },
      soilResistivity: { type: Number, required: true },
      gridArea: {
        length: { type: Number, required: true },
        width: { type: Number, required: true },
      },
      burialDepth: { type: Number, required: true },
      rodDepth: { type: Number, required: true },
      numberOfRods: { type: Number, required: true },
      material: { type: String, enum: ["GI", "Cu"], required: true },
      gridSpacing: { type: Number, default: 7.5 },
    },
    result: {
      permissibleTouchVoltage: Number,
      actualTouchVoltage: Number,
      gridResistance: Number,
      requiredConductorSize: String,
      conductorSize: Number,
      material: String,
      gridGeometry: {
        totalLength: Number,
        perimeter: Number,
        internalLength: Number,
        gridSpacing: Number,
        area: Number,
      },
      isSafe: Boolean,
      safetyMargin: Number,
      recommendation: String,
    },
  },
  { timestamps: true }
);

const Earthmat = mongoose.model("Earthmat", earthmatSchema);
export default Earthmat;

import mongoose from "mongoose";

const floorSchema = new mongoose.Schema({
  projectId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Project",
    required: true,
    index: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  shape: {
    type: {
      type: String,
      enum: ["rect", "polygon"],
      default: "rect"
    },
    coordinates: [{
      x: {
        type: Number,
        required: true
      },
      y: {
        type: Number,
        required: true
      }
    }],
    width: {
      type: Number,
      required: true,
      min: 0.1 // Minimum 0.1 meters
    },
    height: {
      type: Number,
      required: true,
      min: 0.1 // Minimum 0.1 meters
    }
  },
  height: {
    type: Number,
    required: true,
    default: 3.2, // Default floor height in meters
    min: 0.5 // Minimum 0.5 meters
  },
  material: {
    type: String,
    default: "RCC",
    trim: true
  },
  slabThickness: {
    type: Number,
    default: 0.2, // Default slab thickness in meters
    min: 0.05 // Minimum 0.05 meters
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  unit: {
    type: String,
    default: "m",
    enum: ["m", "ft", "mm"],
    required: true
  },
  // Additional metadata
  level: {
    type: Number,
    default: 0
  },
  source: {
    type: String,
    enum: ["manual", "rectangle", "polygon"],
    default: "manual"
  },
  layer: {
    type: String,
    default: "A-FLOR"
  }
}, {
  timestamps: true
});

// Compound index for unique floor names within a project
floorSchema.index({ projectId: 1, name: 1 }, { unique: true });

// Virtual for area calculation
floorSchema.virtual('area').get(function() {
  return this.shape.width * this.shape.height;
});

// Ensure virtual fields are serialized
floorSchema.set('toJSON', { virtuals: true });
floorSchema.set('toObject', { virtuals: true });

// Pre-save middleware to validate coordinates for polygon type
floorSchema.pre('save', function(next) {
  if (this.shape.type === 'polygon' && this.shape.coordinates.length < 3) {
    return next(new Error('Polygon must have at least 3 coordinates'));
  }
  next();
});

export default mongoose.model("Floor", floorSchema); 
import mongoose from "mongoose";

const slabDesignSchema = new mongoose.Schema(
  {
    project: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Project",
      required: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    designName: {
      type: String,
      required: true,
      default: "Slab Design",
    },
    
    // Input Parameters
    inputParameters: {
      slabType: {
        type: String,
        enum: ["One-way", "Two-way"],
        required: true,
      },
      spanLengthShort: {
        type: Number,
        required: true,
        min: 0,
      },
      spanLengthLong: {
        type: Number,
        required: true,
        min: 0,
      },
      slabThickness: {
        type: Number,
        required: true,
        min: 0,
      },
      supportCondition: {
        type: String,
        enum: ["Simply Supported", "Continuous", "Fixed"],
        required: true,
      },
      liveLoad: {
        type: Number,
        required: true,
        min: 0,
      },
      floorFinishLoad: {
        type: Number,
        required: true,
        min: 0,
      },
      concreteGrade: {
        type: String,
        enum: ["M20", "M25", "M30"],
        required: true,
      },
      steelGrade: {
        type: String,
        enum: ["Fe 415", "Fe 500"],
        required: true,
      },
      coverToReinforcement: {
        type: Number,
        required: true,
        min: 0,
      },
    },

    // Calculated Results
    calculatedResults: {
      // Material Properties
      fck: Number, // Characteristic compressive strength of concrete
      fy: Number,  // Yield strength of steel
      
      // Loads
      selfWeight: Number,
      deadLoad: Number,
      totalLoad: Number,
      factoredLoad: Number,
      
      // Moment Calculations
      ultimateBendingMoment: Number,
      momentCoefficient: Number,
      
      // Depth Calculations
      requiredEffectiveDepth: Number,
      providedEffectiveDepth: Number,
      totalDepth: Number,
      
      // Steel Calculations
      requiredSteelArea: Number,
      minimumSteelArea: Number,
      providedSteelArea: Number,
      
      // Reinforcement Details
      recommendedBarSize: String,
      barSpacing: Number,
      numberOfBars: Number,
      
      // Design Checks
      checks: {
        minSteelCheck: {
          status: String,
          value: Number,
          requirement: Number,
        },
        maxBarSpacingCheck: {
          status: String,
          value: Number,
          requirement: Number,
        },
        shearCheck: {
          status: String,
          value: Number,
          requirement: Number,
        },
        deflectionCheck: {
          status: String,
          value: Number,
          requirement: Number,
        },
      },
      
      // Overall Design Status
      designStatus: {
        type: String,
        enum: ["Pass", "Fail", "Warning"],
        default: "Pass",
      },
      
      // Additional Notes
      designNotes: [String],
    },
    
    // Calculation Metadata
    calculationDate: {
      type: Date,
      default: Date.now,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { 
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// Add indexes for better query performance
slabDesignSchema.index({ project: 1, user: 1 });
slabDesignSchema.index({ createdAt: -1 });

// Virtual for span ratio (for determining slab type)
slabDesignSchema.virtual('spanRatio').get(function() {
  return this.inputParameters.spanLengthLong / this.inputParameters.spanLengthShort;
});

export default mongoose.model("SlabDesign", slabDesignSchema);

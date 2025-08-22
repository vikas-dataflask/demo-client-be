import mongoose from "mongoose";

const beamDesignSchema = new mongoose.Schema(
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
      default: "Beam Design",
    },
    
    // Input Parameters
    inputParameters: {
      beamType: {
        type: String,
        enum: ["Simply Supported", "Continuous", "Cantilever"],
        required: true,
      },
      spanLength: {
        type: Number,
        required: true,
        min: 0,
      },
      beamWidth: {
        type: Number,
        required: true,
        min: 0,
      },
      beamDepth: {
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
      superimposedLoad: {
        type: Number,
        default: 0,
        min: 0,
      },
      coverToSteel: {
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
      
      // Load Calculations
      selfWeight: Number,
      deadLoad: Number,
      totalLoad: Number,
      factoredLoad: Number,
      
      // Moment and Shear
      ultimateBendingMoment: Number,
      ultimateShearForce: Number,
      momentCoefficient: Number,
      shearCoefficient: Number,
      
      // Depth and Section Properties
      effectiveDepth: Number,
      neutralAxisDepth: Number,
      leverArm: Number,
      
      // Flexural Steel Calculations
      requiredFlexuralSteel: Number,
      minimumFlexuralSteel: Number,
      providedFlexuralSteel: Number,
      flexuralSteelRatio: Number,
      
      // Flexural Reinforcement Details
      mainBarSize: String,
      numberOfMainBars: Number,
      mainBarArea: Number,
      
      // Shear Calculations
      shearStress: Number,
      concreteShearCapacity: Number,
      shearReinforcementRequired: Boolean,
      
      // Stirrup Details
      stirrupBarSize: String,
      stirrupSpacing: Number,
      stirrupLegs: Number,
      stirrupArea: Number,
      
      // Design Checks
      checks: {
        minimumSteelCheck: {
          status: String,
          value: Number,
          requirement: Number,
        },
        maximumSteelCheck: {
          status: String,
          value: Number,
          requirement: Number,
        },
        deflectionCheck: {
          status: String,
          value: Number,
          requirement: Number,
        },
        shearCheck: {
          status: String,
          value: Number,
          requirement: Number,
        },
        crackWidthCheck: {
          status: String,
          value: Number,
          requirement: Number,
        },
        stirrupSpacingCheck: {
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
beamDesignSchema.index({ project: 1, user: 1 });
beamDesignSchema.index({ createdAt: -1 });

// Virtual for beam slenderness ratio
beamDesignSchema.virtual('slendernessRatio').get(function() {
  return this.inputParameters.spanLength * 1000 / this.calculatedResults.effectiveDepth;
});

// Virtual for reinforcement percentage
beamDesignSchema.virtual('reinforcementPercentage').get(function() {
  if (this.calculatedResults && this.inputParameters) {
    const area = this.inputParameters.beamWidth * this.calculatedResults.effectiveDepth;
    return (this.calculatedResults.providedFlexuralSteel / area) * 100;
  }
  return 0;
});

export default mongoose.model("BeamDesign", beamDesignSchema);

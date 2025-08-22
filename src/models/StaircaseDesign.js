import mongoose from 'mongoose';

const staircaseDesignSchema = new mongoose.Schema({
  // References
  projectId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project',
    required: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  
  // Staircase Identification
  staircaseId: {
    type: String,
    required: true,
    trim: true
  },
  
  // Input Parameters
  inputParameters: {
    staircaseType: {
      type: String,
      enum: ['Dog-legged', 'Open Well', 'Quarter Turn', 'Half Turn', 'Spiral'],
      required: true
    },
    
    floorHeight: {
      type: Number,
      required: true,
      min: 2000,
      max: 50000
    },
    
    riserHeight: {
      type: Number,
      required: true,
      min: 150,
      max: 200
    },
    
    treadWidth: {
      type: Number,
      required: true,
      min: 250,
      max: 350
    },
    
    stairWidth: {
      type: Number,
      required: true,
      min: 800,
      max: 2000
    },
    
    landingWidth: {
      type: Number,
      required: true,
        min: 800,
      max: 2000
    },
    
    liveLoad: {
      type: Number,
      required: true,
      min: 0,
      default: 3000
    },
    
    floorFinishLoad: {
      type: Number,
      required: true,
      min: 0,
      default: 1000
    },
    
    concreteGrade: {
      type: String,
      enum: ['M20', 'M25', 'M30', 'M35', 'M40'],
      required: true
    },
    
    steelGrade: {
      type: String,
      enum: ['Fe 415', 'Fe 500'],
      required: true
    },
    
    clearCover: {
      type: Number,
      required: true,
      min: 15,
      max: 25
    }
  },
  
  // Calculated Results
  calculatedResults: {
    // Material Properties
    fck: Number,
    fy: Number,
    
    // Geometric Properties
    numberOfRisers: Number,
    numberOfTreads: Number,
    totalStairLength: Number,
    stairSlope: Number,
    
    // Load Calculations
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
    mainBarSize: String,
    mainBarSpacing: Number,
    distributionBarSize: String,
    distributionBarSpacing: Number,
    
    // Design Checks
    checks: {
      riserTreadRatio: {
        status: String,
        value: Number,
        requirement: String
      },
      minimumSteelCheck: {
        status: String,
        value: Number,
        requirement: Number
      },
      maximumSteelCheck: {
        status: String,
        value: Number,
        requirement: Number
      },
      shearCheck: {
        status: String,
        value: Number,
        limit: Number
      },
      deflectionCheck: {
        status: String,
        value: Number,
        limit: Number
      }
    },
    
    // Overall Design Status
    designStatus: {
      type: String,
      enum: ['Pass', 'Fail', 'Warning'],
      default: 'Pass'
    },
    
    // Additional Notes
    designNotes: [String]
  },
  
  // Calculation Metadata
  calculationDate: {
    type: Date,
    default: Date.now
  },
  
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Add indexes for better query performance
staircaseDesignSchema.index({ projectId: 1, userId: 1 });
staircaseDesignSchema.index({ createdAt: -1 });

// Virtual for riser-tread ratio
staircaseDesignSchema.virtual('riserTreadRatio').get(function() {
  return this.inputParameters.riserHeight / this.inputParameters.treadWidth;
});

// Virtual for stair area
staircaseDesignSchema.virtual('stairArea').get(function() {
  return this.calculatedResults.totalStairLength * this.inputParameters.stairWidth;
});

export default mongoose.model('StaircaseDesign', staircaseDesignSchema);

import mongoose from 'mongoose';

const shearWallDesignSchema = new mongoose.Schema({
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
  
  // Shear Wall Identification
  shearWallId: {
    type: String,
    required: true,
    trim: true
  },
  
  // Input Parameters
  inputParameters: {
    wallType: {
      type: String,
      enum: ['Rectangular', 'L-Shaped', 'T-Shaped', 'C-Shaped'],
      required: true
    },
    
    wallLength: {
      type: Number,
      required: true,
      min: 1000,
      max: 20000
    },
    
    wallThickness: {
      type: Number,
      required: true,
      min: 150,
      max: 500
    },
    
    wallHeight: {
      type: Number,
      required: true,
      min: 1000,
      max: 50000
    },
    
    axialLoad: {
      type: Number,
      required: true,
      min: 0
    },
    
    shearForce: {
      type: Number,
      required: true,
      min: 0
    },
    
    bendingMoment: {
      type: Number,
      required: true,
      min: 0
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
      min: 20,
      max: 50
    }
  },
  
  // Calculated Results
  calculatedResults: {
    // Material Properties
    fck: Number,
    fy: Number,
    
    // Geometric Properties
    wallArea: Number,
    wallVolume: Number,
    aspectRatio: Number,
    
    // Load Calculations
    factoredAxialLoad: Number,
    factoredShearForce: Number,
    factoredBendingMoment: Number,
    
    // Steel Calculations
    requiredVerticalSteel: Number,
    requiredHorizontalSteel: Number,
    minimumVerticalSteel: Number,
    minimumHorizontalSteel: Number,
    providedVerticalSteel: Number,
    providedHorizontalSteel: Number,
    
    // Reinforcement Details
    verticalBarSize: String,
    verticalBarSpacing: Number,
    horizontalBarSize: String,
    horizontalBarSpacing: Number,
    
    // Design Checks
    checks: {
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
      flexuralCheck: {
        status: String,
        value: Number,
        limit: Number
      },
      slendernessCheck: {
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
shearWallDesignSchema.index({ projectId: 1, userId: 1 });
shearWallDesignSchema.index({ createdAt: -1 });

// Virtual for wall slenderness ratio
shearWallDesignSchema.virtual('slendernessRatio').get(function() {
  return this.inputParameters.wallHeight / this.inputParameters.wallThickness;
});

// Virtual for wall reinforcement ratio
shearWallDesignSchema.virtual('reinforcementRatio').get(function() {
  if (this.calculatedResults && this.inputParameters) {
    const area = this.inputParameters.wallLength * this.inputParameters.wallThickness;
    return ((this.calculatedResults.providedVerticalSteel + this.calculatedResults.providedHorizontalSteel) / area) * 100;
  }
  return 0;
});

export default mongoose.model('ShearWallDesign', shearWallDesignSchema);

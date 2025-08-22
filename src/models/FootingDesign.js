import mongoose from 'mongoose';

const footingDesignSchema = new mongoose.Schema({
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
  
  // Footing Identification
  footingId: {
    type: String,
    required: true,
    trim: true
  },
  
  // Input Parameters
  inputParameters: {
    footingType: {
      type: String,
      enum: ['Isolated', 'Combined', 'Strip', 'Raft'],
      required: true
    },
    
    columnWidth: {
      type: Number,
      required: true,
      min: 150,
      max: 1000
    },
    
    columnDepth: {
      type: Number,
      required: true,
      min: 150,
      max: 1000
    },
    
    axialLoad: {
      type: Number,
      required: true,
      min: 0
    },
    
    momentX: {
      type: Number,
      default: 0,
      min: 0
    },
    
    momentY: {
      type: Number,
      default: 0,
      min: 0
    },
    
    soilBearingCapacity: {
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
      min: 50,
      max: 100
    }
  },
  
  // Calculated Results
  calculatedResults: {
    // Material Properties
    fck: Number,
    fy: Number,
    
    // Footing Dimensions
    footingLength: Number,
    footingWidth: Number,
    footingDepth: Number,
    footingArea: Number,
    
    // Load Calculations
    selfWeight: Number,
    totalLoad: Number,
    factoredLoad: Number,
    
    // Soil Pressure
    soilPressure: Number,
    maximumSoilPressure: Number,
    minimumSoilPressure: Number,
    
    // Steel Calculations
    requiredSteelAreaX: Number,
    requiredSteelAreaY: Number,
    minimumSteelArea: Number,
    providedSteelAreaX: Number,
    providedSteelAreaY: Number,
    
    // Reinforcement Details
    barSizeX: String,
    barSpacingX: Number,
    barSizeY: String,
    barSpacingY: Number,
    
    // Design Checks
    checks: {
      soilBearingCheck: {
        status: String,
        value: Number,
        limit: Number
      },
      minimumSteelCheck: {
        status: String,
        value: Number,
        requirement: Number
      },
      punchingShearCheck: {
        status: String,
        value: Number,
        limit: Number
      },
      oneWayShearCheck: {
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
footingDesignSchema.index({ projectId: 1, userId: 1 });
footingDesignSchema.index({ createdAt: -1 });

// Virtual for footing aspect ratio
footingDesignSchema.virtual('aspectRatio').get(function() {
  return this.calculatedResults.footingLength / this.calculatedResults.footingWidth;
});

// Virtual for footing volume
footingDesignSchema.virtual('footingVolume').get(function() {
  return this.calculatedResults.footingLength * this.calculatedResults.footingWidth * this.calculatedResults.footingDepth;
});

export default mongoose.model('FootingDesign', footingDesignSchema);

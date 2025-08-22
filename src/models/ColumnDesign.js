import mongoose from 'mongoose';

const columnDesignSchema = new mongoose.Schema({
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
  
  // Column Identification
  columnId: {
    type: String,
    required: true,
    trim: true
  },
  
  // Input Parameters
  inputParameters: {
    columnType: {
      type: String,
      enum: ['Axial Load Only', 'Uniaxial Bending', 'Biaxial Bending'],
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
    
    effectiveLength: {
      type: Number,
      required: true,
      min: 0.5,
      max: 20
    },
    
    axialLoad: {
      type: Number,
      required: true,
      min: 0
    },
    
    moment: {
      type: Number,
      default: 0,
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
      max: 75
    },
    
    numberOfBars: {
      type: Number,
      min: 4,
      max: 20
    },
    
    barDiameter: {
      type: Number,
      enum: [8, 10, 12, 16, 20, 25, 32, 40]
    }
  },
  
  // Calculated Results
  calculatedResults: {
    // Material Properties
    fck: {
      type: Number,
      required: true
    },
    
    fy: {
      type: Number,
      required: true
    },
    
    // Geometric Properties
    grossArea: Number,
    effectiveArea: Number,
    slendernessRatio: Number,
    
    // Load Calculations
    factoredAxialLoad: Number,
    factoredMoment: Number,
    eccentricity: Number,
    
    // Steel Calculations
    requiredSteelArea: Number,
    minimumSteelArea: Number,
    maximumSteelArea: Number,
    providedSteelArea: Number,
    steelPercentage: Number,
    
    // Design Checks
    checks: {
      slendernessCheck: {
        status: String,
        value: Number,
        limit: Number
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
      axialLoadCapacity: {
        status: String,
        value: Number,
        requirement: Number
      },
      momentCapacity: {
        status: String,
        value: Number,
        requirement: Number
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
columnDesignSchema.index({ projectId: 1, userId: 1 });
columnDesignSchema.index({ createdAt: -1 });

// Virtual for column aspect ratio
columnDesignSchema.virtual('aspectRatio').get(function() {
  return this.inputParameters.columnDepth / this.inputParameters.columnWidth;
});

// Virtual for column area
columnDesignSchema.virtual('columnArea').get(function() {
  return this.inputParameters.columnWidth * this.inputParameters.columnDepth;
});

export default mongoose.model('ColumnDesign', columnDesignSchema);

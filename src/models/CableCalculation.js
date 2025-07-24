import mongoose from 'mongoose';

const CableCalculationSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    projectId: {
      type: String,
      required: true
    },
    circuitName: {
      type: String,
      default: 'Single Circuit'
    },
    loadWatts: {
      type: Number,
      required: true
    },
    cableLengthMeters: {
      type: Number,
      required: true
    },
    voltage: {
      type: Number,
      default: 230
    },
    result: {
      current: Number,
      recommendedCableSize: String,
      mcb: String,
      voltageDrop: Number,
      voltageDropLimit: Number,
      isDropAcceptable: Boolean,
      voltageDropPercentage: Number,
      calculations: {
        loadWatts: Number,
        cableLengthMeters: Number,
        voltage: Number,
        resistance: Number
      }
    },
    formData: {
      loadWatts: String,
      cableLengthMeters: String,
      voltage: Number
    },
    bulkMode: {
      type: Boolean,
      default: false
    },
    bulkCircuits: [{
      circuitName: String,
      loadWatts: String,
      cableLengthMeters: String,
      voltage: Number
    }]
  },
  { timestamps: true }
);

export default mongoose.model('CableCalculation', CableCalculationSchema);

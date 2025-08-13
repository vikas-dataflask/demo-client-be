import mongoose from "mongoose";

const wallSchema = new mongoose.Schema(
  {
    projectId: {
      type: String,
      required: true,
    },
    floorId: {
      type: String,
      required: true,
    },
    start: {
      x: {
        type: Number,
        required: true,
      },
      y: {
        type: Number,
        required: true,
      },
    },
    end: {
      x: {
        type: Number,
        required: true,
      },
      y: {
        type: Number,
        required: true,
      },
    },
    thickness: {
      type: Number,
      default: 200, // in mm
      min: 50,
      max: 1000,
    },
    height: {
      type: Number,
      default: 3000, // in mm
      min: 1000,
      max: 10000,
    },
    type: {
      type: String,
      enum: ["Partition", "Load-bearing", "Glass", "Exterior"],
      default: "Partition",
    },
    material: {
      type: String,
      default: "Brick",
    },
    connectedRooms: [{
      type: String, // Room IDs
      required: true,
    }],
    doors: [{
      id: String,
      position: Number, // Position along wall (0-1)
      width: Number,
      height: Number,
    }],
    windows: [{
      id: String,
      position: Number, // Position along wall (0-1)
      width: Number,
      height: Number,
    }],
    isActive: {
      type: Boolean,
      default: true,
    },
    createdBy: {
      type: String,
      required: true,
    },
  },
  { 
    timestamps: true,
    // Add compound index for efficient wall lookup
    indexes: [
      { projectId: 1, floorId: 1 },
      { "connectedRooms": 1 },
      { projectId: 1, floorId: 1, "start.x": 1, "start.y": 1, "end.x": 1, "end.y": 1 }
    ]
  }
);

// Pre-save middleware to normalize wall direction for consistent comparison
wallSchema.pre('save', function(next) {
  // Normalize wall direction so start is always "smaller" than end
  // This ensures consistent wall comparison regardless of drawing direction
  const startX = Math.min(this.start.x, this.end.x);
  const startY = Math.min(this.start.y, this.end.y);
  const endX = Math.max(this.start.x, this.end.x);
  const endY = Math.max(this.start.y, this.end.y);
  
  this.start = { x: startX, y: startY };
  this.end = { x: endX, y: endY };
  
  next();
});

// Static method to find shared walls
wallSchema.statics.findSharedWall = function(projectId, floorId, start, end) {
  // Normalize the input coordinates
  const startX = Math.min(start.x, end.x);
  const startY = Math.min(start.y, end.y);
  const endX = Math.max(start.x, end.x);
  const endY = Math.max(start.y, end.y);
  
  return this.findOne({
    projectId,
    floorId,
    "start.x": startX,
    "start.y": startY,
    "end.x": endX,
    "end.y": endY,
    isActive: true
  });
};

// Instance method to check if wall is shared
wallSchema.methods.isShared = function() {
  return this.connectedRooms.length > 1;
};

// Instance method to add room to connected rooms
wallSchema.methods.addRoom = function(roomId) {
  if (!this.connectedRooms.includes(roomId)) {
    this.connectedRooms.push(roomId);
  }
  return this;
};

// Instance method to remove room from connected rooms
wallSchema.methods.removeRoom = function(roomId) {
  this.connectedRooms = this.connectedRooms.filter(id => id !== roomId);
  return this;
};

export default mongoose.model("Wall", wallSchema); 
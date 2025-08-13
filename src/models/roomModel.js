import mongoose from "mongoose";

const roomSchema = new mongoose.Schema({
  id: {
    type: String,
    required: true,
    unique: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    default: ""
  },
  floorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Floor",
    required: true,
    index: true
  },
  projectId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Project",
    required: true,
    index: true
  },
  geometry: {
    x: {
      type: Number,
      required: true,
      default: 0
    },
    y: {
      type: Number,
      required: true,
      default: 0
    },
    width: {
      type: Number,
      required: true,
      default: 0
    },
    height: {
      type: Number,
      required: true,
      default: 0
    },
    area: {
      type: Number,
      default: 0
    }
  },
  shape: {
    type: String,
    enum: ["rectangle", "polygon"],
    default: "rectangle"
  },
  roomType: {
    type: String,
    default: "Residential"
  },
  wallThickness: {
    type: Number,
    default: 0.2 // in meters
  },
  falseCeiling: {
    type: String,
    default: ""
  },
  walls: [
    {
      id: {
        type: String,
        required: true
      },
      start: {
        x: {
          type: Number,
          required: true
        },
        y: {
          type: Number,
          required: true
        }
      },
      end: {
        x: {
          type: Number,
          required: true
        },
        y: {
          type: Number,
          required: true
        }
      },
      thickness: {
        type: Number,
        default: 0.2 // in meters
      },
      height: {
        type: Number,
        default: 3000 // in mm
      },
      type: {
        type: String,
        enum: ["Partition", "Load-bearing", "Glass", "Exterior"],
        default: "Partition"
      },
      material: {
        type: String,
        default: "Brick"
      },
      sharedWithRoomId: {
        type: String,
        default: null
      },
      isShared: {
        type: Boolean,
        default: false
      }
    }
  ],
  doors: [
    {
      id: {
        type: String,
        required: true
      },
      wallId: {
        type: String,
        required: true
      },
      position: {
        type: Number,
        required: true,
        min: 0,
        max: 1 // Position along wall (0-1)
      },
      width: {
        type: Number,
        required: true,
        default: 900 // in mm
      },
      height: {
        type: Number,
        required: true,
        default: 2100 // in mm
      },
      sillHeight: {
        type: Number,
        default: 0 // in mm
      },
      type: {
        type: String,
        enum: ["Single", "Double", "Sliding", "Folding", "Revolving"],
        default: "Single"
      },
      material: {
        type: String,
        default: "Wood"
      },
      direction: {
        type: String,
        enum: ["Left", "Right", "Both"],
        default: "Left"
      }
    }
  ],
  windows: [
    {
      id: {
        type: String,
        required: true
      },
      wallId: {
        type: String,
        required: true
      },
      position: {
        type: Number,
        required: true,
        min: 0,
        max: 1 // Position along wall (0-1)
      },
      width: {
        type: Number,
        required: true,
        default: 1200 // in mm
      },
      height: {
        type: Number,
        required: true,
        default: 1200 // in mm
      },
      sillHeight: {
        type: Number,
        required: true,
        default: 900 // in mm
      },
      type: {
        type: String,
        enum: ["Single", "Double", "D-glass", "Ventilation", "Fixed", "Sliding"],
        default: "Single"
      },
      material: {
        type: String,
        default: "Aluminum"
      },
      glazing: {
        type: String,
        enum: ["Single", "Double", "Triple"],
        default: "Double"
      }
    }
  ],
  isActive: {
    type: Boolean,
    default: true
  },
  createdBy: {
    type: String,
    required: true
  }
}, {
  timestamps: true
});

// Indexes for efficient queries
roomSchema.index({ floorId: 1, isActive: 1 });
roomSchema.index({ projectId: 1, floorId: 1 });
roomSchema.index({ "walls.sharedWithRoomId": 1 });
roomSchema.index({ "doors.wallId": 1 });
roomSchema.index({ "windows.wallId": 1 });

// Pre-save middleware to calculate area and normalize geometry
roomSchema.pre('save', function(next) {
  // Calculate area from geometry
  if (this.geometry && this.geometry.width && this.geometry.height) {
    this.geometry.area = this.geometry.width * this.geometry.height;
  }
  
  // Ensure geometry coordinates are positive
  if (this.geometry) {
    this.geometry.x = Math.max(0, this.geometry.x);
    this.geometry.y = Math.max(0, this.geometry.y);
    this.geometry.width = Math.max(0, this.geometry.width);
    this.geometry.height = Math.max(0, this.geometry.height);
  }
  
  next();
});

// Static method to generate walls from room geometry
roomSchema.statics.generateWallsFromGeometry = function(geometry, wallThickness = 200) {
  const { x, y, width, height } = geometry;
  
  return [
    {
      id: `wall-${Date.now()}-1`,
      start: { x, y },
      end: { x: x + width, y },
      thickness: wallThickness,
      type: "Partition",
      material: "Brick",
      isShared: false
    },
    {
      id: `wall-${Date.now()}-2`,
      start: { x: x + width, y },
      end: { x: x + width, y: y + height },
      thickness: wallThickness,
      type: "Partition",
      material: "Brick",
      isShared: false
    },
    {
      id: `wall-${Date.now()}-3`,
      start: { x: x + width, y: y + height },
      end: { x, y: y + height },
      thickness: wallThickness,
      type: "Partition",
      material: "Brick",
      isShared: false
    },
    {
      id: `wall-${Date.now()}-4`,
      start: { x, y: y + height },
      end: { x, y },
      thickness: wallThickness,
      type: "Partition",
      material: "Brick",
      isShared: false
    }
  ];
};

// Instance method to add a wall
roomSchema.methods.addWall = function(wallData) {
  const wall = {
    id: wallData.id || `wall-${Date.now()}-${this.walls.length + 1}`,
    start: wallData.start,
    end: wallData.end,
    thickness: wallData.thickness || this.wallThickness,
    height: wallData.height || 3000,
    type: wallData.type || "Partition",
    material: wallData.material || "Brick",
    sharedWithRoomId: wallData.sharedWithRoomId || null,
    isShared: !!wallData.sharedWithRoomId
  };
  
  this.walls.push(wall);
  return wall;
};

// Instance method to add a door
roomSchema.methods.addDoor = function(doorData) {
  const door = {
    id: doorData.id || `door-${Date.now()}-${this.doors.length + 1}`,
    wallId: doorData.wallId,
    position: doorData.position,
    width: doorData.width || 900,
    height: doorData.height || 2100,
    sillHeight: doorData.sillHeight || 0,
    type: doorData.type || "Single",
    material: doorData.material || "Wood",
    direction: doorData.direction || "Left"
  };
  
  this.doors.push(door);
  return door;
};

// Instance method to add a window
roomSchema.methods.addWindow = function(windowData) {
  const window = {
    id: windowData.id || `window-${Date.now()}-${this.windows.length + 1}`,
    wallId: windowData.wallId,
    position: windowData.position,
    width: windowData.width || 1200,
    height: windowData.height || 1200,
    sillHeight: windowData.sillHeight || 900,
    type: windowData.type || "Single",
    material: windowData.material || "Aluminum",
    glazing: windowData.glazing || "Double"
  };
  
  this.windows.push(window);
  return window;
};

// Instance method to find wall by ID
roomSchema.methods.findWallById = function(wallId) {
  return this.walls.find(wall => wall.id === wallId);
};

// Instance method to find door by ID
roomSchema.methods.findDoorById = function(doorId) {
  return this.doors.find(door => door.id === doorId);
};

// Instance method to find window by ID
roomSchema.methods.findWindowById = function(windowId) {
  return this.windows.find(window => window.id === windowId);
};

// Instance method to remove wall
roomSchema.methods.removeWall = function(wallId) {
  this.walls = this.walls.filter(wall => wall.id !== wallId);
  // Also remove associated doors and windows
  this.doors = this.doors.filter(door => door.wallId !== wallId);
  this.windows = this.windows.filter(window => window.wallId !== wallId);
  return this;
};

// Instance method to remove door
roomSchema.methods.removeDoor = function(doorId) {
  this.doors = this.doors.filter(door => door.id !== doorId);
  return this;
};

// Instance method to remove window
roomSchema.methods.removeWindow = function(windowId) {
  this.windows = this.windows.filter(window => window.id !== windowId);
  return this;
};

// Instance method to mark wall as shared
roomSchema.methods.markWallAsShared = function(wallId, sharedWithRoomId) {
  const wall = this.findWallById(wallId);
  if (wall) {
    wall.sharedWithRoomId = sharedWithRoomId;
    wall.isShared = true;
  }
  return this;
};

export default mongoose.model("Room", roomSchema); 
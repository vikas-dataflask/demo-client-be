import Door from "../models/doorModel.js";
import { asyncHandler } from "../middleware/asyncHandler.js";

// Create a new door
export const createDoor = asyncHandler(async (req, res) => {
  const { 
    projectId, 
    floorId, 
    roomId, 
    wallId, 
    position, 
    width, 
    height, 
    doorType, 
    material, 
    direction 
  } = req.body;
  
  const door = new Door({
    projectId,
    floorId,
    roomId,
    wallId,
    position,
    width: width || 900,
    height: height || 2100,
    doorType: doorType || "Single",
    material: material || "Wood",
    direction: direction || "Left",
    createdBy: req.user?.id || "system"
  });
  
  await door.save();
  
  res.status(201).json({
    success: true,
    data: door,
    message: "Door created successfully"
  });
});

// Get doors for a specific room
export const getDoorsByRoom = asyncHandler(async (req, res) => {
  const { roomId } = req.params;
  const { projectId, floorId } = req.query;
  
  const doors = await Door.find({
    roomId,
    projectId,
    floorId,
    isActive: true
  }).sort({ createdAt: -1 });
  
  res.status(200).json({
    success: true,
    data: doors,
    count: doors.length
  });
});

// Get doors for a specific wall
export const getDoorsByWall = asyncHandler(async (req, res) => {
  const { wallId } = req.params;
  
  const doors = await Door.find({
    wallId,
    isActive: true
  }).sort({ createdAt: -1 });
  
  res.status(200).json({
    success: true,
    data: doors,
    count: doors.length
  });
});

// Get a specific door by ID
export const getDoorById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  
  const door = await Door.findById(id);
  
  if (!door) {
    return res.status(404).json({
      success: false,
      message: "Door not found"
    });
  }
  
  res.status(200).json({
    success: true,
    data: door
  });
});

// Update door properties
export const updateDoor = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const updates = req.body;
  
  const door = await Door.findByIdAndUpdate(
    id,
    { ...updates, updatedAt: Date.now() },
    { new: true, runValidators: true }
  );
  
  if (!door) {
    return res.status(404).json({
      success: false,
      message: "Door not found"
    });
  }
  
  res.status(200).json({
    success: true,
    data: door,
    message: "Door updated successfully"
  });
});

// Delete door
export const deleteDoor = asyncHandler(async (req, res) => {
  const { id } = req.params;
  
  const door = await Door.findByIdAndUpdate(
    id,
    { isActive: false },
    { new: true }
  );
  
  if (!door) {
    return res.status(404).json({
      success: false,
      message: "Door not found"
    });
  }
  
  res.status(200).json({
    success: true,
    message: "Door deleted successfully"
  });
}); 
import Window from "../models/windowModel.js";
import { asyncHandler } from "../middleware/asyncHandler.js";

// Create a new window
export const createWindow = asyncHandler(async (req, res) => {
  const { 
    projectId, 
    floorId, 
    roomId, 
    wallId, 
    position, 
    width, 
    height, 
    sillHeight,
    windowType, 
    material, 
    glazing 
  } = req.body;
  
  const window = new Window({
    projectId,
    floorId,
    roomId,
    wallId,
    position,
    width: width || 1200,
    height: height || 1200,
    sillHeight: sillHeight || 900,
    windowType: windowType || "Single",
    material: material || "Aluminum",
    glazing: glazing || "Double",
    createdBy: req.user?.id || "system"
  });
  
  await window.save();
  
  res.status(201).json({
    success: true,
    data: window,
    message: "Window created successfully"
  });
});

// Get windows for a specific room
export const getWindowsByRoom = asyncHandler(async (req, res) => {
  const { roomId } = req.params;
  const { projectId, floorId } = req.query;
  
  const windows = await Window.find({
    roomId,
    projectId,
    floorId,
    isActive: true
  }).sort({ createdAt: -1 });
  
  res.status(200).json({
    success: true,
    data: windows,
    count: windows.length
  });
});

// Get windows for a specific wall
export const getWindowsByWall = asyncHandler(async (req, res) => {
  const { wallId } = req.params;
  
  const windows = await Window.find({
    wallId,
    isActive: true
  }).sort({ createdAt: -1 });
  
  res.status(200).json({
    success: true,
    data: windows,
    count: windows.length
  });
});

// Get a specific window by ID
export const getWindowById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  
  const window = await Window.findById(id);
  
  if (!window) {
    return res.status(404).json({
      success: false,
      message: "Window not found"
    });
  }
  
  res.status(200).json({
    success: true,
    data: window
  });
});

// Update window properties
export const updateWindow = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const updates = req.body;
  
  const window = await Window.findByIdAndUpdate(
    id,
    { ...updates, updatedAt: Date.now() },
    { new: true, runValidators: true }
  );
  
  if (!window) {
    return res.status(404).json({
      success: false,
      message: "Window not found"
    });
  }
  
  res.status(200).json({
    success: true,
    data: window,
    message: "Window updated successfully"
  });
});

// Delete window
export const deleteWindow = asyncHandler(async (req, res) => {
  const { id } = req.params;
  
  const window = await Window.findByIdAndUpdate(
    id,
    { isActive: false },
    { new: true }
  );
  
  if (!window) {
    return res.status(404).json({
      success: false,
      message: "Window not found"
    });
  }
  
  res.status(200).json({
    success: true,
    message: "Window deleted successfully"
  });
}); 
import Room from "../models/roomModel.js";
import Floor from "../models/floorModel.js";
import Project from "../models/projectModel.js";
import { asyncHandler } from "../middleware/asyncHandler.js";

// Create a new room with comprehensive data
export const createRoom = asyncHandler(async (req, res) => {
  const { 
    name, 
    description, 
    floorId, 
    projectId,
    geometry, 
    shape, 
    roomType, 
    wallThickness, 
    falseCeiling,
    walls,
    doors,
    windows,
    autoGenerateWalls = true
  } = req.body;
  
  console.log('roomController: Creating room with data:', req.body);
  
  // Validate required fields
  if (!name || !floorId || !projectId || !geometry) {
    return res.status(400).json({
      success: false,
      message: "Missing required fields: name, floorId, projectId, and geometry are required"
    });
  }

  // Validate project exists and user has access
  const project = await Project.findById(projectId);
  if (!project) {
    return res.status(404).json({
      success: false,
      message: "Project not found"
    });
  }

  // Validate floor exists and belongs to the project
  const floor = await Floor.findById(floorId);
  if (!floor) {
    return res.status(404).json({
      success: false,
      message: "Floor not found"
    });
  }

  if (floor.projectId.toString() !== projectId) {
    return res.status(400).json({
      success: false,
      message: "Floor does not belong to the specified project"
    });
  }

  // Validate geometry
  if (!geometry.x || !geometry.y || !geometry.width || !geometry.height) {
    return res.status(400).json({
      success: false,
      message: "Invalid geometry: x, y, width, and height are required"
    });
  }

  // Check for duplicate room names on the same floor
  const existingRoom = await Room.findOne({ 
    floorId, 
    name: name.trim(),
    isActive: true 
  });
  
  if (existingRoom) {
    return res.status(409).json({
      success: false,
      message: `A room with name "${name}" already exists on this floor`
    });
  }
  
  // Generate unique room ID
  const roomId = `room-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  
  const roomData = {
    id: roomId,
    name: name.trim(),
    description: description || '',
    floorId,
    projectId,
    geometry: {
      x: geometry.x,
      y: geometry.y,
      width: geometry.width,
      height: geometry.height,
      area: geometry.area || (geometry.width * geometry.height)
    },
    shape: shape || 'rectangle',
    roomType: roomType || 'Residential',
    wallThickness: wallThickness || 0.2, // Convert to meters
    falseCeiling: falseCeiling || '',
    walls: walls || [],
    doors: doors || [],
    windows: windows || [],
    createdBy: "system"
  };

  // Auto-generate walls if requested and geometry is provided
  if (autoGenerateWalls && geometry && geometry.width && geometry.height) {
    roomData.walls = Room.generateWallsFromGeometry(geometry, wallThickness || 0.2);
  }

  console.log('roomController: Creating room with processed data:', roomData);

  const room = new Room(roomData);
  const savedRoom = await room.save();
  
  console.log('roomController: Room created successfully:', savedRoom.id);
  
  res.status(201).json({
    success: true,
    data: savedRoom,
    message: "Room created successfully"
  });
});

// Get all rooms for a specific floor
export const getRoomsByFloor = asyncHandler(async (req, res) => {
  const { floorId } = req.query; // Changed from req.params to req.query
  
  console.log('roomController: Getting rooms for floor:', floorId);
  console.log('roomController: Request query:', req.query);
  console.log('roomController: Request params:', req.params);
  console.log('roomController: Request body:', req.body);
  
  if (!floorId) {
    console.log('roomController: floorId is missing');
    return res.status(400).json({
      success: false,
      message: "floorId is required"
    });
  }

  try {
    console.log('roomController: Searching for rooms with floorId:', floorId);
    const rooms = await Room.find({ 
      floorId,
      isActive: true 
    }).sort({ createdAt: -1 });

    console.log('roomController: Found', rooms.length, 'rooms for floor:', floorId);
    console.log('roomController: Room IDs:', rooms.map(r => r.id));

    res.status(200).json({
      success: true,
      data: rooms,
      count: rooms.length
    });
  } catch (error) {
    console.error('roomController: Error fetching rooms for floor:', floorId, error);
    res.status(500).json({
      success: false,
      message: "Error fetching rooms",
      error: error.message
    });
  }
});

// Get a specific room by ID with full details
export const getRoomById = asyncHandler(async (req, res) => {
  const { roomId } = req.params;
  
  const room = await Room.findOne({ id: roomId, isActive: true });
  
  if (!room) {
    return res.status(404).json({
      success: false,
      message: "Room not found"
    });
  }

  res.status(200).json({
    success: true,
    data: room
  });
});

// Update room properties (comprehensive update)
export const updateRoom = asyncHandler(async (req, res) => {
  const { roomId } = req.params;
  const updates = req.body;
  
  const room = await Room.findOne({ id: roomId, isActive: true });
  
  if (!room) {
    return res.status(404).json({
      success: false,
      message: "Room not found"
    });
  }

  // Update basic properties
  if (updates.name !== undefined) room.name = updates.name;
  if (updates.description !== undefined) room.description = updates.description;
  if (updates.roomType !== undefined) room.roomType = updates.roomType;
  if (updates.wallThickness !== undefined) room.wallThickness = updates.wallThickness;
  if (updates.falseCeiling !== undefined) room.falseCeiling = updates.falseCeiling;
  
  // Update geometry
  if (updates.geometry) {
    room.geometry = { ...room.geometry, ...updates.geometry };
  }
  
  // Update shape
  if (updates.shape) room.shape = updates.shape;

  const updatedRoom = await room.save();

  res.status(200).json({
    success: true,
    data: updatedRoom,
    message: "Room updated successfully"
  });
});

// Add wall to room
export const addWallToRoom = asyncHandler(async (req, res) => {
  const { roomId } = req.params;
  const wallData = req.body;
  
  const room = await Room.findOne({ id: roomId, isActive: true });
  
  if (!room) {
    return res.status(404).json({
      success: false,
      message: "Room not found"
    });
  }

  const newWall = room.addWall(wallData);
  await room.save();

  res.status(200).json({
    success: true,
    data: newWall,
    message: "Wall added successfully"
  });
});

// Add door to room
export const addDoorToRoom = asyncHandler(async (req, res) => {
  const { roomId } = req.params;
  const doorData = req.body;
  
  const room = await Room.findOne({ id: roomId, isActive: true });
  
  if (!room) {
    return res.status(404).json({
      success: false,
      message: "Room not found"
    });
  }

  // Verify wall exists
  const wall = room.findWallById(doorData.wallId);
  if (!wall) {
    return res.status(400).json({
      success: false,
      message: "Wall not found"
    });
  }

  const newDoor = room.addDoor(doorData);
  await room.save();

  res.status(200).json({
    success: true,
    data: newDoor,
    message: "Door added successfully"
  });
});

// Add window to room
export const addWindowToRoom = asyncHandler(async (req, res) => {
  const { roomId } = req.params;
  const windowData = req.body;
  
  const room = await Room.findOne({ id: roomId, isActive: true });
  
  if (!room) {
    return res.status(404).json({
      success: false,
      message: "Room not found"
    });
  }

  // Verify wall exists
  const wall = room.findWallById(windowData.wallId);
  if (!wall) {
    return res.status(400).json({
      success: false,
      message: "Wall not found"
    });
  }

  const newWindow = room.addWindow(windowData);
  await room.save();

  res.status(200).json({
    success: true,
    data: newWindow,
    message: "Window added successfully"
  });
});

// Update wall in room
export const updateWallInRoom = asyncHandler(async (req, res) => {
  const { roomId, wallId } = req.params;
  const updates = req.body;
  
  const room = await Room.findOne({ id: roomId, isActive: true });
  
  if (!room) {
    return res.status(404).json({
      success: false,
      message: "Room not found"
    });
  }

  const wall = room.findWallById(wallId);
  if (!wall) {
    return res.status(404).json({
      success: false,
      message: "Wall not found"
    });
  }

  // Update wall properties
  Object.assign(wall, updates);
  await room.save();

  res.status(200).json({
    success: true,
    data: wall,
    message: "Wall updated successfully"
  });
});

// Update door in room
export const updateDoorInRoom = asyncHandler(async (req, res) => {
  const { roomId, doorId } = req.params;
  const updates = req.body;
  
  const room = await Room.findOne({ id: roomId, isActive: true });
  
  if (!room) {
    return res.status(404).json({
      success: false,
      message: "Room not found"
    });
  }

  const door = room.findDoorById(doorId);
  if (!door) {
    return res.status(404).json({
      success: false,
      message: "Door not found"
    });
  }

  // Update door properties
  Object.assign(door, updates);
  await room.save();

  res.status(200).json({
    success: true,
    data: door,
    message: "Door updated successfully"
  });
});

// Update window in room
export const updateWindowInRoom = asyncHandler(async (req, res) => {
  const { roomId, windowId } = req.params;
  const updates = req.body;
  
  const room = await Room.findOne({ id: roomId, isActive: true });
  
  if (!room) {
    return res.status(404).json({
      success: false,
      message: "Room not found"
    });
  }

  const window = room.findWindowById(windowId);
  if (!window) {
    return res.status(404).json({
      success: false,
      message: "Window not found"
    });
  }

  // Update window properties
  Object.assign(window, updates);
  await room.save();

  res.status(200).json({
    success: true,
    data: window,
    message: "Window updated successfully"
  });
});

// Remove wall from room
export const removeWallFromRoom = asyncHandler(async (req, res) => {
  const { roomId, wallId } = req.params;
  
  const room = await Room.findOne({ id: roomId, isActive: true });
  
  if (!room) {
    return res.status(404).json({
      success: false,
      message: "Room not found"
    });
  }

  room.removeWall(wallId);
  await room.save();

  res.status(200).json({
    success: true,
    message: "Wall removed successfully"
  });
});

// Remove door from room
export const removeDoorFromRoom = asyncHandler(async (req, res) => {
  const { roomId, doorId } = req.params;
  
  const room = await Room.findOne({ id: roomId, isActive: true });
  
  if (!room) {
    return res.status(404).json({
      success: false,
      message: "Room not found"
    });
  }

  room.removeDoor(doorId);
  await room.save();

  res.status(200).json({
    success: true,
    message: "Door removed successfully"
  });
});

// Remove window from room
export const removeWindowFromRoom = asyncHandler(async (req, res) => {
  const { roomId, windowId } = req.params;
  
  const room = await Room.findOne({ id: roomId, isActive: true });
  
  if (!room) {
    return res.status(404).json({
      success: false,
      message: "Room not found"
    });
  }

  room.removeWindow(windowId);
  await room.save();

  res.status(200).json({
    success: true,
    message: "Window removed successfully"
  });
});

// Mark wall as shared between rooms
export const markWallAsShared = asyncHandler(async (req, res) => {
  const { roomId, wallId } = req.params;
  const { sharedWithRoomId } = req.body;
  
  const room = await Room.findOne({ id: roomId, isActive: true });
  
  if (!room) {
    return res.status(404).json({
      success: false,
      message: "Room not found"
    });
  }

  room.markWallAsShared(wallId, sharedWithRoomId);
  await room.save();

  res.status(200).json({
    success: true,
    message: "Wall marked as shared successfully"
  });
});

// Delete room (soft delete)
export const deleteRoom = asyncHandler(async (req, res) => {
  const { roomId } = req.params;
  
  const room = await Room.findOne({ id: roomId, isActive: true });
  
  if (!room) {
    return res.status(404).json({
      success: false,
      message: "Room not found"
    });
  }

  room.isActive = false;
  await room.save();

  res.status(200).json({
    success: true,
    message: "Room deleted successfully"
  });
});

// Get rooms with shared walls
export const getRoomsWithSharedWalls = asyncHandler(async (req, res) => {
  const { floorId } = req.params;
  
  const rooms = await Room.find({
    floorId,
    isActive: true,
    "walls.isShared": true
  }).populate('walls');

  res.status(200).json({
    success: true,
    data: rooms,
    count: rooms.length
  });
});

// Generate walls from room geometry
export const generateWallsFromGeometry = asyncHandler(async (req, res) => {
  const { roomId } = req.params;
  const { wallThickness } = req.body;
  
  const room = await Room.findOne({ id: roomId, isActive: true });
  
  if (!room) {
    return res.status(404).json({
      success: false,
      message: "Room not found"
    });
  }

  if (!room.geometry || !room.geometry.width || !room.geometry.height) {
    return res.status(400).json({
      success: false,
      message: "Room geometry is required"
    });
  }

  const generatedWalls = Room.generateWallsFromGeometry(room.geometry, wallThickness || room.wallThickness);
  
  // Replace existing walls with generated ones
  room.walls = generatedWalls;
  await room.save();

  res.status(200).json({
    success: true,
    data: generatedWalls,
    message: "Walls generated successfully"
  });
}); 
import Wall from "../models/wallModel.js";
import { asyncHandler } from "../middleware/asyncHandler.js";

// Create a new wall
export const createWall = asyncHandler(async (req, res) => {
  const { projectId, floorId, start, end, thickness, height, type, material, connectedRooms } = req.body;
  
  // Check if a wall with the same coordinates already exists
  const existingWall = await Wall.findSharedWall(projectId, floorId, start, end);
  
  if (existingWall) {
    // Add the new room to the existing wall's connected rooms
    existingWall.addRoom(connectedRooms[0]);
    await existingWall.save();
    
    return res.status(200).json({
      success: true,
      data: existingWall,
      message: "Room added to existing shared wall"
    });
  }
  
  // Create new wall
  const wall = new Wall({
    projectId,
    floorId,
    start,
    end,
    thickness: thickness || 200,
    height: height || 3000,
    type: type || "Partition",
    material: material || "Brick",
    connectedRooms,
    createdBy: req.user?.id || "system" // Use system if no user context
  });
  
  await wall.save();
  
  res.status(201).json({
    success: true,
    data: wall,
    message: "Wall created successfully"
  });
});

// Get walls for a specific room
export const getWallsByRoom = asyncHandler(async (req, res) => {
  const { roomId } = req.params;
  const { projectId, floorId } = req.query;
  
  const walls = await Wall.find({
    projectId,
    floorId,
    connectedRooms: roomId,
    isActive: true
  });
  
  res.status(200).json({
    success: true,
    data: walls,
    count: walls.length
  });
});

// Get all walls for a floor
export const getWallsByFloor = asyncHandler(async (req, res) => {
  const { projectId, floorId } = req.params;
  
  const walls = await Wall.find({
    projectId,
    floorId,
    isActive: true
  });
  
  res.status(200).json({
    success: true,
    data: walls,
    count: walls.length
  });
});

// Update wall properties
export const updateWall = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { thickness, height, type, material } = req.body;
  
  const wall = await Wall.findById(id);
  
  if (!wall) {
    return res.status(404).json({
      success: false,
      message: "Wall not found"
    });
  }
  
  // Update allowed fields
  if (thickness !== undefined) wall.thickness = thickness;
  if (height !== undefined) wall.height = height;
  if (type !== undefined) wall.type = type;
  if (material !== undefined) wall.material = material;
  
  await wall.save();
  
  res.status(200).json({
    success: true,
    data: wall,
    message: "Wall updated successfully"
  });
});

// Delete wall (only if not shared)
export const deleteWall = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { roomId } = req.body; // Room that wants to remove this wall
  
  const wall = await Wall.findById(id);
  
  if (!wall) {
    return res.status(404).json({
      success: false,
      message: "Wall not found"
    });
  }
  
  // If wall is shared, just remove the room from connected rooms
  if (wall.isShared()) {
    wall.removeRoom(roomId);
    await wall.save();
    
    return res.status(200).json({
      success: true,
      data: wall,
      message: "Room removed from shared wall"
    });
  }
  
  // If wall is not shared, delete it completely
  await Wall.findByIdAndDelete(id);
  
  res.status(200).json({
    success: true,
    message: "Wall deleted successfully"
  });
});

// Process room walls (extract walls from room geometry)
export const processRoomWalls = asyncHandler(async (req, res) => {
  const { projectId, floorId, roomId, roomGeometry } = req.body;
  
  console.log('Processing room walls:', { projectId, floorId, roomId, roomGeometry });
  
  // Extract wall segments from room geometry
  const wallSegments = extractWallSegments(roomGeometry);
  console.log('Extracted wall segments:', wallSegments);
  
  const processedWalls = [];
  
  for (const segment of wallSegments) {
    const { start, end } = segment;
    
    console.log('Processing segment:', { start, end });
    
    // Check if wall already exists
    const existingWall = await Wall.findSharedWall(projectId, floorId, start, end);
    
    if (existingWall) {
      console.log('Found existing wall:', existingWall.id);
      // Add room to existing wall
      existingWall.addRoom(roomId);
      await existingWall.save();
      processedWalls.push(existingWall);
    } else {
      console.log('Creating new wall');
      // Create new wall
      const newWall = new Wall({
        projectId,
        floorId,
        start,
        end,
        connectedRooms: [roomId],
        createdBy: req.user?.id || "system"
      });
      
      await newWall.save();
      console.log('Created new wall:', newWall.id);
      processedWalls.push(newWall);
    }
  }
  
  console.log('Final processed walls:', processedWalls.length);
  
  res.status(200).json({
    success: true,
    data: processedWalls,
    message: `Processed ${processedWalls.length} walls for room ${roomId}`
  });
});

// Helper function to extract wall segments from room geometry
function extractWallSegments(roomGeometry) {
  const segments = [];
  
  if (roomGeometry.shape === 'rectangle') {
    const { x, y, width, height } = roomGeometry;
    
    // Top wall
    segments.push({
      start: { x, y },
      end: { x: x + width, y }
    });
    
    // Right wall
    segments.push({
      start: { x: x + width, y },
      end: { x: x + width, y: y + height }
    });
    
    // Bottom wall
    segments.push({
      start: { x: x + width, y: y + height },
      end: { x, y: y + height }
    });
    
    // Left wall
    segments.push({
      start: { x, y: y + height },
      end: { x, y }
    });
  } else if (roomGeometry.shape === 'polygon' && roomGeometry.points) {
    const points = roomGeometry.points;
    
    for (let i = 0; i < points.length; i++) {
      const start = points[i];
      const end = points[(i + 1) % points.length]; // Connect last point to first
      
      segments.push({ start, end });
    }
  }
  
  return segments;
}

// Get wall statistics for a floor
export const getWallStats = asyncHandler(async (req, res) => {
  const { projectId, floorId } = req.params;
  
  const walls = await Wall.find({
    projectId,
    floorId,
    isActive: true
  });
  
  const stats = {
    totalWalls: walls.length,
    sharedWalls: walls.filter(wall => wall.isShared()).length,
    partitionWalls: walls.filter(wall => wall.type === 'Partition').length,
    loadBearingWalls: walls.filter(wall => wall.type === 'Load-bearing').length,
    glassWalls: walls.filter(wall => wall.type === 'Glass').length,
    exteriorWalls: walls.filter(wall => wall.type === 'Exterior').length,
    totalLength: walls.reduce((sum, wall) => {
      const length = Math.sqrt(
        Math.pow(wall.end.x - wall.start.x, 2) + 
        Math.pow(wall.end.y - wall.start.y, 2)
      );
      return sum + length;
    }, 0)
  };
  
  res.status(200).json({
    success: true,
    data: stats
  });
}); 
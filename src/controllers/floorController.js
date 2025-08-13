import Floor from "../models/floorModel.js";
import Project from "../models/projectModel.js";

// Create new floor
export const createFloor = async (req, res) => {
  try {
    console.log('🔍 Backend: Received floor creation request');
    console.log('🔍 Backend: Request body:', req.body);
    console.log('🔍 Backend: User ID:', req.user?.id);
    
    const { projectId, name, shape, height, material, slabThickness, level, source, layer, unit, createdBy: bodyCreatedBy } = req.body;
    const createdBy = req.user?.id || bodyCreatedBy; // From auth middleware or request body
    
    // Validate that we have a user ID
    if (!createdBy) {
      console.log('❌ Backend: No user ID found');
      return res.status(401).json({ 
        success: false, 
        message: "User authentication required" 
      });
    }

    // Validate projectId exists
    console.log('🔍 Backend: Looking for project with ID:', projectId);
    const project = await Project.findById(projectId);
    if (!project) {
      console.log('❌ Backend: Project not found');
      return res.status(404).json({ 
        success: false, 
        message: "Project not found" 
      });
    }
    console.log('✅ Backend: Project found:', project.name);

    // Check for duplicate floor name in the same project
    const existingFloor = await Floor.findOne({ projectId, name });
    if (existingFloor) {
      return res.status(400).json({ 
        success: false, 
        message: `Floor with name "${name}" already exists in this project`
      });
    }

    // Validate shape data
    console.log('🔍 Backend: Validating shape data:', shape);
    if (!shape) {
      console.log('❌ Backend: Shape validation failed - shape is missing');
      return res.status(400).json({ 
        success: false, 
        message: "Shape data is required" 
      });
    }
    
    if (!shape.width || !shape.height) {
      console.log('❌ Backend: Shape validation failed - missing width or height');
      return res.status(400).json({ 
        success: false, 
        message: "Shape with width and height is required" 
      });
    }
    
    if (shape.width <= 0 || shape.height <= 0) {
      console.log('❌ Backend: Shape validation failed - width and height must be positive');
      return res.status(400).json({ 
        success: false, 
        message: "Shape width and height must be positive values" 
      });
    }
    
    console.log('✅ Backend: Shape validation passed');
    
    // Validate coordinates if shape type is polygon
    if (shape.type === 'polygon' && (!shape.coordinates || shape.coordinates.length < 3)) {
      console.log('❌ Backend: Polygon validation failed - need at least 3 coordinates');
      return res.status(400).json({ 
        success: false, 
        message: "Polygon shape must have at least 3 coordinates" 
      });
    }

    // Create floor
    console.log('🔍 Backend: Creating floor object with data:', {
      projectId,
      name,
      shape,
      height: height || 3.2,
      material: material || "RCC",
      slabThickness: slabThickness || 0.2,
      level: level || 0,
      source: source || "manual",
      layer: layer || "A-FLOR",
      createdBy,
      unit: unit || "m"
    });
    
    const floor = new Floor({
      projectId,
      name,
      shape,
      height: height || 3.2,
      material: material || "RCC",
      slabThickness: slabThickness || 0.2,
      level: level || 0,
      source: source || "manual",
      layer: layer || "A-FLOR",
      createdBy,
      unit: unit || "m"
    });

    console.log('🔍 Backend: Saving floor to database...');
    await floor.save();
    console.log('✅ Backend: Floor saved successfully with ID:', floor._id);

    res.status(201).json({
      success: true,
      message: "Floor created successfully",
      data: floor
    });

  } catch (error) {
    console.error("❌ Backend: Error creating floor:", error);
    console.error("❌ Backend: Error name:", error.name);
    console.error("❌ Backend: Error message:", error.message);
    
    // Handle Mongoose validation errors
    if (error.name === 'ValidationError') {
      const validationErrors = Object.values(error.errors).map(err => err.message);
      console.error("❌ Backend: Validation errors:", validationErrors);
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: validationErrors
      });
    }
    
    // Handle duplicate key errors
    if (error.code === 11000) {
      console.error("❌ Backend: Duplicate key error:", error.keyValue);
      return res.status(400).json({
        success: false,
        message: "Floor with this name already exists in this project"
      });
    }
    
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message
    });
  }
};

// Get all floors for a project
export const getFloorsByProject = async (req, res) => {
  try {
    const { projectId } = req.query;
    const createdBy = req.user.id;

    if (!projectId) {
      return res.status(400).json({
        success: false,
        message: "Project ID is required"
      });
    }

    // Validate project exists and user has access
    console.log('🔍 Backend: Looking for project with ID:', projectId, 'and user:', createdBy);
    const project = await Project.findOne({ _id: projectId, user: createdBy });
    console.log('🔍 Backend: Project found:', project ? 'YES' : 'NO');
    if (!project) {
      console.log('❌ Backend: Project not found or access denied');
      return res.status(404).json({
        success: false,
        message: "Project not found or access denied"
      });
    }

    const floors = await Floor.find({ projectId })
      .sort({ level: 1, createdAt: 1 })
      .populate('createdBy', 'name email');

    console.log('🔍 Backend: Found floors for project:', floors.length);
    console.log('🔍 Backend: Floor details:', floors.map(f => ({ 
      id: f._id, 
      name: f.name, 
      projectId: f.projectId,
      createdBy: f.createdBy 
    })));

    res.status(200).json({
      success: true,
      message: "Floors retrieved successfully",
      data: floors
    });

  } catch (error) {
    console.error("Error fetching floors:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message
    });
  }
};

// Get floor by ID
export const getFloorById = async (req, res) => {
  try {
    const { floorId } = req.params;
    const createdBy = req.user.id;

    const floor = await Floor.findById(floorId)
      .populate('projectId', 'name')
      .populate('createdBy', 'name email');

    if (!floor) {
      return res.status(404).json({
        success: false,
        message: "Floor not found"
      });
    }

    // Check if user has access to the project
    const project = await Project.findOne({ _id: floor.projectId, user: createdBy });
    if (!project) {
      return res.status(403).json({
        success: false,
        message: "Access denied to this floor"
      });
    }

    res.status(200).json({
      success: true,
      message: "Floor retrieved successfully",
      data: floor
    });

  } catch (error) {
    console.error("Error fetching floor:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message
    });
  }
};

// Update floor
export const updateFloor = async (req, res) => {
  try {
    const { floorId } = req.params;
    const { name, shape, height, material, slabThickness, level, source, layer } = req.body;
    const createdBy = req.user.id;

    const floor = await Floor.findById(floorId);
    if (!floor) {
      return res.status(404).json({
        success: false,
        message: "Floor not found"
      });
    }

    // Check if user has access to the project
    const project = await Project.findOne({ _id: floor.projectId, user: createdBy });
    if (!project) {
      return res.status(403).json({
        success: false,
        message: "Access denied to this floor"
      });
    }

    // Check for duplicate name if name is being updated
    if (name && name !== floor.name) {
      const existingFloor = await Floor.findOne({ 
        projectId: floor.projectId, 
        name,
        _id: { $ne: floorId }
      });
      if (existingFloor) {
        return res.status(400).json({
          success: false,
          message: `Floor with name "${name}" already exists in this project`
        });
      }
    }

    // Update floor
    const updatedFloor = await Floor.findByIdAndUpdate(
      floorId,
      {
        name,
        shape,
        height,
        material,
        slabThickness,
        level,
        source,
        layer
      },
      { new: true, runValidators: true }
    ).populate('projectId', 'name')
     .populate('createdBy', 'name email');

    res.status(200).json({
      success: true,
      message: "Floor updated successfully",
      data: updatedFloor
    });

  } catch (error) {
    console.error("Error updating floor:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message
    });
  }
};

// Delete floor
export const deleteFloor = async (req, res) => {
  try {
    const { floorId } = req.params;
    const createdBy = req.user.id;

    const floor = await Floor.findById(floorId);
    if (!floor) {
      return res.status(404).json({
        success: false,
        message: "Floor not found"
      });
    }

    // Check if user has access to the project
    const project = await Project.findOne({ _id: floor.projectId, user: createdBy });
    if (!project) {
      return res.status(403).json({
        success: false,
        message: "Access denied to this floor"
      });
    }

    // TODO: Check if floor has rooms before deleting
    // const roomCount = await Room.countDocuments({ floorId });
    // if (roomCount > 0) {
    //   return res.status(400).json({
    //     success: false,
    //     message: `Cannot delete floor. It contains ${roomCount} room(s)`
    //   });
    // }

    await Floor.findByIdAndDelete(floorId);

    res.status(200).json({
      success: true,
      message: "Floor deleted successfully"
    });

  } catch (error) {
    console.error("Error deleting floor:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message
    });
  }
}; 
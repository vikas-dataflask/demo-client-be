import qeProject from "../models/qeModel.js";
import DxfParser from "dxf-parser";
import { groupLayers } from "../utils/groupLayers.js";

export const createQeProject = async (req, res) => {
  try {
    console.log("=== REQUEST DEBUGGING ===");
    console.log("Request headers:", req.headers);
    console.log("Request body:", req.body);
    console.log("Request file:", req.file);
    console.log("Request files:", req.files);
    console.log("Content-Type:", req.get('Content-Type'));
    console.log("==========================");
    
    const { 
      user, 
      name, 
      service, 
      service_name,
      building_type, 
      building_type_name,
      sub_building_type, 
      sub_building_type_name,
      level, 
      level_name 
    } = req.body;

    // Validate required fields
    if (!user || !name || !service || !building_type || !sub_building_type || !level) {
      return res.status(400).json({
        error: "Missing required fields",
        received: { user, name, service, building_type, sub_building_type, level },
        bodyKeys: Object.keys(req.body || {}),
        bodyType: typeof req.body
      });
    }

    // Use names if provided, otherwise use IDs as fallback
    const serviceName = service_name || service;
    const buildingTypeName = building_type_name || building_type;
    const subBuildingTypeName = sub_building_type_name || sub_building_type;
    const levelName = level_name || level;

    // Handle file processing for memory storage
    let parsedData = null;
    let grouped_layers = {};

    if (req.file) {
      try {
        const parser = new DxfParser();
        // For memory storage, file buffer is in req.file.buffer
        const dxfContents = req.file.buffer.toString('utf-8');
        parsedData = parser.parseSync(dxfContents);
        grouped_layers = groupLayers(parsedData.entities);
        console.log("DXF file parsed successfully");
      } catch (parseErr) {
        console.error("DXF parsing error:", parseErr);
        return res
          .status(400)
          .json({ error: "Invalid DXF file", details: parseErr.message });
      }
    } else {
      console.log("No DXF file uploaded");
    }

    const newQEProjectData = new qeProject({
      user,
      name,
      service: serviceName,
      building_type: buildingTypeName,
      sub_building_type: subBuildingTypeName,
      level: levelName,
      dxf_entities: parsedData?.entities || [],
      grouped_layers,
      extracted_quantities_data: [],
    });

    const newQEProject = new qeProject(newQEProjectData);
    await newQEProject.save();

    console.log("Project saved successfully:", newQEProject._id);

    res.status(201).json({
      message: `${name} successfully created for Quantity Extraction`,
      project: {
        id: newQEProject._id,
        name: newQEProject.name,
        service: newQEProject.service,
        building_type: newQEProject.building_type,
        sub_building_type: newQEProject.sub_building_type,
        level: newQEProject.level
      }
    });
  } catch (err) {
    console.error("Error creating QE project:", err);
    res.status(500).json({ error: err.message });
  }
};

export const listAllQeProjects = async (req, res) => {
  try {
    const userId = req.user.id;

    const qeprojects = await qeProject.find({ user: userId });

    res.status(200).json(qeprojects);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getQeProjectById = async (req, res) => {
  try {
    const projectId = req.params.id;

    const qeproject = await qeProject.findOne({
      _id: projectId,
      user: req.user.id,
    });
    if (!qeproject) {
      return res
        .status(404)
        .json({ error: "Project not found or unauthorized" });
    }
    // MODIFIED: Return both grouped_layers and extracted_quantities_data
    // Prioritize extracted_quantities_data if it exists and has content
    res.status(200).json({
      ...qeproject.toObject(),
      grouped_layers: qeproject.grouped_layers || {},
      extracted_quantities_data: qeproject.extracted_quantities_data || [], // NEW
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const deleteQeProjectData = async (req, res, next) => {
  try {
    console.log("User from token:", req.user);
    const qeprojectId = req.params.id;

    const qeproject = await qeProject.findOne({
      _id: qeprojectId,
      user: req.user.id,
    });

    if (!qeproject) {
      return res.status(404).json({
        error: "Quantity Extraction Project not found or unauthorized",
      });
    }

    await qeproject.deleteOne();

    res.send({
      status: 200,
      message: "Quantity Extraction Project deleted successfully",
    });
  } catch (err) {
    next(err);
  }
};

// ----------------------
export const updateQeProject = async (req, res) => {
  try {
    const projectId = req.params.id;
    const userId = req.user.id;
    // MODIFIED: Destructure extracted_quantities_data from req.body
    const {
      grouped_layers,
      name,
      service,
      building_type,
      level,
      extracted_quantities_data,
    } = req.body;

    // Find the project and ensure it belongs to the user
    const qeproject = await qeProject.findOne({ _id: projectId, user: userId });

    if (!qeproject) {
      return res
        .status(404)
        .json({ error: "Project not found or unauthorized" });
    }

    // Update only the fields that are provided in the request body
    if (grouped_layers) {
      qeproject.grouped_layers = grouped_layers;
    }
    if (name) {
      qeproject.name = name;
    }
    if (service) {
      qeproject.service = service;
    }
    if (building_type) {
      qeproject.building_type = building_type;
    }
    if (level) {
      qeproject.level = level;
    }
    // NEW: Update extracted_quantities_data if provided
    if (extracted_quantities_data) {
      qeproject.extracted_quantities_data = extracted_quantities_data;
    }

    await qeproject.save(); // Save the updated project

    res.status(200).json({
      message: "Project updated successfully",
      project: qeproject,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

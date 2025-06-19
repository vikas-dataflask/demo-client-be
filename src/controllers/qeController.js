// import qeProject from "../models/qeModel.js";
// import path from "path";
// import fs from "fs";
// import DxfParser from "dxf-parser";
// import { groupLayers } from "../utils/groupLayers.js";

// export const createQeProject = async (req, res) => {
//   try {
//     const { user, name, service, building_type, level } = req.body;

//         // Path to the uploaded file
//         const dxfFilePath = req.file
//           ? path.join(req.file.destination, req.file.filename)
//           : null;
    
//         let parsedData = null;
//      let grouped_layers = {};
    
//         if (dxfFilePath) {
//           const parser = new DxfParser();
//           const dxfContents = fs.readFileSync(dxfFilePath, "utf-8");
//           try {
//             parsedData = parser.parseSync(dxfContents);
//               grouped_layers = groupLayers(parsedData.entities); // ✅ group logic

//           } catch (parseErr) {
//             return res
//               .status(400)
//               .json({ error: "Invalid DXF file", details: parseErr.message });
//           }
//         }

//     const newQEProjectData = new qeProject({
//       user,
//       name,
//       service,
//       building_type,
//       level,
//       dxf_entities:parsedData.entities || [],
//       grouped_layers,
        
//     });

//     const newQEProject = new qeProject(newQEProjectData)
//     await newQEProject.save()

//     res.status(201).json({
//       message: `${name} successfully created for Quantity Extraction`,
//     });
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// };

// export const listAllQeProjects = async (req, res) => {
//   try {
//     const userId = req.user.id;

//     const qeprojects = await qeProject.find({ user: userId });

//     res.status(200).json(qeprojects);
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// };

// export const getQeProjectById = async (req, res) => {
//   try {
//     const projectId = req.params.id;

//     const qeproject = await qeProject.findOne({
//       _id: projectId,
//       user: req.user.id,
//     });
//     if (!qeproject) {
//       return res
//         .status(404)
//         .json({ error: "Project not found or unauthorized" });
//     }
//     // res.status(200).json(qeproject);
//      res.status(200).json({
//       ...qeproject.toObject(),
//       grouped_layers: qeproject.grouped_layers || {},
//     });
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// };

// export const deleteQeProjectData = async (req, res, next) => {
//   try {
//     console.log("User from token:", req.user);
//     const qeprojectId = req.params.id;

//     const qeproject = await qeProject.findOne({
//       _id: qeprojectId,
//       user: req.user.id,
//     });

//     if (!qeproject) {
//       return res.status(404).json({
//         error: "Quantity Extraction Project not found or unauthorized",
//       });
//     }

//     await qeproject.deleteOne();

//     res.send({
//       status: 200,
//       message: "Quantity Extraction Project deleted successfully",
//     });
//   } catch (err) {
//     next(err);
//   }
// };

// // ----------------------
// export const updateQeProject = async (req, res) => {
//   try {
//     const projectId = req.params.id;
//     const userId = req.user.id;
//     const { grouped_layers, name, service, building_type, level } = req.body; // Destructure all potentially updatable fields

//     // Find the project and ensure it belongs to the user
//     const qeproject = await qeProject.findOne({ _id: projectId, user: userId });

//     if (!qeproject) {
//       return res
//         .status(404)
//         .json({ error: "Project not found or unauthorized" });
//     }

//     // Update only the fields that are provided in the request body
//     if (grouped_layers) {
//       qeproject.grouped_layers = grouped_layers;
//     }
//     if (name) {
//       qeproject.name = name;
//     }
//     if (service) {
//       qeproject.service = service;
//     }
//     if (building_type) {
//       qeproject.building_type = building_type;
//     }
//     if (level) {
//       qeproject.level = level;
//     }

//     await qeproject.save(); // Save the updated project

//     res.status(200).json({
//       message: "Project updated successfully",
//       project: qeproject,
//     });
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// };


// *****************************************************
import qeProject from "../models/qeModel.js";
import path from "path";
import fs from "fs";
import DxfParser from "dxf-parser";
import { groupLayers } from "../utils/groupLayers.js";

export const createQeProject = async (req, res) => {
  try {
    const { user, name, service, building_type, level } = req.body;

        // Path to the uploaded file
        const dxfFilePath = req.file
          ? path.join(req.file.destination, req.file.filename)
          : null;
    
        let parsedData = null;
        let grouped_layers = {};
    
        if (dxfFilePath) {
          const parser = new DxfParser();
          const dxfContents = fs.readFileSync(dxfFilePath, "utf-8");
          try {
            parsedData = parser.parseSync(dxfContents);
            grouped_layers = groupLayers(parsedData.entities); // ✅ group logic

          } catch (parseErr) {
            return res
              .status(400)
              .json({ error: "Invalid DXF file", details: parseErr.message });
          }
        }

    const newQEProjectData = new qeProject({
      user,
      name,
      service,
      building_type,
      level,
      dxf_entities:parsedData.entities || [],
      grouped_layers,
      extracted_quantities_data: [], // NEW: Initialize as empty array for new projects
    });

    const newQEProject = new qeProject(newQEProjectData)
    await newQEProject.save()

    res.status(201).json({
      message: `${name} successfully created for Quantity Extraction`,
    });
  } catch (err) {
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
    const { grouped_layers, name, service, building_type, level, extracted_quantities_data } = req.body; 

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

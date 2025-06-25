import qeProject from "../models/qeModel.js";
import path from "path";
import fs from "fs";
import DxfParser from "dxf-parser";

export const createQeProject = async (req, res) => {
  try {
    const { user, name, service, building_type, sub_building_type, level } =
      req.body;

    // Path to the uploaded file
    const dxfFilePath = req.file
      ? path.join(req.file.destination, req.file.filename)
      : null;

    let parsedData = null;

    if (dxfFilePath) {
      const parser = new DxfParser();
      const dxfContents = fs.readFileSync(dxfFilePath, "utf-8");
      try {
        parsedData = parser.parseSync(dxfContents);
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
      sub_building_type,
      level,
      dxf_entities: parsedData.entities,
    });

    const newQEProject = new qeProject(newQEProjectData);
    await newQEProject.save();

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
    res.status(200).json(qeproject);
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

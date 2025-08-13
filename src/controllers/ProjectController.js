import Project from "../models/projectModel.js";

export const createProject = async (req, res) => {
  try {
    const { user, name, location, building_type, sub_building_type, level } =
      req.body;

    const newProjectData = {
      user,
      name,
      location,
      building_type,
      sub_building_type,
      level,
    };

    // Handle file upload if present
    if (req.file) {
      newProjectData.dxf_file = req.file.buffer;
      newProjectData.file_name = req.file.originalname;
    }

    const newProject = new Project(newProjectData);
    await newProject.save();

    res.status(201).json({
      message: `${name} successfully created`,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const listAllProjects = async (req, res) => {
  try {
    const userId = req.user.id;

    const projects = await Project.find({ user: userId });

    res.status(200).json(projects);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getProjectById = async (req, res) => {
  try {
    const projectId = req.params.id;

    const project = await Project.findOne({
      _id: projectId,
      user: req.user.id,
    });
    if (!project) {
      return res
        .status(404)
        .json({ error: "Project not found or unauthorized" });
    }
    res.status(200).json(project);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const deleteProjectData = async (req, res, next) => {
  try {
    const projectId = req.params.id;

    const project = await Project.findOne({
      _id: projectId,
      user: req.user.id,
    });

    if (!project) {
      return res
        .status(404)
        .json({ error: "Project not found or unauthorized" });
    }

    await project.deleteOne();

    res.send({
      status: 200,
      message: "Project deleted successfully",
    });
  } catch (err) {
    next(err);
  }
};

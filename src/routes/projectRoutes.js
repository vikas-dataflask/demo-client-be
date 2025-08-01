import express from "express";
import upload from "../middlewares/uploadMiddleware.js";
import {
  listAllProjects,
  createProject,
  deleteProjectData,
  getProjectById,
} from "../controllers/ProjectController.js";
import verifyToken from "../middlewares/authMiddleware.js";

const router = express.Router();

router.get("/project", verifyToken, listAllProjects);
router.post("/project", verifyToken, createProject);
router.delete("/project/:id", verifyToken, deleteProjectData);
router.get("/project/:id", verifyToken, getProjectById);

export default router;

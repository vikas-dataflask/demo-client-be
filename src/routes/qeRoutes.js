import express from "express";
import upload from "../middlewares/uploadMiddleware.js";
import verifyToken from "../middlewares/authMiddleware.js";
import {
  createQeProject,
  deleteQeProjectData,
  getQeProjectById,
  listAllQeProjects,
  updateQeProject, // <-- New import-----------------
} from "../controllers/qeController.js";

const router = express.Router();

router.get("/qe", verifyToken, listAllQeProjects);
router.post("/qe", verifyToken, createQeProject);
router.delete("/qe/:id", verifyToken, deleteQeProjectData);
router.get("/qe/:id", verifyToken, getQeProjectById);
router.patch("/qe/:id", verifyToken, updateQeProject); // <-- New route--------------------

export default router;

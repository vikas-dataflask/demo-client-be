import express from "express";
import {
  saveDrainagePipe,
  getDrainagePipeByProject,
} from "../controllers/drainagePipeController.js";

const router = express.Router();

router.post("/drainage-pipe", saveDrainagePipe); // Save/Update
router.get("/drainage-pipe/:project_id", getDrainagePipeByProject); // Fetch by project

export default router; 
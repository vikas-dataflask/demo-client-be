import express from "express";
import {
  saveOrUpdateBreaker,
  getBreakerByProject,
} from "../controllers/breakerController.js";

const router = express.Router();

// Save or update breaker sizing data
router.post("/save", saveOrUpdateBreaker);

// Get existing breaker sizing data for autofill
router.get("/:projectId", getBreakerByProject);

export default router;

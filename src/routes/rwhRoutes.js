import express from "express";
import { addRwhData, getRwhData } from "../controllers/rwhController.js";

const router = express.Router();

// POST - Save input + result data
router.post("/", addRwhData);

// GET - Autofill by project_id
router.get("/:project_id", getRwhData);

export default router;

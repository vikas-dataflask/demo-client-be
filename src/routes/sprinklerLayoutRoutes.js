import express from "express";
import {
  saveOrUpdateSprinklerLayout,
  getSprinklerLayout,
} from "../controllers/sprinklerLayoutController.js";

const router = express.Router();

// Save or Update Sprinkler Layout
router.post("/save", saveOrUpdateSprinklerLayout);

// Get Sprinkler Layout (Autofill)
router.get("/", getSprinklerLayout);

export default router;

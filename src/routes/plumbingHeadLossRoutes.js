import express from "express";
import {
  savePlumbingHeadLoss,
  getPlumbingHeadLossByProject,
} from "../controllers/plumbingHeadLossController.js";

const router = express.Router();

router.post("/plumbing-head-loss", savePlumbingHeadLoss); // Save/Update
router.get("/plumbing-head-loss/:project_id", getPlumbingHeadLossByProject); // Autofill

export default router;

import express from "express";
import {
  saveFireHeadLoss,
  getFireHeadLossByProject,
} from "../controllers/fireHeadLossController.js";

const router = express.Router();

router.post("/fire-head-loss", saveFireHeadLoss); // Save/Update
router.get("/fire-head-loss/:project_id", getFireHeadLossByProject); // Autofill

export default router;

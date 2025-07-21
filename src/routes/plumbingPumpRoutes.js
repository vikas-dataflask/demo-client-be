import express from "express";
import {
  calculateAndSavePlumbingPump,
  getPlumbingPumpByProject,
} from "../controllers/plumbingPumpController.js";

const router = express.Router();

router.post("/plumbing/calculate", calculateAndSavePlumbingPump);
router.get("/plumbing/:project_id", getPlumbingPumpByProject);

export default router;

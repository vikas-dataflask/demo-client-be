import express from "express";
import {
  calculateAndSaveFirePump,
  getFirePumpByProject,
} from "../controllers/firePumpController.js";

const router = express.Router();

router.post("/fire/calculate", calculateAndSaveFirePump);
router.get("/fire/:project_id", getFirePumpByProject);

export default router;

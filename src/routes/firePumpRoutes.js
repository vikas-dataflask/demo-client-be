import express from "express";
import {
  calculateAndSaveFirePump,
  getFirePumpByProject,
} from "../controllers/firePumpController.js";

const router = express.Router();

router.post("/calculate", calculateAndSaveFirePump);
router.get("/:project_id", getFirePumpByProject);

export default router;

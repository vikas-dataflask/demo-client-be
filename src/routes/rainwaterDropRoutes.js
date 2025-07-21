import express from "express";
import {
  saveRainwaterDrop,
  getRainwaterDropByProject,
} from "../controllers/rainwaterDropController.js";

const router = express.Router();

router.post("/rainwater-drop", saveRainwaterDrop); // Save/Update
router.get("/rainwater-drop/:project_id", getRainwaterDropByProject); // Fetch by project

export default router; 
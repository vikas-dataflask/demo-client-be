import express from "express";
import verifyToken from "../middlewares/authMiddleware.js";
import {
  calculateEarthmatAPI,
  getEarthmatReference,
  autofillEarthmat,
  updateEarthmat,
} from "../controllers/earthmatController.js";

const router = express.Router();

// JWT Auth for all routes
router.use(verifyToken);

// Save & Calculate
router.post("/calculate", calculateEarthmatAPI);

// Autofill latest by Project
router.get("/autofill/:projectId", autofillEarthmat);

// Update existing calculation
router.put("/update/:id", updateEarthmat);

// Reference Data
router.get("/reference", getEarthmatReference);

export default router;

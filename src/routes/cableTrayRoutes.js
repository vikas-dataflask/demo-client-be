import express from "express";
import {
  calculateTraySizeAPI,
  saveTrayCalculation,
  getTrayCalculation,
  updateTrayCalculation,
  getCableSizes,
  getTraySizes,
  getTrayTypes,
  validateCableSize,
  getReferenceData,
} from "../controllers/cableTrayController.js";
import verifyToken from "../middlewares/authMiddleware.js";

const router = express.Router();

// Public route (no auth)
router.get("/reference", getReferenceData);

// Authenticated routes
router.use(verifyToken);

// Existing calculate route
router.post("/calculate", calculateTraySizeAPI);

// ✅ NEW Save, Get, and Update routes
router.post("/save", saveTrayCalculation);
router.get("/get/:projectId", getTrayCalculation);
router.put("/update/:projectId", updateTrayCalculation);

// Existing reference routes
router.get("/cable-sizes", getCableSizes);
router.get("/tray-sizes", getTraySizes);
router.get("/tray-types", getTrayTypes);
router.post("/validate-cable", validateCableSize);

export default router;

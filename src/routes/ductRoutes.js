import express from "express";
import verifyToken from "../middlewares/authMiddleware.js";

import {
  calculateDuctSizeHandler,
  getDuctTestCasesHandler,
} from "../controllers/ductController.js";

const router = express.Router();

// Duct sizing calculation endpoint
router.post("/size", verifyToken, calculateDuctSizeHandler);

// Test cases endpoint
router.get("/size/test-cases", verifyToken, getDuctTestCasesHandler);

export default router;

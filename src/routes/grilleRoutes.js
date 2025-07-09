import express from "express";
import verifyToken from "../middlewares/authMiddleware.js";
import {
  calculateGrilleSizeHandler,
  getGrilleTestCasesHandler,
} from "../controllers/grilleController.js";

const router = express.Router();

// Grille sizing calculation endpoint
router.post("/size", verifyToken, calculateGrilleSizeHandler);

// Test cases endpoint
router.get("/size/test-cases", verifyToken, getGrilleTestCasesHandler);

export default router;

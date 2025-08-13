import express from "express";
import verifyToken from "../middlewares/authMiddleware.js";
import { utilityController } from "../controllers/utilityController.js";

const router = express.Router();

router.post("/convert", verifyToken, utilityController);

export default router;

import express from "express";
import upload from "../middlewares/uploadMiddleware.js";
import verifyToken from "../middlewares/authMiddleware.js";
import { parseDxf } from "../controllers/utilityController.js";

const router = express.Router();

router.post("/dxf", verifyToken, upload.single("dxf_file"), parseDxf);

export default router;

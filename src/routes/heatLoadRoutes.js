import express from "express";
import {
  storeHeatLoad,
  // getHeatLoadByProjectAndRoom,
} from "../controllers/heatLoadController.js";

const router = express.Router();

router.post("/store", storeHeatLoad); // Save calculation
// router.get("/autofill", getHeatLoadByProjectAndRoom); // Autofill for same room/project

export default router;

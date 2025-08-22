import "dotenv/config";
import express from "express";
import dotenv from "dotenv";
import dbConnect from "./config/dbConnect.js";
import authRoutes from "./routes/authRoutes.js";
import projectRoutes from "./routes/projectRoutes.js";
import qeRoutes from "./routes/qeRoutes.js";
import calculations from "./routes/calculationRoutes.js";
import ductRoutes from "./routes/ductRoutes.js";
import grilleRoutes from "./routes/grilleRoutes.js";
import hvacRoutes from "./routes/hvacRoutes.js";
import waterDemandRoutes from "./routes/waterDemandRoutes.js";
import heatLoadRoutes from "./routes/heatLoadRoutes.js";

import userRoutes from "./routes/userRoutes.js";
import path from "path";
import { fileURLToPath } from "url";
import cors from "cors";
import ventilationRoutes from "./routes/ventilationRoutes.js";
import ductSizingRoutes from "./routes/ductSizingRoutes.js";
import ahuPressureDropRoutes from "./routes/ahuPressureDropRoutes.js";
import chillerPressureDropRoutes from "./routes/chillerPressureDropRoutes.js";
import condenserRoutes from "./routes/condenserRoutes.js";
import fireHeadLossRoutes from "./routes/fireHeadLossRoutes.js";
import firePumpRoutes from "./routes/firePumpRoutes.js";
import waterSupplyPipeRoutes from "./routes/waterSupplyPipeRoutes.js";
import plumbingHeadLossRoutes from "./routes/plumbingHeadLossRoutes.js";
import plumbingPumpRoutes from "./routes/plumbingPumpRoutes.js";
import drainagePipeRoutes from "./routes/drainagePipeRoutes.js";
import rainwaterDropRoutes from "./routes/rainwaterDropRoutes.js";
import rwhRoutes from "./routes/rwhRoutes.js";
import breakerRoutes from "./routes/breakerRoutes.js";
import cableSizingRoutes from "./routes/cableSizingRoutes.js";
import cableTrayRoutes from "./routes/cableTrayRoutes.js";
import earthmatRoutes from "./routes/earthmatRoutes.js";
import waterDemandRoutesV2 from "./routes/waterDemandRoutesV2.js";
import sprinklerLayoutRoutes from "./routes/sprinklerLayoutRoutes.js";
import utilityRoutes from "./routes/utilityRoutes.js";
import wallRoutes from "./routes/wallRoutes.js";
import roomRoutes from "./routes/roomRoutes.js";
import doorRoutes from "./routes/doorRoutes.js";
import windowRoutes from "./routes/windowRoutes.js";
import floorRoutes from "./routes/floorRoutes.js";
import structureRoutes from "./routes/structureRoutes.js";
import prefillRoutes from "./routes/prefill.js";
import vediRoutes from "./routes/vediRoutes.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config();
dbConnect();

const app = express();

// Middleware
app.use(express.json()); // Parses incoming JSON requests
app.use(express.urlencoded({ extended: true })); // Parses incoming FormData requests
app.use(cors()); // Enables CORS for all routes

// Serve static files from the 'uploads' directory
app.use("/uploads", express.static(path.join(__dirname, "../uploads")));

// --- API Routes ---
// Specific API routes should come first
app.use("/api/auth", authRoutes);
app.use("/api/user", userRoutes); // User routes (e.g., /api/user/profile, /api/user/delete-profile-pic)
app.use("/api", projectRoutes);
app.use("/api", qeRoutes);
app.use("/api", calculations);
app.use("/api/duct", ductRoutes);
app.use("/api/hvac", grilleRoutes);
app.use("/api/hvac", hvacRoutes);

app.use("/api/hvac", waterDemandRoutes);
app.use("/api/hvac", heatLoadRoutes);
app.use("/api/water-demand", waterDemandRoutes);
app.use("/api/heatload", heatLoadRoutes);
app.use("/api/ventilation", ventilationRoutes);
app.use("/api/duct-sizing", ductSizingRoutes);
app.use("/api/ahu-pressure-drop", ahuPressureDropRoutes);
app.use("/api/chiller-pressure-drop", chillerPressureDropRoutes);
app.use("/api/condenser", condenserRoutes);
app.use("/api", fireHeadLossRoutes);
app.use("/api", firePumpRoutes);
app.use("/api/water-supply-pipes", waterSupplyPipeRoutes);
app.use("/api", plumbingHeadLossRoutes);
app.use("/api", plumbingPumpRoutes);
app.use("/api/drainage-pipes", drainagePipeRoutes);
app.use("/api/rainwater-drops", rainwaterDropRoutes);
app.use("/api/rwh", rwhRoutes);
app.use("/api/breaker", breakerRoutes);
app.use("/api/cable-sizing", cableSizingRoutes);
app.use("/api/cable-tray", cableTrayRoutes);
app.use("/api/earthmat", earthmatRoutes);
app.use("/api/water-demand-v2", waterDemandRoutesV2);
app.use("/api/sprinkler-layout", sprinklerLayoutRoutes);
app.use("/api", utilityRoutes);
app.use("/api/walls", wallRoutes);
app.use("/api/floors", floorRoutes);
app.use("/api/rooms", roomRoutes);
app.use("/api/doors", doorRoutes);
app.use("/api/windows", windowRoutes);
app.use("/api/structure", structureRoutes);
app.use("/api/prefill", prefillRoutes);
app.use("/api/vedi", vediRoutes);

// Optional: Simple root route, placed after specific API routes
app.get("/", (req, res) => {
  res.send("Welcome to the API!");
});

// --- General 404 handler (if no route matched above) ---
app.use((req, res) => {
  res.status(404).send("API Endpoint Not Found");
});

// --- Global Error Handler (should be the last middleware) ---
app.use((err, req, res, next) => {
  console.error("An unhandled error occurred:", err.stack);
  res.status(err.status || 500).json({
    message: err.message || "An unexpected error occurred.",
    error: process.env.NODE_ENV === "development" ? err : {}, // Provide full error in dev
  });
});

const PORT = process.env.PORT || 8000;
app.listen(PORT, () => console.log(`Server is running on port ${PORT}`));

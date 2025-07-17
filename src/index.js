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
import ventilationRoutes from "./routes/ventilationRoutes.js";
import ductSizingRoutes from "./routes/ductSizingRoutes.js";
import ahuPressureDropRoutes from "./routes/ahuPressureDropRoutes.js";
import chillerPressureDropRoutes from "./routes/chillerPressureDropRoutes.js";
import condenserRoutes from "./routes/condenserRoutes.js";
import fireHeadLossRoutes from "./routes/fireHeadLossRoutes.js";
import firePumpRoutes from "./routes/firePumpRoutes.js";

dotenv.config();
dbConnect();

const app = express();

//Middleware
app.use(express.json());

//Routes
app.use("/api/auth", authRoutes);
app.use("/api", projectRoutes);
app.use("/api", qeRoutes);
app.use("/api", calculations);
app.use("/api/duct", ductRoutes);
app.use("/api/hvac", grilleRoutes);
app.use("/api/hvac", hvacRoutes);
app.use("/api/water-demand", waterDemandRoutes);
app.use("/api/heatload", heatLoadRoutes);
app.use("/api/ventilation", ventilationRoutes);
app.use("/api/duct-sizing", ductSizingRoutes);
app.use("/api/ahu-pressure-drop", ahuPressureDropRoutes);
app.use("/api/chiller-pressure-drop", chillerPressureDropRoutes);
app.use("/api/condenser", condenserRoutes);
app.use("/api", fireHeadLossRoutes);
app.use("/api", firePumpRoutes);

//Start the server
const PORT = process.env.PORT || 8000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

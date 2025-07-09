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

//Start the server
const PORT = process.env.PORT || 8000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

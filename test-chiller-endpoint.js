// Test script for Chiller pressure drop endpoint
import mongoose from "mongoose";
import ChillerPressureDrop from "./src/models/chillerPressureDrop.js";

// Connect to MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || "mongodb://localhost:27017/design-draft");
    console.log("MongoDB connected");
  } catch (error) {
    console.error("MongoDB connection error:", error);
    process.exit(1);
  }
};

// Test data
const testData = {
  project_id: "test123",
  room: "main",
  mode: "data",
  input_data: {
    chillerTonnage: 100,
    flowRateLps: 5.5,
    systemType: "primary",
    pipeInnerDiameterMm: 50,
    fluidType: "water",
    temperatureC: 20,
    fluidProperties: {
      density: 998.2,
      viscosity: 0.001002,
    },
    fittings: {},
    fittingVelocity: 2.5,
    airDensity: 1.225,
  },
  result_data: {
    estimatedDropKpa: 15.5,
    flowRateLps: 5.5,
    chillerTonnage: 100,
    velocity: 2.5,
    reynoldsNumber: 125000,
    frictionFactor: 0.018,
    assumptionsUsed: {
      method: "Darcy-Weisbach",
      formula: "hf = f * (L/D) * (v²/2g)",
      typicalRange: "10-20 kPa",
      notes: "Standard calculation method",
    },
    warning: "None",
    fittingLosses: {},
    units: {
      pressureDrop: "kPa",
      flowRate: "L/s",
      tonnage: "tons",
    },
  },
};

// Test save function
const testSave = async () => {
  try {
    console.log("Testing save function...");
    
    // Check if data already exists
    const existingData = await ChillerPressureDrop.findOne({
      project_id: testData.project_id,
      room: testData.room,
    });

    if (existingData) {
      console.log("Data already exists, testing update...");
      const updatedData = await ChillerPressureDrop.findOneAndUpdate(
        {
          project_id: testData.project_id,
          room: testData.room,
        },
        testData,
        { new: true, runValidators: true }
      );
      console.log("Update successful:", updatedData);
    } else {
      console.log("Creating new data...");
      const newData = new ChillerPressureDrop(testData);
      const savedData = await newData.save();
      console.log("Save successful:", savedData);
    }
  } catch (error) {
    console.error("Test failed:", error);
  }
};

// Test get function
const testGet = async () => {
  try {
    console.log("Testing get function...");
    const data = await ChillerPressureDrop.findOne({
      project_id: testData.project_id,
      room: testData.room,
    });
    console.log("Get successful:", data);
  } catch (error) {
    console.error("Get test failed:", error);
  }
};

// Run tests
const runTests = async () => {
  await connectDB();
  await testSave();
  await testGet();
  process.exit(0);
};

runTests(); 
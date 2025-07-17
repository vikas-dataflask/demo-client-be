// Test script for Condenser endpoint
import mongoose from "mongoose";
import CondenserCalculation from "./src/models/condenserModel.js";

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
  chillerTonnage: 100,
  flowRateLps: 18.9,
  pipeInnerDiameterMm: 100,
  mode: "data",
  fluidType: "water",
  temperatureC: 25,
  systemType: "condenser-pump-outlet-riser",
  totalEquivalentLength: "150 m",
  headLoss: "25 kPa",
  message: "Calculation completed successfully",
};

// Test save function
const testSave = async () => {
  try {
    console.log("Testing save function...");
    
    // Check if data already exists
    const existingData = await CondenserCalculation.findOne({
      project_id: testData.project_id,
    });

    if (existingData) {
      console.log("Data already exists, testing update...");
      const updatedData = await CondenserCalculation.findOneAndUpdate(
        {
          project_id: testData.project_id,
        },
        testData,
        { new: true, runValidators: true }
      );
      console.log("Update successful:", updatedData);
    } else {
      console.log("Creating new data...");
      const newData = new CondenserCalculation(testData);
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
    const data = await CondenserCalculation.findOne({
      project_id: testData.project_id,
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
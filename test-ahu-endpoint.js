// Test script for AHU pressure drop endpoint
import mongoose from "mongoose";
import AhuPressureDrop from "./src/models/ahuPressureDrop.js";

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
  airflow: 1000,
  velocity: 5,
  coilPressureDrop: 200,
  filterPressureDrop: 150,
  selectedFittings: ["90_elbow_sharp"],
  selectedFittingsQuantities: { "90_elbow_sharp": 2 }
};

// Test save function
const testSave = async () => {
  try {
    console.log("Testing save function...");
    
    // Check if data already exists
    const existingData = await AhuPressureDrop.findOne({
      project_id: testData.project_id,
      room: testData.room,
    });

    if (existingData) {
      console.log("Data already exists, testing update...");
      const updatedData = await AhuPressureDrop.findOneAndUpdate(
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
      const newData = new AhuPressureDrop(testData);
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
    const data = await AhuPressureDrop.findOne({
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
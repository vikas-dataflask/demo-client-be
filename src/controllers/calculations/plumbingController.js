import { calculateDrainagePipes } from "../../services/calculations/Plumbing/DrainagePipes.js";
import calculatePlumbingHeadLoss from "../../services/calculations/Plumbing/PlumbingHeadLoss.js";
import { calculatePlumbingPump } from "../../services/calculations/Plumbing/PlumbingPump.js";
import { calculateRainwaterDropSizing } from "../../services/calculations/Plumbing/RainwaterDropSizing.js";
import { calculateRWHSizing } from "../../services/calculations/Plumbing/rwhSizing.js";
import { calculateWaterDemand } from "../../services/calculations/Plumbing/WaterDemand.js";
import { calculateWaterSupplyPipes } from "../../services/calculations/Plumbing/WaterSupplyPipes.js";

export const calculateWaterDemandHandler = (req, res) => {
  try {
    const waterDemandData = req.body.water_demand;

    if (!waterDemandData) {
      return res
        .status(400)
        .json({ success: false, message: "Missing water demand data" });
    }

    const results = calculateWaterDemand(waterDemandData);
    res.json({ success: true, data: results });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error processing water demand data",
      error: error.message,
    });
  }
};

export const calculateWaterSupplyPipesHandler = (req, res) => {
  try {
    const waterSupplyData = req.body.water_supply;

    if (!waterSupplyData) {
      return res
        .status(400)
        .json({ success: false, message: "Missing water supply data" });
    }

    const results = calculateWaterSupplyPipes(waterSupplyData);
    res.json({ success: true, data: results });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error processing water supply data",
      error: error.message,
    });
  }
};

export const calculateDrainagePipesHandler = (req, res) => {
  try {
    const plumbingData = req.body.plumbing;

    if (!plumbingData) {
      return res
        .status(400)
        .json({ success: false, message: "Missing plumbing data" });
    }

    const results = calculateDrainagePipes(plumbingData);
    res.json({ success: true, data: results });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error processing plumbing data",
      error: error.message,
    });
  }
};

export const calculatePlumbingHeadlossHandler = (req, res) => {
  try {
    const inputData = req.body;

    if (!inputData || typeof inputData !== "object") {
      return res
        .status(400)
        .json({ success: false, message: "Invalid input data" });
    }

    const result = calculatePlumbingHeadLoss(inputData);
    res.json({ success: true, data: result });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error processing plumbing head loss data",
      error: error.message,
    });
  }
};

export const calculatePlumbingPumpHandler = (req, res) => {
  try {
    const inputData = req.body;

    if (!inputData || typeof inputData !== "object") {
      return res
        .status(400)
        .json({ success: false, message: "Invalid input data" });
    }

    const result = calculatePlumbingPump(inputData);
    res.json({ success: true, data: result });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error processing pump data",
      error: error.message,
    });
  }
};

export const calculateRWHSizingHandler = (req, res) => {
  try {
    const rwhData = req.body.rwh;

    if (!rwhData) {
      return res
        .status(400)
        .json({ success: false, message: "Missing RWH data" });
    }

    const results = calculateRWHSizing(rwhData);
    res.json({ success: true, data: results });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error processing RWH data",
      error: error.message,
    });
  }
};

export const calculateRainwaterDropSizingHandler = (req, res) => {
  try {
    const inputData = req.body;

    if (!inputData || typeof inputData !== "object") {
      return res
        .status(400)
        .json({ success: false, message: "Invalid input data" });
    }

    const result = calculateRainwaterDropSizing(inputData);
    res.json({ success: true, data: result });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error processing rainwater discharge data",
      error: error.message,
    });
  }
};

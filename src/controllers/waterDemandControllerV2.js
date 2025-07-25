import WaterDemand from "../models/waterDemandModel.js"; // ✅ Import Mongoose Model

// ✅ Standard Water Demand Factors
const buildingStandards = {
  "Metro Elevated Stations": {
    passengers: 30,
    staff: 45,
    cleaning: 6,
    gardening: 5,
  },
  "Metro Underground Stations": {
    passengers: 30,
    staff: 45,
    cleaning: 5,
    gardening: 5,
    acMakeup: 6,
  },
  "Residential Buildings": {
    occupants: 150,
    cleaning: 5,
    gardening: 5,
  },
  "Office Buildings": {
    staff: 50,
    visitors: 50,
    cleaning: 3,
    gardening: 5,
    acMakeup: 4,
    kitchen: 8,
  },
  Hotels: {
    visitors: 200,
    staff: 100,
    cleaning: 5,
    gardening: 5,
    kitchen: 25,
    spa: 5,
    swimming: 5,
    acMakeup: 6,
  },
  "Data Centers": {
    occupants: 20,
    cleaning: 1,
    gardening: 5,
    kitchen: 25,
    acMakeup: 15,
  },
  "Shopping Malls": {
    visitors: 50,
    staff: 30,
    cleaning: 5,
    gardening: 5,
    acMakeup: 6,
    kitchen: 15,
    foodCourt: 15,
    carWashing: 15,
  },
  Gym: {
    occupants: 90,
    cleaning: 5,
    gardening: 5,
  },
  Salon: {
    visitors: 100,
    staff: 50,
    cleaning: 3,
    gardening: 5,
    spa: 5,
  },
  "Car Showroom": {
    staff: 30,
    visitors: 20,
    cleaning: 3,
    gardening: 5,
    carWashing: 150,
  },
};

// ✅ Helper: Calculate Water Demand for a Single Building
const calculateDemandForBuilding = (buildingType, inputs) => {
  const standard = buildingStandards[buildingType];
  if (!standard) throw new Error(`No standard found for ${buildingType}`);

  const breakdown = {};
  for (const [key, factor] of Object.entries(standard)) {
    let demand = 0;
    switch (key) {
      case "passengers":
      case "staff":
      case "occupants":
      case "visitors":
        demand = (inputs[key] || 0) * factor;
        break;
      case "cleaning":
        demand = (inputs.floorArea || 0) * factor;
        break;
      case "gardening":
        demand = (inputs.greenArea || 0) * factor;
        break;
      case "acMakeup":
        demand = (inputs.acArea || 0) * factor;
        break;
      case "kitchen":
      case "foodCourt":
        demand = (inputs.kitchenPeople || 0) * factor;
        break;
      case "spa":
        demand = (inputs.spaBeds || 0) * factor;
        break;
      case "swimming":
        demand = (inputs.poolArea || 0) * factor;
        break;
      case "carWashing":
        demand = (inputs.cars || 0) * factor;
        break;
      default:
        break;
    }
    breakdown[key] = Math.round(demand);
  }

  const totalDemand = Object.values(breakdown).reduce(
    (sum, val) => sum + val,
    0
  );
  return { buildingType, breakdown, totalDemand };
};

// ✅ Get all Building Standards (No DB involved)
export const getAllBuildingStandardsController = async (req, res) => {
  try {
    res.json({ success: true, data: Object.keys(buildingStandards) });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ✅ Calculate, Save or Update Water Demand in DB
export const saveOrUpdateWaterDemandController = async (req, res) => {
  try {
    const { projectId, buildingType, inputs } = req.body;

    if (!projectId || !buildingType || !inputs) {
      return res.status(400).json({
        success: false,
        message: "projectId, buildingType & inputs are required",
      });
    }

    // ✅ 1. Perform Calculation
    const result = calculateDemandForBuilding(buildingType, inputs);

    // ✅ 2. Save or Update in DB
    let record = await WaterDemand.findOne({ projectId, buildingType });
    if (record) {
      record.inputs = inputs;
      record.result = result;
      await record.save();
    } else {
      record = await WaterDemand.create({
        projectId,
        buildingType,
        inputs,
        result,
      });
    }

    res.json({
      success: true,
      message: "Water demand calculated & saved successfully",
      data: record,
    });
  } catch (err) {
    console.error("Save Water Demand Error:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// ✅ Autofill Water Demand (Fetch saved data by projectId & buildingType)
export const getWaterDemandByProjectController = async (req, res) => {
  try {
    const { projectId, buildingType } = req.query;

    if (!projectId || !buildingType) {
      return res.status(400).json({
        success: false,
        message: "projectId & buildingType are required",
      });
    }

    const record = await WaterDemand.findOne({ projectId, buildingType });
    if (!record) {
      return res.status(404).json({
        success: false,
        message: "No saved water demand found for this project & building",
      });
    }

    res.json({ success: true, data: record });
  } catch (err) {
    console.error("Get Water Demand Error:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// ✅ Calculate Multiple Buildings (No DB save)
export const calculateAllSelectedBuildingsController = async (req, res) => {
  try {
    const { buildings } = req.body;
    if (!Array.isArray(buildings)) {
      return res.status(400).json({
        success: false,
        message: "Array of buildings required",
      });
    }

    let totalOverall = 0;
    const results = buildings.map(({ buildingType, inputs }) => {
      const calc = calculateDemandForBuilding(buildingType, inputs || {});
      totalOverall += calc.totalDemand;
      return calc;
    });

    res.json({ success: true, results, totalOverall });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

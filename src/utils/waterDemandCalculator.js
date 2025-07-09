// Water Demand Calculator Utility
// Calculates total daily water requirement based on building type and usage

const demandFactors = {
  Residential: {
    lpcd: 135,
    avgOccupants: 5,
    description: "Residential buildings with apartments/houses",
    inputType: "units",
  },
  Office: {
    lpcd: 50,
    areaPerPerson: 10,
    description: "Commercial office buildings",
    inputType: "area",
  },
  Hotel: {
    lpcd: 180,
    avgOccupants: 1.5,
    description: "Hotels and hospitality buildings",
    inputType: "units",
  },
  Hospital: {
    lpcd: 340,
    avgOccupants: 1.2,
    description: "Healthcare facilities and hospitals",
    inputType: "units",
  },
  School: {
    lpcd: 45,
    avgOccupants: 1,
    description: "Educational institutions",
    inputType: "units",
  },
  Shopping: {
    lpcd: 25,
    areaPerPerson: 15,
    description: "Shopping malls and retail spaces",
    inputType: "area",
  },
  Industrial: {
    lpcd: 100,
    areaPerPerson: 20,
    description: "Industrial and manufacturing facilities",
    inputType: "area",
  },
  Restaurant: {
    lpcd: 200,
    areaPerPerson: 8,
    description: "Restaurants and food service",
    inputType: "area",
  },
};

export const calculateWaterDemand = ({
  buildingType,
  unitCount,
  areaM2,
  landscapeM2 = 0,
  ufwPercentage = 15,
  kitchenLaundryPercentage = 10,
}) => {
  // Validate inputs
  if (!buildingType || !demandFactors[buildingType]) {
    throw new Error(`Invalid building type: ${buildingType}`);
  }

  const factors = demandFactors[buildingType];
  let population = 0;
  let baseDemandL = 0;

  // Calculate population based on building type
  if (factors.inputType === "units") {
    if (!unitCount || unitCount <= 0) {
      throw new Error(
        "Unit count must be greater than 0 for this building type"
      );
    }
    population = Math.floor(unitCount * factors.avgOccupants);
  } else if (factors.inputType === "area") {
    if (!areaM2 || areaM2 <= 0) {
      throw new Error("Area must be greater than 0 for this building type");
    }
    population = Math.floor(areaM2 / factors.areaPerPerson);
  }

  // Validate population
  if (population <= 0) {
    throw new Error("Calculated population must be greater than 0");
  }

  // Calculate base water demand
  baseDemandL = population * factors.lpcd;

  // Calculate landscape irrigation (if provided)
  const irrigationL = landscapeM2 > 0 ? landscapeM2 * 5 : 0;

  // Calculate kitchen and laundry demand
  const kitchenLaundryL = (baseDemandL * kitchenLaundryPercentage) / 100;

  // Calculate total before UFW
  const totalBeforeUFW = baseDemandL + irrigationL + kitchenLaundryL;

  // Calculate Unaccounted For Water (UFW)
  const ufwL = (totalBeforeUFW * ufwPercentage) / 100;

  // Calculate total water demand
  const totalWaterDemandL = totalBeforeUFW + ufwL;

  // Calculate storage requirements (1 day storage)
  const storageRequirementL = totalWaterDemandL;

  // Calculate peak demand (1.5x average for peak hours)
  const peakDemandL = totalWaterDemandL * 1.5;

  return {
    buildingType,
    buildingDescription: factors.description,
    inputType: factors.inputType,
    inputValue: factors.inputType === "units" ? unitCount : areaM2,
    population,
    lpcd: factors.lpcd,
    baseDemandL: Math.round(baseDemandL),
    irrigationL: Math.round(irrigationL),
    kitchenLaundryL: Math.round(kitchenLaundryL),
    ufwL: Math.round(ufwL),
    ufwPercentage,
    totalWaterDemandL: Math.round(totalWaterDemandL),
    storageRequirementL: Math.round(storageRequirementL),
    peakDemandL: Math.round(peakDemandL),
    areaM2: areaM2 || 0,
    landscapeM2,
    unitCount: unitCount || 0,
    calculationDate: new Date().toISOString(),
  };
};

// Get available building types
export const getBuildingTypes = () => {
  return Object.keys(demandFactors).map((type) => ({
    type,
    ...demandFactors[type],
  }));
};

// Validate building type
export const isValidBuildingType = (buildingType) => {
  return demandFactors.hasOwnProperty(buildingType);
};

// Get input type for building
export const getInputType = (buildingType) => {
  return demandFactors[buildingType]?.inputType || "units";
};

// Calculate multiple building types
export const calculateMultipleBuildings = (buildings) => {
  if (!Array.isArray(buildings) || buildings.length === 0) {
    throw new Error("Buildings array is required and must not be empty");
  }

  const results = buildings.map((building) => calculateWaterDemand(building));

  // Calculate totals
  const totals = {
    totalPopulation: results.reduce((sum, r) => sum + r.population, 0),
    totalBaseDemandL: results.reduce((sum, r) => sum + r.baseDemandL, 0),
    totalIrrigationL: results.reduce((sum, r) => sum + r.irrigationL, 0),
    totalKitchenLaundryL: results.reduce(
      (sum, r) => sum + r.kitchenLaundryL,
      0
    ),
    totalUFWL: results.reduce((sum, r) => sum + r.ufwL, 0),
    totalWaterDemandL: results.reduce((sum, r) => sum + r.totalWaterDemandL, 0),
    totalStorageRequirementL: results.reduce(
      (sum, r) => sum + r.storageRequirementL,
      0
    ),
    totalPeakDemandL: results.reduce((sum, r) => sum + r.peakDemandL, 0),
    buildingCount: results.length,
  };

  return {
    buildings: results,
    totals,
    calculationDate: new Date().toISOString(),
  };
};

// Export demand factors for reference
export { demandFactors };

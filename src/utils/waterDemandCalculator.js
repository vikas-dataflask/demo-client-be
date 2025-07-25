// // Water Demand Calculator Utility
// // Calculates total daily water requirement based on building type and usage

// const demandFactors = {
//   Residential: {
//     lpcd: 135,
//     avgOccupants: 5,
//     description: "Residential buildings with apartments/houses",
//     inputType: "units",
//   },
//   Office: {
//     lpcd: 50,
//     areaPerPerson: 10,
//     description: "Commercial office buildings",
//     inputType: "area",
//   },
//   Hotel: {
//     lpcd: 180,
//     avgOccupants: 1.5,
//     description: "Hotels and hospitality buildings",
//     inputType: "units",
//   },
//   Hospital: {
//     lpcd: 340,
//     avgOccupants: 1.2,
//     description: "Healthcare facilities and hospitals",
//     inputType: "units",
//   },
//   School: {
//     lpcd: 45,
//     avgOccupants: 1,
//     description: "Educational institutions",
//     inputType: "units",
//   },
//   Shopping: {
//     lpcd: 25,
//     areaPerPerson: 15,
//     description: "Shopping malls and retail spaces",
//     inputType: "area",
//   },
//   Industrial: {
//     lpcd: 100,
//     areaPerPerson: 20,
//     description: "Industrial and manufacturing facilities",
//     inputType: "area",
//   },
//   Restaurant: {
//     lpcd: 200,
//     areaPerPerson: 8,
//     description: "Restaurants and food service",
//     inputType: "area",
//   },
// };

// export const calculateWaterDemand = ({
//   buildingType,
//   unitCount,
//   areaM2,
//   landscapeM2 = 0,
//   ufwPercentage = 15,
//   kitchenLaundryPercentage = 10,
// }) => {
//   // Validate inputs
//   if (!buildingType || !demandFactors[buildingType]) {
//     throw new Error(`Invalid building type: ${buildingType}`);
//   }

//   const factors = demandFactors[buildingType];
//   let population = 0;
//   let baseDemandL = 0;

//   // Calculate population based on building type
//   if (factors.inputType === "units") {
//     if (!unitCount || unitCount <= 0) {
//       throw new Error(
//         "Unit count must be greater than 0 for this building type"
//       );
//     }
//     population = Math.floor(unitCount * factors.avgOccupants);
//   } else if (factors.inputType === "area") {
//     if (!areaM2 || areaM2 <= 0) {
//       throw new Error("Area must be greater than 0 for this building type");
//     }
//     population = Math.floor(areaM2 / factors.areaPerPerson);
//   }

//   // Validate population
//   if (population <= 0) {
//     throw new Error("Calculated population must be greater than 0");
//   }

//   // Calculate base water demand
//   baseDemandL = population * factors.lpcd;

//   // Calculate landscape irrigation (if provided)
//   const irrigationL = landscapeM2 > 0 ? landscapeM2 * 5 : 0;

//   // Calculate kitchen and laundry demand
//   const kitchenLaundryL = (baseDemandL * kitchenLaundryPercentage) / 100;

//   // Calculate total before UFW
//   const totalBeforeUFW = baseDemandL + irrigationL + kitchenLaundryL;

//   // Calculate Unaccounted For Water (UFW)
//   const ufwL = (totalBeforeUFW * ufwPercentage) / 100;

//   // Calculate total water demand
//   const totalWaterDemandL = totalBeforeUFW + ufwL;

//   // Calculate storage requirements (1 day storage)
//   const storageRequirementL = totalWaterDemandL;

//   // Calculate peak demand (1.5x average for peak hours)
//   const peakDemandL = totalWaterDemandL * 1.5;

//   return {
//     buildingType,
//     buildingDescription: factors.description,
//     inputType: factors.inputType,
//     inputValue: factors.inputType === "units" ? unitCount : areaM2,
//     population,
//     lpcd: factors.lpcd,
//     baseDemandL: Math.round(baseDemandL),
//     irrigationL: Math.round(irrigationL),
//     kitchenLaundryL: Math.round(kitchenLaundryL),
//     ufwL: Math.round(ufwL),
//     ufwPercentage,
//     totalWaterDemandL: Math.round(totalWaterDemandL),
//     storageRequirementL: Math.round(storageRequirementL),
//     peakDemandL: Math.round(peakDemandL),
//     areaM2: areaM2 || 0,
//     landscapeM2,
//     unitCount: unitCount || 0,
//     calculationDate: new Date().toISOString(),
//   };
// };

// // Get available building types
// export const getBuildingTypes = () => {
//   return Object.keys(demandFactors).map((type) => ({
//     type,
//     ...demandFactors[type],
//   }));
// };

// // Validate building type
// export const isValidBuildingType = (buildingType) => {
//   return demandFactors.hasOwnProperty(buildingType);
// };

// // Get input type for building
// export const getInputType = (buildingType) => {
//   return demandFactors[buildingType]?.inputType || "units";
// };

// // Calculate multiple building types
// export const calculateMultipleBuildings = (buildings) => {
//   if (!Array.isArray(buildings) || buildings.length === 0) {
//     throw new Error("Buildings array is required and must not be empty");
//   }

//   const results = buildings.map((building) => calculateWaterDemand(building));

//   // Calculate totals
//   const totals = {
//     totalPopulation: results.reduce((sum, r) => sum + r.population, 0),
//     totalBaseDemandL: results.reduce((sum, r) => sum + r.baseDemandL, 0),
//     totalIrrigationL: results.reduce((sum, r) => sum + r.irrigationL, 0),
//     totalKitchenLaundryL: results.reduce(
//       (sum, r) => sum + r.kitchenLaundryL,
//       0
//     ),
//     totalUFWL: results.reduce((sum, r) => sum + r.ufwL, 0),
//     totalWaterDemandL: results.reduce((sum, r) => sum + r.totalWaterDemandL, 0),
//     totalStorageRequirementL: results.reduce(
//       (sum, r) => sum + r.storageRequirementL,
//       0
//     ),
//     totalPeakDemandL: results.reduce((sum, r) => sum + r.peakDemandL, 0),
//     buildingCount: results.length,
//   };

//   return {
//     buildings: results,
//     totals,
//     calculationDate: new Date().toISOString(),
//   };
// };

// // Export demand factors for reference
// export { demandFactors };

// ======================
// ✅ Water Demand Calculator Utility (Updated)
// ======================

// === Water Demand Types (ID → Name Mapping) ===
export const waterDemandTypes = {
  1: "Occupancy",
  2: "Cleaning",
  3: "Gardening",
  4: "AC Makeup Water",
  5: "Swimming",
  6: "Spa",
  7: "Kitchen",
  8: "Food Court",
  9: "Car Washing",
};

// === Mapping of Building Names to Demand IDs ===
export const buildingDemandMap = {
  "Metro Elevated": [1, 2, 3],
  Underground: [1, 2, 3, 4],
  Residential: [1, 2, 3],
  Office: [1, 2, 3, 4, 7],
  Hotel: [1, 2, 3, 4, 5, 6, 7],
  "Data Center": [1, 2, 3, 4, 7],
  Mall: [1, 2, 3, 4, 7, 8, 9],
  Gym: [1, 2, 3],
  Salon: [1, 2, 3, 6],
  "Car Showroom": [1, 2, 3, 9],
};

// === Base Demand Factors (Occupancy-related LPCD) ===
export const demandFactors = {
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

// === Core Function: Base Water Demand Calculation ===
export const calculateWaterDemand = ({
  buildingType,
  unitCount,
  areaM2,
  landscapeM2 = 0,
  ufwPercentage = 15,
  kitchenLaundryPercentage = 10,
}) => {
  if (!buildingType || !demandFactors[buildingType]) {
    throw new Error(`Invalid building type: ${buildingType}`);
  }

  const factors = demandFactors[buildingType];
  let population = 0;

  // Population Calculation
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

  if (population <= 0) {
    throw new Error("Calculated population must be greater than 0");
  }

  // Base Water Demand Calculation
  const baseDemandL = population * factors.lpcd;
  const irrigationL = landscapeM2 > 0 ? landscapeM2 * 5 : 0;
  const kitchenLaundryL = (baseDemandL * kitchenLaundryPercentage) / 100;
  const totalBeforeUFW = baseDemandL + irrigationL + kitchenLaundryL;
  const ufwL = (totalBeforeUFW * ufwPercentage) / 100;
  const totalWaterDemandL = totalBeforeUFW + ufwL;
  const storageRequirementL = totalWaterDemandL;
  const peakDemandL = totalWaterDemandL * 1.5;

  return {
    buildingType,
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
    calculationDate: new Date().toISOString(),
  };
};

// === NEW FUNCTION: Full Demand Calculation for a Building Name ===
export const calculateBuildingWaterDemand = ({
  buildingName,
  baseBuildingType,
  unitCount,
  areaM2,
  landscapeM2,
  ufwPercentage,
  kitchenLaundryPercentage,
}) => {
  if (!buildingDemandMap[buildingName]) {
    throw new Error(`Unknown building: ${buildingName}`);
  }

  const baseResult = calculateWaterDemand({
    buildingType: baseBuildingType,
    unitCount,
    areaM2,
    landscapeM2,
    ufwPercentage,
    kitchenLaundryPercentage,
  });

  let additionalDemand = 0;
  const demandBreakdown = [];

  const demands = buildingDemandMap[buildingName];

  // === Calculate Additional Demands ===
  if (demands.includes(4)) {
    const ac = baseResult.population * 10;
    additionalDemand += ac;
    demandBreakdown.push({ id: 4, name: waterDemandTypes[4], demandL: ac });
  }
  if (demands.includes(5)) {
    const swimming = 5000;
    additionalDemand += swimming;
    demandBreakdown.push({
      id: 5,
      name: waterDemandTypes[5],
      demandL: swimming,
    });
  }
  if (demands.includes(6)) {
    const spa = baseResult.population * 15;
    additionalDemand += spa;
    demandBreakdown.push({ id: 6, name: waterDemandTypes[6], demandL: spa });
  }
  if (demands.includes(7)) {
    const kitchen = baseResult.population * 12; // example: 12 L/person for kitchen
    additionalDemand += kitchen;
    demandBreakdown.push({
      id: 7,
      name: waterDemandTypes[7],
      demandL: kitchen,
    });
  }
  if (demands.includes(8)) {
    const foodCourt = baseResult.population * 8;
    additionalDemand += foodCourt;
    demandBreakdown.push({
      id: 8,
      name: waterDemandTypes[8],
      demandL: foodCourt,
    });
  }
  if (demands.includes(9)) {
    const carWash = 10000;
    additionalDemand += carWash;
    demandBreakdown.push({
      id: 9,
      name: waterDemandTypes[9],
      demandL: carWash,
    });
  }

  const totalWaterDemandL = baseResult.totalWaterDemandL + additionalDemand;

  return {
    ...baseResult,
    buildingName,
    appliedDemands: demands.map((id) => ({
      id,
      name: waterDemandTypes[id],
    })),
    additionalDemandBreakdown: demandBreakdown,
    additionalDemandL: Math.round(additionalDemand),
    totalWaterDemandL: Math.round(totalWaterDemandL),
    storageRequirementL: Math.round(totalWaterDemandL),
    peakDemandL: Math.round(totalWaterDemandL * 1.5),
  };
};

// === Utility Functions ===
export const getBuildingList = () => Object.keys(buildingDemandMap);

export const getBuildingTypes = () =>
  Object.keys(demandFactors).map((type) => ({
    type,
    ...demandFactors[type],
  }));

export const isValidBuildingType = (buildingType) =>
  demandFactors.hasOwnProperty(buildingType);

export const getInputType = (buildingType) =>
  demandFactors[buildingType]?.inputType || "units";

// ✅ Calculate multiple base building types (kept for backward compatibility)
export const calculateMultipleBuildings = (buildings) => {
  if (!Array.isArray(buildings) || buildings.length === 0) {
    throw new Error("Buildings array is required and must not be empty");
  }

  const results = buildings.map((building) => calculateWaterDemand(building));

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

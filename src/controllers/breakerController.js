import BreakerSizing from "../models/breakerModel.js";

// ✅ Calculation Logic
const performCalculation = (data) => {
  const cl = parseFloat(data.connectedLoad);
  const sv = parseFloat(data.systemVoltage);
  const pf = parseFloat(data.powerFactor);
  const lf = parseFloat(data.loadFactor);
  const df = parseFloat(data.demandFactor);
  const sc = parseFloat(data.spareCapacity);

  const mdFactor = lf * df;
  const mdLoadKw = cl * mdFactor;
  const mdLoadKva = mdLoadKw / pf;
  const kvar = Math.sqrt(1 - pf * pf) * mdLoadKva;

  let fullLoadCurrent;
  if (sv === 415) {
    fullLoadCurrent = (mdLoadKva * 1000) / (415 * Math.sqrt(3));
  } else {
    fullLoadCurrent = (mdLoadKva * 1000) / 240;
  }

  const designCurrent = sc === 1 ? 1.2 * fullLoadCurrent : fullLoadCurrent;

  return {
    mdFactor: +mdFactor.toFixed(2),
    mdLoadKw: +mdLoadKw.toFixed(2),
    mdLoadKva: +mdLoadKva.toFixed(2),
    kvar: +kvar.toFixed(2),
    fullLoadCurrent: +fullLoadCurrent.toFixed(2),
    designCurrent: +designCurrent.toFixed(2),
  };
};

// ✅ Save or Update Breaker Data
export const saveOrUpdateBreaker = async (req, res) => {
  try {
    const { projectId } = req.body;
    const calculation = performCalculation(req.body);

    let breaker = await BreakerSizing.findOne({ projectId });

    if (breaker) {
      // Update existing
      Object.assign(breaker, req.body, calculation);
      await breaker.save();
    } else {
      // Create new
      breaker = await BreakerSizing.create({ ...req.body, ...calculation });
    }

    res.status(200).json(breaker);
  } catch (error) {
    res
      .status(400)
      .json({ message: "Error saving data", error: error.message });
  }
};

// ✅ Get Breaker Data (Autofill)
export const getBreakerByProject = async (req, res) => {
  try {
    const { projectId } = req.params;
    const breaker = await BreakerSizing.findOne({ projectId });
    if (!breaker) return res.status(404).json({ message: "No data found" });
    res.status(200).json(breaker);
  } catch (error) {
    res
      .status(400)
      .json({ message: "Error fetching data", error: error.message });
  }
};

import { calculateRWHVolume } from "../../utils/rwhCalculator.js";

export const calculateRWHVolumeHandler = (req, res) => {
  try {
    const {
      catchmentAreaM2,
      annualRainfallMm,
      runoffCoefficient,
      pitVolumeM3,
    } = req.body;
    const result = calculateRWHVolume({
      catchmentAreaM2,
      annualRainfallMm,
      runoffCoefficient,
      pitVolumeM3,
    });
    res.json({ success: true, data: result });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message || "Error calculating RWH volume",
    });
  }
};

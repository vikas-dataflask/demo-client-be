import { calculateFireHeadLoss } from "../../services/calculations/FireFight/FireHeadloss.js";
import { calculateFirePump } from "../../services/calculations/FireFight/FirePump.js";

export const calculateFireHeadLossHandler = (req, res) => {
  try {
    const inputData = req.body;

    if (!inputData || typeof inputData !== "object") {
      return res
        .status(400)
        .json({ success: false, message: "Invalid input data" });
    }

    const result = calculateFireHeadLoss(inputData);
    res.json({ success: true, data: result });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error processing fire head loss data",
      error: error.message,
    });
  }
};

export const calculateFirePumpHandler = (req, res) => {
  try {
    const firepumpData = req.body.stations;

    if (!firepumpData || !Array.isArray(firepumpData)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid input data" });
    }

    const results = calculateFirePump(firepumpData);
    res.json({ success: true, data: results });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error processing fire pump data",
      error: error.message,
    });
  }
};

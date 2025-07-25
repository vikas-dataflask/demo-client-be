import SprinklerLayout from "../models/SprinklerLayout.js";

// ✅ Save or Update Sprinkler Layout
export const saveOrUpdateSprinklerLayout = async (req, res) => {
  try {
    const {
      projectId,
      roomId,
      length,
      width,
      hazardClass,
      ...results // will contain all calculated output
    } = req.body;

    if (!projectId || !roomId) {
      return res
        .status(400)
        .json({ message: "projectId and roomId are required" });
    }

    // Check if a record already exists for this project + room
    const existingRecord = await SprinklerLayout.findOne({ projectId, roomId });

    if (existingRecord) {
      // ✅ Update existing record
      const updated = await SprinklerLayout.findByIdAndUpdate(
        existingRecord._id,
        { length, width, hazardClass, ...results },
        { new: true }
      );
      return res
        .status(200)
        .json({ message: "Layout updated successfully", data: updated });
    }

    // ✅ Create new record
    const newLayout = await SprinklerLayout.create({
      projectId,
      roomId,
      length,
      width,
      hazardClass,
      ...results,
    });

    return res
      .status(201)
      .json({ message: "Layout saved successfully", data: newLayout });
  } catch (error) {
    console.error("Save/Update Error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// ✅ Get Sprinkler Layout by Project ID (and optional Room ID)
export const getSprinklerLayout = async (req, res) => {
  try {
    const { projectId, roomId } = req.query;

    if (!projectId) {
      return res.status(400).json({ message: "projectId is required" });
    }

    const query = { projectId };
    if (roomId) query.roomId = roomId;

    const layouts = await SprinklerLayout.find(query);

    res.status(200).json({ data: layouts });
  } catch (error) {
    console.error("Fetch Error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

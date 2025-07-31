import path from "path";
import fs from "fs";
import DxfParser from "dxf-parser";
import dxf from "../models/dxf.js";

export const parseDxf = async (req, res) => {
  try {
    let dxf_entities = undefined;

    const dxfFilePath = path.join(req.file.destination, req.file.filename);

    const dxfContents = fs.readFileSync(dxfFilePath, "utf-8");
    const parser = new DxfParser();

    try {
      const parsedData = parser.parseSync(dxfContents);
      dxf_entities = parsedData;
    } catch (parseErr) {
      return res.status(400).json({
        error: "Invalid DXF file",
        details: parseErr.message,
      });
    }
    const newDxf = new dxf(dxf_entities);
    await newDxf.save();
    res.status(201).json({
      message: `DXF successfully parsed and saved`,
      dxf: dxf_entities,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

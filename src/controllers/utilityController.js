// import path from "path";
// import fs from "fs";
// import DxfParser from "dxf-parser";
// import dxf from "../models/dxf.js";

// export const parseDxf = async (req, res) => {
//   try {
//     let dxf_entities = undefined;

//     const dxfFilePath = path.join(req.file.destination, req.file.filename);

//     const dxfContents = fs.readFileSync(dxfFilePath, "utf-8");
//     const parser = new DxfParser();

//     try {
//       const parsedData = parser.parseSync(dxfContents);
//       dxf_entities = parsedData;
//     } catch (parseErr) {
//       return res.status(400).json({
//         error: "Invalid DXF file",
//         details: parseErr.message,
//       });
//     }
//     const newDxf = new dxf(dxf_entities);
//     await newDxf.save();
//     res.status(201).json({
//       message: `DXF successfully parsed and saved`,
//       dxf: dxf_entities,
//     });
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// };

// import uploadSingleFile from "../middlewares/uploadMiddleware.js";
// import { handleDWG } from "../services/convertors/handleDWG.js";
// import { handleDXF } from "../services/convertors/handleDXF.js";
// export async function utilityController(req, res, next) {
//   uploadSingleFile(req, res, async (err) => {
//     if (err) {
//       return res
//         .status(400)
//         .json({ error: `Upload error: ${err.message || err}` });
//     }

//     if (!req.file) {
//       return res.status(400).json({
//         error:
//           "No file provided. Expecting one DWG or DXF file in field 'file'.",
//       });
//     }

//     const { originalname, buffer } = req.file;
//     const lower = originalname.toLowerCase();

//     try {
//       let json;
//       if (lower.endsWith(".dxf")) {
//         json = await handleDXF(buffer);
//       } else if (lower.endsWith(".dwg")) {
//         json = await handleDWG(buffer);
//       } else {
//         return res.status(400).json({
//           error: "Unsupported file type. Only .dxf and .dwg are allowed.",
//         });
//       }

//       // return res.status(200).json({ filename: originalname, result: json });
//       const layersObject = json.tables?.layer?.layers || {};
//       const layerNames = Object.values(layersObject).map((l) => l.name);

//       return res.status(200).json({
//         filename: originalname,
//         summary: {
//           type: json.header?.version || "Unknown",
//           entitiesCount: Array.isArray(json.entities)
//             ? json.entities.length
//             : 0,
//           layers: layerNames,
//         },
//       });
//     } catch (conversionError) {
//       return res.status(500).json({ error: conversionError.message });
//     }
//   });
// }

import uploadSingleFile from "../middlewares/uploadMiddleware.js";
import { handleDWG } from "../services/convertors/handleDWG.js";
import { handleDXF } from "../services/convertors/handleDXF.js";

export async function utilityController(req, res, next) {
  uploadSingleFile(req, res, async (err) => {
    if (err) {
      return res
        .status(400)
        .json({ error: `Upload error: ${err.message || err}` });
    }

    if (!req.file) {
      return res.status(400).json({
        error:
          "No file provided. Expecting one DWG or DXF file in field 'file'.",
      });
    }

    const { originalname, buffer } = req.file;
    const lower = originalname.toLowerCase();

    try {
      let json;

      if (lower.endsWith(".dxf")) {
        json = await handleDXF(buffer, originalname);
      } else if (lower.endsWith(".dwg")) {
        json = await handleDWG(buffer, originalname);
      } else {
        return res.status(400).json({
          error: "Unsupported file type. Only .dxf and .dwg are allowed.",
        });
      }
      return res.status(200).json({ json });
    } catch (conversionError) {
      return res.status(500).json({ error: conversionError.message });
    }
  });
}

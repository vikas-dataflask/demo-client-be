// import DxfParser from "dxf-parser";

// export async function handleDXF(dxfBuffer) {
//   try {
//     const parser = new DxfParser();
//     const parsed = parser.parseSync(dxfBuffer.toString("utf8"));

//     return parsed;
//   } catch (err) {
//     const msg =
//       err instanceof Error ? err.message : String(err ?? "Unknown error");
//     throw new Error(`Failed to parse DXF using dxf-parser: ${msg}`);
//   }
// }

import DxfParser from "dxf-parser";
import { join } from "path";
import { promises as fs } from "fs";

export async function handleDXF(dxfBuffer, filename) {
  try {
    // Save DXF buffer to uploads/dxf
    if (filename) {
      const pathToSave = join(process.cwd(), "uploads/dxf", filename);
      await fs.writeFile(pathToSave, dxfBuffer);
    }

    const parser = new DxfParser();
    const parsed = parser.parseSync(dxfBuffer.toString("utf8"));

    return parsed;
  } catch (err) {
    const msg =
      err instanceof Error ? err.message : String(err ?? "Unknown error");
    throw new Error(`Failed to parse DXF using dxf-parser: ${msg}`);
  }
}

// export const parseDxf = async (req, res) => {
//   try {
//     let dxf_entities = undefined;

//     const dxfFilePath = path.join(req.file.destination, req.file.filename);

//     const dxfContents = fs.readFileSync(dxfFilePath, "utf-8");
//     const parser = new DxfParser();

//     try {
//       const parsedData = parser.parseSync(dxfContents);
//       dxf_entities = parsedData.entities;
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

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
//         json = await handleDXF(buffer, originalname);
//       } else if (lower.endsWith(".dwg")) {
//         json = await handleDWG(buffer, originalname);
//       } else {
//         return res.status(400).json({
//           error: "Unsupported file type. Only .dxf and .dwg are allowed.",
//         });
//       }
//       return res.status(200).json({ json });
//     } catch (conversionError) {
//       return res.status(500).json({ error: conversionError.message });
//     }
//   });
// }

import uploadSingleFile from "../middlewares/uploadMiddleware.js";
import { handleDWG } from "../services/convertors/handleDWG.js";
import { handleDXF } from "../services/convertors/handleDXF.js";
import { handlePDF } from "../services/convertors/handlePDF.js";

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
          "No file provided. Expecting one DWG, DXF or PDF file in field 'file'.",
      });
    }

    const { originalname, buffer } = req.file;
    const lower = originalname.toLowerCase();

    try {
      if (lower.endsWith(".dxf")) {
        const json = await handleDXF(buffer, originalname);
        return res.status(200).json({ json });
      }

      if (lower.endsWith(".dwg")) {
        const json = await handleDWG(buffer, originalname);
        return res.status(200).json({ json });
      }

      if (lower.endsWith(".pdf")) {
        const svg = await handlePDF(buffer, originalname);
        return res.status(200).type("image/svg+xml").send(svg); // Inline SVG
      }

      return res.status(400).json({
        error: "Unsupported file type. Only .dxf, .dwg, and .pdf are allowed.",
      });
    } catch (conversionError) {
      return res.status(500).json({ error: conversionError.message });
    }
  });
}

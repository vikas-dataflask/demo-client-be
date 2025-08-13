// import { tmpdir } from "os";
// import { join } from "path";
// import { promises as fs } from "fs";
// import { execFile } from "child_process";
// import { promisify } from "util";
// import { handleDXF } from "./handleDXF.js";

// const execFileAsync = promisify(execFile);

// export async function handleDWG(dwgBuffer) {
//   const inputDwgPath = join(tmpdir(), `upload-${Date.now()}.dwg`);
//   const outputDxfPath = `${inputDwgPath}.dxf`;

//   try {
//     await fs.writeFile(inputDwgPath, dwgBuffer);
//     await execFileAsync("/usr/local/bin/dwg2dxf", [
//       inputDwgPath,
//       outputDxfPath,
//     ]);
//     const dxfBuffer = await fs.readFile(outputDxfPath);
//     const json = await handleDXF(dxfBuffer);
//     return json;
//   } catch (err) {
//     throw new Error(
//       `Failed to convert DWG to JSON: ${
//         err instanceof Error ? err.message : String(err)
//       }`
//     );
//   } finally {
//     fs.unlink(inputDwgPath).catch(() => {});
//     fs.unlink(outputDxfPath).catch(() => {});
//   }
// }

// import { tmpdir } from "os";
// import { join } from "path";
// import { promises as fs } from "fs";
// import { execFile } from "child_process";
// import { promisify } from "util";
// import { handleDXF } from "./handleDXF.js";

// const execFileAsync = promisify(execFile);

// export async function handleDWG(dwgBuffer) {
//   const inputDwgPath = join(tmpdir(), `upload-${Date.now()}.dwg`);
//   const outputDxfPath = `${inputDwgPath}.dxf`;

//   try {
//     // Write the DWG buffer to a file
//     await fs.writeFile(inputDwgPath, dwgBuffer);

//     // Convert DWG to DXF using dwg2dxf
//     await execFileAsync("/usr/local/bin/dwg2dxf", [
//       inputDwgPath,
//       outputDxfPath,
//     ]);

//     // Read the DXF file
//     const dxfBuffer = await fs.readFile(outputDxfPath);

//     // Convert DXF to JSON
//     const json = await handleDXF(dxfBuffer);

//     // Clean up DXF file AFTER JSON conversion
//     await fs.unlink(outputDxfPath).catch(() => {});

//     return json;
//   } catch (error) {
//     // Do not throw yet – check if DXF still got created
//     const exists = await fs
//       .access(outputDXfPath)
//       .then(() => true)
//       .catch(() => false);

//     if (!exists) {
//       throw new Error("Failed to convert DWG to DXF:\n" + error.stderr);
//     }
//   } finally {
//     // Always try to clean up the DWG file
//     fs.unlink(inputDwgPath).catch(() => {});
//   }
// }
// // catch (err) {
// //   throw new Error(
// //     `Failed to convert DWG to JSON: ${
// //       err instanceof Error ? err.message : String(err)
// //     }`
// //   );
// // }

// import { tmpdir } from "os";
// import { join } from "path";
// import { promises as fs } from "fs";
// import { execFile } from "child_process";
// import { promisify } from "util";
// import { handleDXF } from "./handleDXF.js";

// const execFileAsync = promisify(execFile);

// export async function handleDWG(dwgBuffer) {
//   const inputDwgPath = join(tmpdir(), `upload-${Date.now()}.dwg`);
//   const outputDxfPath = `${inputDwgPath}.dxf`;

//   try {
//     // Write the DWG buffer to a file
//     await fs.writeFile(inputDwgPath, dwgBuffer);

//     // Convert DWG to DXF using dwg2dxf
//     await execFileAsync("/usr/local/bin/dwg2dxf", [
//       inputDwgPath,
//       outputDxfPath,
//     ]);

//     // Read the DXF file
//     const dxfBuffer = await fs.readFile(outputDxfPath);

//     // Convert DXF to JSON
//     const json = await handleDXF(dxfBuffer);

//     // Clean up DXF file AFTER JSON conversion
//     await fs.unlink(outputDxfPath).catch(() => {});

//     return json;
//   } catch (error) {
//     // Check if DXF still exists even if the command threw an error
//     const exists = await fs
//       .access(outputDxfPath)
//       .then(() => true)
//       .catch(() => false);

//     if (exists) {
//       // DXF file exists — try to continue
//       const dxfBuffer = await fs.readFile(outputDxfPath);
//       const json = await handleDXF(dxfBuffer);
//       await fs.unlink(outputDxfPath).catch(() => {});
//       return json;
//     }

//     // If no DXF file exists, throw the original error
//     throw new Error("Failed to convert DWG to DXF:\n" + error.stderr);
//   } finally {
//     // Always try to clean up the DWG file
//     fs.unlink(inputDwgPath).catch(() => {});
//   }
// }

// import { tmpdir } from "os";
// import { join } from "path";
// import { promises as fs } from "fs";
// import { execFile } from "child_process";
// import { promisify } from "util";
// import { handleDXF } from "./handleDXF.js";

// const execFileAsync = promisify(execFile);

// export async function handleDWG(dwgBuffer) {
//   const inputDwgPath = join(tmpdir(), `upload-${Date.now()}.dwg`);
//   const outputDxfPath = `${inputDwgPath}.dxf`;

//   try {
//     // Write input DWG file
//     await fs.writeFile(inputDwgPath, dwgBuffer);

//     let conversionError = null;

//     // Try to convert DWG → DXF
//     try {
//       await execFileAsync("dwg2dxf", [inputDwgPath, outputDxfPath]);
//     } catch (err) {
//       // Save error, but don't throw yet
//       conversionError = err;
//     }

//     // Check if DXF was created despite errors
//     const dxfExists = await fs
//       .access(outputDxfPath)
//       .then(() => true)
//       .catch(() => false);

//     if (!dxfExists) {
//       // If no DXF, throw original conversion error
//       throw new Error(
//         "Failed to convert DWG to DXF:\n" +
//           (conversionError?.stderr ||
//             conversionError?.message ||
//             "Unknown error")
//       );
//     }

//     // DXF exists – continue with processing
//     const dxfBuffer = await fs.readFile(outputDxfPath);
//     const json = await handleDXF(dxfBuffer);

//     return json;
//   } finally {
//     // Cleanup files whether we succeed or fail
//     await Promise.allSettled([
//       fs.unlink(inputDwgPath).catch(() => {}),
//       fs.unlink(outputDxfPath).catch(() => {}),
//     ]);
//   }
// }

import { join } from "path";
import { promises as fs } from "fs";
import { execFile } from "child_process";
import { promisify } from "util";
import { handleDXF } from "./handleDXF.js";

const execFileAsync = promisify(execFile);

export async function handleDWG(dwgBuffer, filename) {
  const dwgPath = join(process.cwd(), "uploads/dwg", filename);
  const dxfPath = join(
    process.cwd(),
    "output/dxf",
    filename.replace(/\.dwg$/i, ".dxf")
  );

  try {
    // Save original DWG
    await fs.writeFile(dwgPath, dwgBuffer);

    // Convert DWG to DXF — dwg2dxf outputs in current working directory
    await execFileAsync("dwg2dxf", [dwgPath]);

    // Move generated DXF to output/dxf
    const generatedDxfPath = join(
      process.cwd(),
      filename.replace(/\.dwg$/i, ".dxf")
    );
    await fs.rename(generatedDxfPath, dxfPath);

    // Read and parse DXF
    const dxfBuffer = await fs.readFile(dxfPath);
    const json = await handleDXF(dxfBuffer);

    return json;
  } catch (err) {
    throw new Error(`DWG handling failed: ${err.message}`);
  }
}

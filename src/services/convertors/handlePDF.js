import { join } from "path";
import { promises as fs } from "fs";
import { execFile } from "child_process";
import { promisify } from "util";
import { mkdir } from "fs/promises";

const execFileAsync = promisify(execFile);

export async function handlePDF(pdfBuffer, filename) {
  const uploadsDir = join(process.cwd(), "uploads/pdf");
  const outputDir = join(process.cwd(), "output/svg");

  const inputPdfPath = join(uploadsDir, filename);
  const svgFilename = filename.replace(/\.pdf$/i, ".svg");
  const outputSvgPath = join(outputDir, svgFilename);

  try {
    // Ensure required directories exist
    await mkdir(uploadsDir, { recursive: true });
    await mkdir(outputDir, { recursive: true });

    // Save PDF file
    await fs.writeFile(inputPdfPath, pdfBuffer);

    // Convert PDF to SVG (first page only)
    await execFileAsync("pdf2svg", [inputPdfPath, outputSvgPath, "1"]);

    // Read and return SVG content
    const svgContent = await fs.readFile(outputSvgPath, "utf8");
    return svgContent;
  } catch (err) {
    throw new Error(`PDF to SVG conversion failed: ${err.message}`);
  }
}

// import multer from "multer";
// import path from "path";
// import fs from "fs";

// // Create the directory if it doesn't exist
// const uploadPath = path.join("uploads", "dxf");
// fs.mkdirSync(uploadPath, { recursive: true });

// // Configure storage
// const storage = multer.diskStorage({
//   destination: function (req, file, cb) {
//     cb(null, uploadPath);
//   },
//   filename: function (req, file, cb) {
//     const ext = path.extname(file.originalname);
//     const uniqueName = `${Date.now()}-${file.fieldname}${ext}`;
//     cb(null, uniqueName);
//   },
// });

// // File filter for DXF only
// const fileFilter = (req, file, cb) => {
//   if (
//     file.mimetype === "application/dxf" ||
//     file.originalname.endsWith(".dxf")
//   ) {
//     cb(null, true);
//   } else {
//     cb(new Error("Only DXF files are allowed"), false);
//   }
// };

// const upload = multer({ storage, fileFilter });

// export default upload;

// import multer from "multer";
// import path from "path";

// const storage = multer.memoryStorage();

// const allowedExts = [".dxf", ".dwg"];

// const fileFilter = (req, file, cb) => {
//   const ext = path.extname(file.originalname).toLowerCase();
//   if (!allowedExts.includes(ext)) {
//     return cb(new Error("Only DXF and DWG files are allowed"));
//   }
//   cb(null, true);
// };

// const uploadMiddleware = multer({
//   storage,
//   fileFilter,
//   limits: { fileSize: 200 * 1024 * 1024 },
// });

// export default uploadMiddleware;

// uploadMiddleware.ts
import multer from "multer";
import path from "path";

const storage = multer.memoryStorage();
const allowedExts = [".dxf", ".dwg", ".pdf"];

const fileFilter = (req, file, cb) => {
  const ext = path.extname(file.originalname).toLowerCase();
  if (!allowedExts.includes(ext)) {
    return cb(new Error("Only .dxf and .dwg files are allowed"));
  }
  cb(null, true);
};

// This exports a middleware that accepts exactly one file under field name "dxf_file"
const uploadSingleFile = multer({
  storage,
  fileFilter,
  limits: { fileSize: 200 * 1024 * 1024 }, // 200MB
}).single("dxf_file");

export default uploadSingleFile;
export { uploadSingleFile };

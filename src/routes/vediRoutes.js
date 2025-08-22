// routes/designBotRoutes.js

import express from "express";
import multer from "multer";
import vediProcessing from "../controllers/vediController.js";
import e from "express";

const router = express.Router();

// simple disk storage to /tmp (or change as needed)
const upload = multer({ dest: "/tmp" });

// Frontend must send multipart/form-data with field name "pdf"
router.post("/", upload.single("pdf"), vediProcessing);

export default router;

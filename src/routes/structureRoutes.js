import express from "express";
import verifyToken from "../middlewares/authMiddleware.js";
import { 
  calculateSlabDesign, 
  getSlabDesign, 
  getProjectSlabDesigns 
} from "../controllers/structure/slabController.js";
import { 
  calculateBeamDesign, 
  getBeamDesign, 
  getProjectBeamDesigns 
} from "../controllers/structure/beamController.js";
import { 
  createColumnDesign, 
  getColumnDesign, 
  getProjectColumnDesigns,
  updateColumnDesign,
  deleteColumnDesign 
} from "../controllers/structure/columnController.js";
import { 
  createFootingDesign, 
  getFootingDesign, 
  getProjectFootingDesigns,
  updateFootingDesign,
  deleteFootingDesign 
} from "../controllers/structure/footingController.js";
import { 
  createStaircaseDesign, 
  getStaircaseDesign, 
  getProjectStaircaseDesigns,
  updateStaircaseDesign,
  deleteStaircaseDesign 
} from "../controllers/structure/staircaseController.js";
import { 
  createShearWallDesign, 
  getProjectShearWallDesigns, 
  getShearWallDesign,
  updateShearWallDesign,
  deleteShearWallDesign 
} from "../controllers/structure/shearWallController.js";

const router = express.Router();

// Structure Design Routes

// Slab Design Routes
router.post("/slab-design", verifyToken, calculateSlabDesign);
router.get("/slab-design/:designId", verifyToken, getSlabDesign);
router.get("/project/:projectId/slab-designs", verifyToken, getProjectSlabDesigns);

// Beam Design Routes
router.post("/beam-design", verifyToken, calculateBeamDesign);
router.get("/beam-design/:designId", verifyToken, getBeamDesign);
router.get("/project/:projectId/beam-designs", verifyToken, getProjectBeamDesigns);

// Column Design Routes
router.post("/column-design", verifyToken, createColumnDesign);
router.get("/column-design/:id", verifyToken, getColumnDesign);
router.get("/project/:projectId/column-designs", verifyToken, getProjectColumnDesigns);
router.put("/column-design/:id", verifyToken, updateColumnDesign);
router.delete("/column-design/:id", verifyToken, deleteColumnDesign);

// Footing Design Routes
router.post("/footing-design", verifyToken, createFootingDesign);
router.get("/footing-design/:id", verifyToken, getFootingDesign);
router.get("/project/:projectId/footing-designs", verifyToken, getProjectFootingDesigns);
router.put("/footing-design/:id", verifyToken, updateFootingDesign);
router.delete("/footing-design/:id", verifyToken, deleteFootingDesign);

// Staircase Design Routes
router.post("/staircase-design", verifyToken, createStaircaseDesign);
router.get("/staircase-design/:id", verifyToken, getStaircaseDesign);
router.get("/project/:projectId/staircase-designs", verifyToken, getProjectStaircaseDesigns);
router.put("/staircase-design/:id", verifyToken, updateStaircaseDesign);
router.delete("/staircase-design/:id", verifyToken, deleteStaircaseDesign);

// Shear Wall Design Routes
router.post("/shear-wall-design", verifyToken, createShearWallDesign);
router.get("/shear-wall-design/:id", verifyToken, getShearWallDesign);
router.get("/project/:projectId/shear-wall-designs", verifyToken, getProjectShearWallDesigns);
router.put("/shear-wall-design/:id", verifyToken, updateShearWallDesign);
router.delete("/shear-wall-design/:id", verifyToken, deleteShearWallDesign);

// Legacy slab routes (for backward compatibility)
router.get("/slab", verifyToken, (req, res) => {
  res.json({
    success: true,
    message: "Slab design endpoint - use /slab-design for calculations",
    data: {
      type: "slab-design",
      status: "ready"
    }
  });
});

router.post("/slab", verifyToken, calculateSlabDesign);

// Legacy beam routes (for backward compatibility)
router.get("/beam", verifyToken, (req, res) => {
  res.json({
    success: true,
    message: "Beam design endpoint - use /beam-design for calculations",
    data: {
      type: "beam-design",
      status: "ready"
    }
  });
});

router.post("/beam", verifyToken, calculateBeamDesign);

// Legacy column routes (for backward compatibility)
router.get("/column", verifyToken, (req, res) => {
  res.json({
    success: true,
    message: "Column design endpoint - use /column-design for calculations",
    data: {
      type: "column-design",
      status: "ready"
    }
  });
});

router.post("/column", verifyToken, createColumnDesign);

// Legacy footing routes (for backward compatibility)
router.get("/footing", verifyToken, (req, res) => {
  res.json({
    success: true,
    message: "Footing design endpoint - use /footing-design for calculations",
    data: {
      type: "footing-design",
      status: "ready"
    }
  });
});

router.post("/footing", verifyToken, createFootingDesign);

// Legacy staircase routes (for backward compatibility)
router.get("/staircase", verifyToken, (req, res) => {
  res.json({
    success: true,
    message: "Staircase design endpoint - use /staircase-design for calculations",
    data: {
      type: "staircase-design",
      status: "ready"
    }
  });
});

router.post("/staircase", verifyToken, createStaircaseDesign);

// Legacy shear wall routes (for backward compatibility)
router.get("/shearwall", verifyToken, (req, res) => {
  res.json({
    success: true,
    message: "Shear wall design endpoint - use /shear-wall-design for calculations",
    data: {
      type: "shear-wall-design",
      status: "ready"
    }
  });
});

router.post("/shearwall", verifyToken, createShearWallDesign);

export default router; 
import express from 'express';
import {
  calculateCableSizeAPI,
  getCableSizes,
  getMCBRatings,
  bulkCalculateCableSize,
  getReferenceData,
  saveCableSizingData,
  getCableSizingByProject
} from '../controllers/cableSizingController.js';
import verifyToken from '../middlewares/authMiddleware.js';

const router = express.Router();

// Public route
router.get('/reference', getReferenceData);

// Authenticated routes
router.use(verifyToken);
router.post('/calculate', calculateCableSizeAPI);
router.get('/cable-sizes', getCableSizes);
router.get('/mcb-ratings', getMCBRatings);
router.post('/bulk-calculate', bulkCalculateCableSize);
router.post('/save', saveCableSizingData);
router.get('/:projectId', getCableSizingByProject);

export default router;

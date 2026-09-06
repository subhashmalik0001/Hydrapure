import { Router } from 'express';
import { dashboardController } from '../controllers/dashboard.controller.js';

const router = Router();

router.get('/summary', dashboardController.getSummary);
router.get('/map', dashboardController.getMapStations);
router.get('/regions', dashboardController.getRegionalBreakdown);

export default router;

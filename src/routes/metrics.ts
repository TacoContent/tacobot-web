import { Router, Request, Response } from 'express';
import { ui } from '../middleware';
import MetricsController from '../controllers/MetricsController';

const metricsController = new MetricsController();

const router: Router = Router();

router.get('/metrics', ui.allow, metricsController.get.bind(metricsController));

export default router;
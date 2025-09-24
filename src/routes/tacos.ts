import { Router, Request, Response } from 'express';
import * as ui from '../middleware/ui';
import TacosController from '../controllers/TacosController';

const router = Router();
const tacosController = new TacosController();

router.get('/tacos/', ui.allow, tacosController.list);

export default router;
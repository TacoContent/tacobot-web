import { Router, Request, Response } from 'express';
import * as ui from '../middleware/ui';
import LogsController from '../controllers/LogsController';

const router = Router();
const logsController = new LogsController();

router.get('/logs/', ui.allow, logsController.list.bind(logsController));
router.post('/logs/clear', ui.allow, logsController.clear.bind(logsController));

export default router;
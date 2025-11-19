import { Router } from 'express';
import * as ui from '../middleware/ui';
import PullTabsController from '../controllers/PullTabsController';

const router = Router();
const pulltabsController = new PullTabsController();

router.get('/pulltabs/', ui.allow, pulltabsController.list);

export default router;
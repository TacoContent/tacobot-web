import { Router } from 'express';
import * as ui from '../middleware/ui';
import PullTabsController from '../controllers/PullTabsController';

const router = Router();
const pulltabsController = new PullTabsController();

router.get('/pulltabs/', ui.allow, pulltabsController.list);
router.post('/pulltabs/redeem', ui.allow, pulltabsController.redeem.bind(pulltabsController));

export default router;
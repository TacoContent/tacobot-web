import { Router, Request, Response } from 'express';
import * as ui from '../middleware/ui';
import AccountAgeController from '../controllers/AccountAgeController';

const router = Router();
const accountAgeController = new AccountAgeController();

router.get('/accountage/', ui.allow, accountAgeController.list.bind(accountAgeController));
router.get('/accountage/events', ui.allow, accountAgeController.events.bind(accountAgeController));

export default router;
import { Router, Request, Response } from 'express';
import FreeGameKeysController from '../controllers/FreeGameKeysController';
import * as ui from '../middleware/ui';

const router = Router();
const freeGameKeysController = new FreeGameKeysController();


router.get('/freegames', ui.allow, freeGameKeysController.list);
export default router;

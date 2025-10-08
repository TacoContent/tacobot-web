import { Router } from 'express';
import GameKeysController from '../controllers/GameKeysController';
import * as ui from '../middleware/ui';

const router = Router();
const gameKeysController = new GameKeysController();


router.get('/gamekeys', ui.allow, gameKeysController.list);
export default router;

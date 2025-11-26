import { Router } from 'express';
import GameKeysController from '../controllers/GameKeysController';
import * as ui from '../middleware/ui';

const router = Router();
const gameKeysController = new GameKeysController();


router.get('/gamekeys', ui.allow, gameKeysController.list.bind(gameKeysController));
router.get('/gamekeys/submit', ui.allow, gameKeysController.submitView.bind(gameKeysController));
router.post('/gamekeys/submit', ui.allow, gameKeysController.submit.bind(gameKeysController));
export default router;

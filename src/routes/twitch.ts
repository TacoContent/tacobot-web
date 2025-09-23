import { Router, Request, Response } from 'express';
import * as ui from '../middleware/ui';
import TwitchController from '../controllers/TwitchController';

const router = Router();
const twitchController = new TwitchController();

router.get('/twitch/channels/', twitchController.listChannels);
router.get('/twitch/linked/', twitchController.listLinkedUsers);

export default router;

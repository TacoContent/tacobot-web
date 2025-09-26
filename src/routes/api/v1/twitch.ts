import { Router, Request, Response, NextFunction } from 'express';
import TwitchController from '../../../controllers/api/v1/TwitchController';


const router = Router();
const twitchController = new TwitchController();

router.route('/api/v1/twitch/avatar/:username').get(
  (req: Request, res: Response, next: NextFunction) => twitchController.getAvatar(req, res, next).catch(next)
);

export default router;
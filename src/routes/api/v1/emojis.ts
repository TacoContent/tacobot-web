import { Router, Request, Response, NextFunction } from 'express';
import EmojisController from '../../../controllers/api/v1/EmojisController';


const router = Router();
const emojisController = new EmojisController();

router.route('/api/v1/emojis/:guild').get(
  (req: Request, res: Response, next: NextFunction) => emojisController.getEmojis(req, res, next).catch(next)
);
router.route('/api/v1/emoji/:guild/:id').get(
  (req: Request, res: Response, next: NextFunction) => emojisController.getEmojiById(req, res, next).catch(next)
);

router.route('/api/v1/emoji/:guild/lookup/:name').get(
  (req: Request, res: Response, next: NextFunction) => emojisController.getEmojiByName(req, res, next).catch(next)
);

export default router;
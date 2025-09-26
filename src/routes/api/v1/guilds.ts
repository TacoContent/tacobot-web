import { Router, Request, Response, NextFunction } from 'express';
import GuildsController from '../../../controllers/api/v1/GuildsController';


const router = Router();
const guildsController = new GuildsController();

router.route('/api/v1/guilds/lookup/:id').get(
  (req: Request, res: Response, next: NextFunction) => guildsController.get(req, res, next).catch(next)
);
router.route('/api/v1/guild/lookup/:id').get(
  (req: Request, res: Response, next: NextFunction) => guildsController.get(req, res, next).catch(next)
);

router.route('/api/v1/guilds/lookup/batch').post(
  (req: Request, res: Response, next: NextFunction) => guildsController.batchGet(req, res, next).catch(next)
);

export default router;
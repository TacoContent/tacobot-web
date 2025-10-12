import { Router, Request, Response, NextFunction } from 'express';
import GuildsController from '../../../controllers/api/v1/GuildsController';


const router = Router();
const guildsController = new GuildsController();

router.route('/api/v1/guilds').get(guildsController.list.bind(guildsController));
router.route('/api/v1/guilds/lookup/:id').get(guildsController.get.bind(guildsController));
router.route('/api/v1/guild/lookup/:id').get(guildsController.get.bind(guildsController));
router.route('/api/v1/guilds/lookup/batch').post(guildsController.batchGet.bind(guildsController));

export default router;
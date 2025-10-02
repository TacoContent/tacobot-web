import { Router, Request, Response, NextFunction } from 'express';
import ChannelsController from '../../../controllers/api/v1/ChannelsController';

const router = Router();
const channelsController = new ChannelsController();

router.route('/api/v1/channels/:guild').get(channelsController.getChannels.bind(channelsController));

// router.route('/api/v1/channel/:guild/:id').get(channelsController.getChannelById.bind(channelsController));

// Batch channel endpoint - supports both POST with body and GET with query params
router.route('/api/v1/channels/:guild/batch/ids')
  .post(channelsController.getChannelsByIds.bind(channelsController))
  .get(channelsController.getChannelsByIds.bind(channelsController));

// router.route('/api/v1/channels/:guild/batch/ids')
//   .post((req: Request, res: Response, next: NextFunction) => channelsController.getChannelsByIds(req, res, next).catch(next))
//   .get((req: Request, res: Response, next: NextFunction) => channelsController.getChannelsByIds(req, res, next).catch(next));

export default router;
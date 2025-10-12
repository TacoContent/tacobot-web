import { Router, Request, Response, NextFunction } from 'express';
import EmojisController from '../../../controllers/api/v1/EmojisController';


const router = Router();
const emojisController = new EmojisController();

router.route('/api/v1/emojis/:guild').get(emojisController.getEmojis.bind(emojisController));
router.route('/api/v1/emoji/:guild/:id').get(emojisController.getEmojiById.bind(emojisController));

router.route('/api/v1/emoji/:guild/lookup/:name').get(emojisController.getEmojiByName.bind(emojisController));

// Batch emoji endpoint - supports both POST with body and GET with query params
router.route('/api/v1/emojis/:guild/batch/ids')
  .post(emojisController.getEmojisByIds.bind(emojisController))
  .get(emojisController.getEmojisByIds.bind(emojisController));

// Batch emoji names endpoint - supports both POST with body and GET with query params
router.route('/api/v1/emojis/:guild/batch/names')
  .post(emojisController.getEmojisByNames.bind(emojisController))
  .get(emojisController.getEmojisByNames.bind(emojisController));

export default router;
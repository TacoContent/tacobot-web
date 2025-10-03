import { Router } from 'express';
import MentionablesController from '../../../controllers/api/v1/MentionablesController';

const router = Router();
const controller = new MentionablesController();

// POST /api/v1/mentionables/:guild/batch/ids
router.post('/api/v1/mentionables/:guild/batch/ids', controller.getBatchByIds.bind(controller));

export default router;

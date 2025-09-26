import { Router, Request, Response } from 'express';
import * as ui from '../middleware/ui';
import PermissionsController from '../controllers/PermissionsController';

const router = Router();
const permissionsController = new PermissionsController();

router.get('/permissions/', ui.allow, permissionsController.list);

export default router;
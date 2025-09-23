import { Router, Request, Response } from 'express';
import MinecraftUsersController from '../controllers/MinecraftUsersController';
import Games from '../libs/consts/SHiFTCodes/Games';
import * as ui from '../middleware/ui';

const router = Router();
const minecraftUsersController = new MinecraftUsersController();

router.get('/minecraft/ops', minecraftUsersController.listOps);
router.get('/minecraft/whitelist', minecraftUsersController.listNonOps);

export default router;

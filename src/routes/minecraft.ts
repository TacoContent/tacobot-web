import { Router } from 'express';
import MinecraftUsersController from '../controllers/MinecraftController';
import * as ui from '../middleware/ui';

const router = Router();
const minecraftUsersController = new MinecraftUsersController();

router.get('/minecraft/ops', ui.allow, minecraftUsersController.listOps);
router.get('/minecraft/whitelist', ui.allow, minecraftUsersController.listWhitelist);
router.get('/minecraft/worlds', ui.allow, minecraftUsersController.listWorlds);

export default router;

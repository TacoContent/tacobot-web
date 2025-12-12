import { Router } from 'express';
import MinecraftUsersController from '../controllers/MinecraftController';
import * as ui from '../middleware/ui';

const router = Router();
const minecraftUsersController = new MinecraftUsersController();

router.get('/minecraft/ops', ui.allow, minecraftUsersController.listOps);
router.get('/minecraft/whitelist', ui.allow, minecraftUsersController.listWhitelist);
router.get('/minecraft/worlds', ui.allow, minecraftUsersController.listWorlds);

router.get('minecraft/shops', ui.allow, async (req, res) => {
  res.render('minecraft/shops/list', {
    ...res.locals,
    title: 'Minecraft Shops',
  });
});

router.get('/minecraft/shop/:id', ui.allow, async (req, res) => {
  res.render('minecraft/shops/view', {
    ...res.locals,
    title: 'Minecraft Shop Details',
    shopId: req.params.id,
  });
});

export default router;

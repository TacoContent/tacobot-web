import { Router } from 'express';
import MinecraftController from '../controllers/MinecraftController';
import * as ui from '../middleware/ui';

const router = Router();
const minecraftController = new MinecraftController();

router.get('/minecraft/ops', ui.allow, minecraftController.listOps.bind(minecraftController));
router.get('/minecraft/whitelist', ui.allow, minecraftController.listWhitelist.bind(minecraftController));
router.get('/minecraft/worlds', ui.allow, minecraftController.listWorlds.bind(minecraftController));

router.get('/minecraft/shops', ui.allow, minecraftController.listShops.bind(minecraftController));

router.get('/minecraft/shop/new', ui.allow, minecraftController.createShopForm.bind(minecraftController));

router.get('/minecraft/shop/:id/edit', ui.allow, minecraftController.editShopForm.bind(minecraftController));

router.get('/minecraft/shop/:id/items', ui.allow, minecraftController.viewShopItems.bind(minecraftController));

router.get('/minecraft/shop/:id/items/new', ui.allow, async (req, res) => {
  res.render('minecraft/shop/item/edit', {
    ...res.locals,
    title: 'Add Shop Item',
    shopId: req.params.id,
  });
});

export default router;

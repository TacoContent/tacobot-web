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
router.get('/minecraft/shop/:id/items', ui.allow, minecraftController.listShopItems.bind(minecraftController));

router.post('/minecraft/shop/item/save', ui.allow, minecraftController.updateShopItem.bind(minecraftController));
router.get('/minecraft/shop/:id/item/:variantId/edit', ui.allow, minecraftController.editShopItemForm.bind(minecraftController));
router.get('/minecraft/shop/:id/item/new', ui.allow, minecraftController.createShopItemForm.bind(minecraftController));
router.post('/minecraft/shop/:id/item/:variantId/delete', ui.allow, minecraftController.deleteShopItem.bind(minecraftController));
router.post('/minecraft/shop/item/enabled', ui.allow, minecraftController.setShopItemEnabled.bind(minecraftController));

router.get('/minecraft/item/:id/image', ui.allow, minecraftController.getItemImageById.bind(minecraftController));

export default router;

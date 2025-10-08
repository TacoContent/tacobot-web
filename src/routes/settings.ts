import { Router } from 'express';
import * as ui from '../middleware/ui';
import SettingsController from '../controllers/SettingsController';

const router = Router();
const settingsController = new SettingsController();

router.get('/settings/edit/:guildId/:name', ui.allow, settingsController.edit);

export default router;
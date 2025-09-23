
import HealthRouter from './health';
import HomeRouter from './home';
import ShiftCodesRouter from './shiftcodes';
import ScriptsRouter from './scripts';
import GameKeysRouter from './gamekeys';
import FreeGameKeysRouter from './freegames';
import MinecraftUsersRouter from './minecraft';
import TwitchRouter from './twitch';

import ApiV1UsersRouter from './api/v1/users';
import ApiV1GuildsRouter from './api/v1/guilds';
import ApiV1TwitchRouter from './api/v1/twitch';

import { Router } from 'express';

const router: Router = Router();

router.use('/', HealthRouter);
router.use('/', HomeRouter);
router.use('/', ScriptsRouter);
router.use('/', ShiftCodesRouter);
router.use('/', GameKeysRouter);
router.use('/', FreeGameKeysRouter);
router.use('/', MinecraftUsersRouter);
router.use('/', TwitchRouter);

router.use('/', ApiV1UsersRouter);
router.use('/', ApiV1GuildsRouter);
router.use('/', ApiV1TwitchRouter);

export default router;

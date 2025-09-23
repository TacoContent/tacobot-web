
import HealthRouter from './health';
import HomeRouter from './home';
import ShiftCodesRouter from './shiftcodes';
import ScriptsRouter from './scripts';
import GameKeysRouter from './gamekeys';
import FreeGameKeysRouter from './freegames';

import ApiV1UsersRouter from './api/v1/users';

import { Router } from 'express';

const router: Router = Router();

router.use('/', HealthRouter);
router.use('/', HomeRouter);
router.use('/', ScriptsRouter);
router.use('/', ShiftCodesRouter);
router.use('/', GameKeysRouter);
router.use('/', FreeGameKeysRouter);

router.use('/', ApiV1UsersRouter);

export default router;

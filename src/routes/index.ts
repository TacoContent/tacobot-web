
import HealthRouter from './health';
import HomeRouter from './home';
import ShiftCodesRouter from './shiftcodes';
import { Router } from 'express';

const router: Router = Router();

router.use('/', HealthRouter);
router.use('/', HomeRouter);
router.use('/', ShiftCodesRouter);

export default router;

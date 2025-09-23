import { Router, Request, Response } from 'express';
import ShiftCodeController from '../controllers/ShiftCodeController';
import Games from '../libs/consts/SHiFTCodes/Games';
import * as ui from '../middleware/ui';

const router = Router();
const shiftCodeController = new ShiftCodeController();

// GET /shiftcode/submit
router.get('/shiftcodes/submit', ui.allow, (req: Request, res: Response) => {
  res.render('shiftcodes/submit', { title: 'Submit SHiFT Code', games: Games, now: new Date().toISOString().slice(0,16) });
});

router.post('/shiftcodes/submit', shiftCodeController.submit);
router.get('/shiftcodes', shiftCodeController.list);
router.get('/shiftcodes/list', shiftCodeController.list);
export default router;

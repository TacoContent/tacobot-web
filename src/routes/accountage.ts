import { Router, Request, Response } from 'express';
import * as ui from '../middleware/ui';
import AccountAgeController from '../controllers/AccountAgeController';

const router = Router();
const accountAgeController = new AccountAgeController();

// router.get('/announcements/', ui.allow, birthdayController.list.bind(birthdayController));
router.get('/accountage/', ui.allow, accountAgeController.list.bind(accountAgeController));

router.get('/accountage/events', ui.allow, (req: Request, res: Response) => {
  res.render('accountage/events', { title: 'Account Age: Events' });
});

export default router;
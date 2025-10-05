import { Router, Request, Response } from 'express';
import * as ui from '../middleware/ui';
// import BirthdayController from '../controllers/BirthdayController';

const router = Router();
// const birthdayController = new BirthdayController();

// router.get('/announcements/', ui.allow, birthdayController.list.bind(birthdayController));
router.get('/announcements/', ui.allow, (req: Request, res: Response) => {
  res.render('announcements/list', { title: 'Announcements' });
});

router.get('/announcements/add', ui.allow, (req: Request, res: Response) => {
  res.render('announcements/add', { title: 'Post Announcement' });
});

export default router;
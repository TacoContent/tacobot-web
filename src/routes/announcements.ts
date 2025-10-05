import { Router, Request, Response } from 'express';
import * as ui from '../middleware/ui';
import AnnouncementsController from '../controllers/AnnouncementsController';
// import BirthdayController from '../controllers/BirthdayController';

const router = Router();
const announcementsController = new AnnouncementsController();

// router.get('/announcements/', ui.allow, birthdayController.list.bind(birthdayController));
router.get('/announcements/', ui.allow, announcementsController.list.bind(announcementsController));

router.get('/announcements/add', ui.allow, (req: Request, res: Response) => {
  res.render('announcements/add', { title: 'Post Announcement' });
});

export default router;
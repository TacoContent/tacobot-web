import { Router, Request, Response } from 'express';
import * as ui from '../middleware/ui';
import BirthdayController from '../controllers/BirthdayController';

const router = Router();
const birthdayController = new BirthdayController();

router.get('/birthdays/', ui.allow, birthdayController.list.bind(birthdayController));

export default router;
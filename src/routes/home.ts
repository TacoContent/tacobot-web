import { Router, Request, Response } from 'express';
import { ui } from '../middleware';

const router: Router = Router();

router.get('/', ui.allow, async (req: Request, res: Response) => {
  res.render("index", { title: 'Home' });
});

export default router;

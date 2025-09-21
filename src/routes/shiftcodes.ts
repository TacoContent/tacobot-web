import { Router, Request, Response } from 'express';
import Games from '../libs/consts/SHiFTCodes/Games';


const router = Router();

// GET /shiftcode/submit
router.get('/shiftcode/submit', (req: Request, res: Response) => {
  res.render('shiftcodes/submit', { title: 'Submit SHiFT Code', games: Games, now: new Date().toISOString().slice(0,16) });
});

router.post('/shiftcode/submit', (req: Request, res: Response) => {
  const { code } = req.body;
  // take the comma separated values for games and platforms, and create arrays
  const games = req.body.games.split(',').map((game: string) => game.trim());
  const platforms = req.body.platforms.split(',').map((platform: string) => platform.trim());



  // Handle the submitted SHiFT code here
  res.redirect('/shiftcode/submit');
}); 
export default router;

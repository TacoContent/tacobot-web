import { Router, Request, Response, NextFunction } from 'express';
import UsersController from '../../../controllers/api/v1/UsersController';


const router = Router();
const usersController = new UsersController();

router.route('/api/v1/users/:id').get(
  (req: Request, res: Response, next: NextFunction) => usersController.get(req, res, next).catch(next)
);
router.route('/api/v1/user/:id').get(
  (req: Request, res: Response, next: NextFunction) => usersController.get(req, res, next).catch(next)
);

router.route('/api/v1/users/batch').post(
  (req: Request, res: Response, next: NextFunction) => usersController.batchGet(req, res, next).catch(next)
);

export default router;
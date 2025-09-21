import { Request, Response, NextFunction } from 'express';
import config from '../config';

export function configToHbs() {
  return function (req: Request, res: Response, next: NextFunction) {
    res.locals.config = config;
    next();
  };
}

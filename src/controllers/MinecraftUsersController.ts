import configs from '../config';
import LogsMongoClient from '../libs/mongo/Logs';
import Reflection from '../libs/Reflection';
import { Request, Response, NextFunction } from 'express';
import MinecraftUsersMongoClient from '../libs/mongo/MinecraftUsers';

export default class MinecraftUsersController {
  private logger = new LogsMongoClient();
  private MODULE = this.constructor.name;

  async listOps(req: Request, res: Response, next: NextFunction): Promise<void> {
    const METHOD = Reflection.getCallingMethodName();
    try {
      const page = Math.max(1, parseInt(req.query.page as string) || 1);
      const pageSize = 10;

      const client = new MinecraftUsersMongoClient();
      const pagedResults = await client.getOps((page - 1) * pageSize, pageSize);
      

      res.render('minecraft/ops/list', {
        title: 'Minecraft Ops',
        items: pagedResults.items,
        pager: pagedResults.getPager(),
      });

    } catch (error: any) {
      // this.logger.error(METHOD, error);
      console.error(error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  }

  async listNonOps(req: Request, res: Response, next: NextFunction): Promise<void> {
    const METHOD = Reflection.getCallingMethodName();
    try {
      const page = Math.max(1, parseInt(req.query.page as string) || 1);
      const pageSize = 10;

      const client = new MinecraftUsersMongoClient();
      const pagedResults = await client.getNonOps((page - 1) * pageSize, pageSize);

      res.render('minecraft/whitelist/list', {
        title: 'Minecraft Whitelist',
        items: pagedResults.items,
        pager: pagedResults.getPager(),
      });

    } catch (error: any) {
      // this.logger.error(METHOD, error);
      console.error(error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  }
}
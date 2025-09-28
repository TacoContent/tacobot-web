import configs from '../config';
import LogsMongoClient from '../libs/mongo/Logs';
import Reflection from '../libs/Reflection';
import { Request, Response, NextFunction } from 'express';
import MinecraftUsersMongoClient from '../libs/mongo/MinecraftUsers';
import MinecraftWorldsMongoClient from '../libs/mongo/MinecraftWorlds';
export default class MinecraftUsersController {
  private logger = new LogsMongoClient();
  private MODULE = this.constructor.name;

  async listOps(req: Request, res: Response, next: NextFunction): Promise<void> {
    const METHOD = Reflection.getCallingMethodName();
    try {
      const page = Math.max(1, parseInt(req.query.page as string) || 1);
      const pageSize = 10;
      const search: string | undefined = (req.query.search as string) || undefined;
      const client = new MinecraftUsersMongoClient();
      const pagedResults = await client.getOps((page - 1) * pageSize, pageSize, search);

      res.render('minecraft/ops/list', {
        ...res.locals,
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

  async listWhitelist(req: Request, res: Response, next: NextFunction): Promise<void> {
    const METHOD = Reflection.getCallingMethodName();
    try {
      const page = Math.max(1, parseInt(req.query.page as string) || 1);
      const pageSize = 10;
      const search: string | undefined = (req.query.search as string) || undefined;

      const client = new MinecraftUsersMongoClient();
      const pagedResults = await client.getWhitelist((page - 1) * pageSize, pageSize, search);

      res.render('minecraft/whitelist/list', {
        ...res.locals,
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

  async listWorlds(req: Request, res: Response, next: NextFunction): Promise<void> {
    const METHOD = Reflection.getCallingMethodName();
    try {
      const page = Math.max(1, parseInt(req.query.page as string) || 1);
      const pageSize = 10;
      const search: string | undefined = (req.query.search as string) || undefined;

      const client = new MinecraftWorldsMongoClient();
      const pagedResults = await client.getWorlds((page - 1) * pageSize, pageSize, search);
      res.render('minecraft/worlds/list', {
        ...res.locals,
        title: 'Minecraft Worlds',
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
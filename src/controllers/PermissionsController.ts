import configs from '../config';
import LogsMongoClient from '../libs/mongo/Logs';
import PermissionsMongoClient from '../libs/mongo/Permissions';
import Reflection from '../libs/Reflection';
import { Request, Response, NextFunction } from 'express';

export default class PermissionsController {
  private logger = new LogsMongoClient();
  private MODULE = this.constructor.name;

  async list(req: Request, res: Response, next: NextFunction): Promise<void> {
    const METHOD = Reflection.getCallingMethodName();
    try {
      const page = Math.max(1, parseInt(req.query.page as string) || 1);
      const pageSize = 10;
      const search: string | undefined = (req.query.search as string) || undefined;

      const client = new PermissionsMongoClient();
      const pagedResults = await client.get((page - 1) * pageSize, pageSize, search);

      res.render('permissions/list', {
        ...res.locals,
        title: 'User Permissions',
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
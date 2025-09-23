import { Request, Response, NextFunction } from 'express';
import LogsMongoClient from '../libs/mongo/Logs';
import FreeGameKeysMongoClient from '../libs/mongo/FreeGameKeys';


export default class FreeGameKeysController {
  private logger = new LogsMongoClient();
  private MODULE = this.constructor.name;

  public list = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const page = Math.max(1, parseInt(req.query.page as string) || 1);
    const pageSize = Math.max(1, parseInt(req.query.pageSize as string) || 10);
    const client = new FreeGameKeysMongoClient();
    // Get paginated game keys
    const results = await client.get((page - 1) * pageSize, pageSize);
    res.render('freegamekeys/list', {
      title: 'Free Games',
      items: results.items,
      pager: results.getPager(),
    });
  };
};
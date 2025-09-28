import config from '../config';
import { Request, Response, NextFunction } from 'express';
import LogsMongoClient from '../libs/mongo/Logs';
import GameKeysMongoClient from '../libs/mongo/GameKeys';


export default class GameKeysController {
  private logger = new LogsMongoClient();
  private MODULE = this.constructor.name;

  public list = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const page = Math.max(1, parseInt(req.query.page as string) || 1);
    const pageSize = Math.max(1, parseInt(req.query.pageSize as string) || 10);
    const search = (req.query.search as string) || null;
    const client = new GameKeysMongoClient();
    // Get paginated game keys
    const results = await client.get((page - 1) * pageSize, pageSize, search);

    res.render('gamekeys/list', {
      ...res.locals,
      title: 'Game Keys',
      items: results.items,
      pager: results.getPager(),
    });
  };
};
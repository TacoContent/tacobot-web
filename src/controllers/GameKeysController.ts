import config from '../config';
import { Request, Response, NextFunction } from 'express';
import LogsMongoClient from '../libs/mongo/Logs';
import GameKeysMongoClient from '../libs/mongo/GameKeys';
import moment from 'moment';


export default class GameKeysController {
  private logger = new LogsMongoClient();
  private MODULE = this.constructor.name;

  public list = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const page = Math.max(1, parseInt(req.query.page as string) || 1);
    const pageSize = Math.max(1, parseInt(req.query.pageSize as string) || 10);
    const search: string | undefined = (req.query.search as string) || undefined;
    const client = new GameKeysMongoClient();

        const additionalFilters: any = {};
    
    const qIncludeAvailable = req.query.includeAvailable === undefined ? undefined : req.query.includeAvailable === 'true';
    const qIncludeRedeemed = req.query.includeRedeemed === undefined ? undefined : req.query.includeRedeemed === 'true';
    const includeAvailable: boolean = qIncludeAvailable === undefined ? true : qIncludeAvailable;
    const includeRedeemed: boolean = qIncludeRedeemed === undefined ? true : qIncludeRedeemed;
    if (!includeAvailable && !includeRedeemed) {
      // if neither is included, add a filter that matches nothing
      additionalFilters._id = null;
    } else if (!includeAvailable || !includeRedeemed) {
      // build $or clause based on what to include
      const orClauses: any[] = [];
      if (includeAvailable) {
        orClauses.push({ redeemed_by: null });
      }
      if (includeRedeemed) {
        orClauses.push({ redeemed_by: { $ne: null } });
      }
      if (orClauses.length > 0) {
        additionalFilters.$or = orClauses;
      }
    } 
    
    

    // Get paginated game keys
    const results = await client.get((page - 1) * pageSize, pageSize, search, additionalFilters);

    const offers = await client.getOffers();

    res.locals.includeAvailable = includeAvailable;
    res.locals.includeRedeemed = includeRedeemed;

    res.render('gamekeys/list', {
      ...res.locals,
      title: 'Game Keys',
      items: results.items,
      offers: offers,
      pager: results.getPager(),
    });
  };
};
import { Request, Response, NextFunction } from 'express';
import LogsMongoClient from '../libs/mongo/Logs';
import FreeGameKeysMongoClient from '../libs/mongo/FreeGameKeys';
import moment from 'moment';


export default class FreeGameKeysController {
  private logger = new LogsMongoClient();
  private MODULE = this.constructor.name;

  public list = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const page = Math.max(1, parseInt(req.query.page as string) || 1);
    const pageSize = Math.max(1, parseInt(req.query.pageSize as string) || 10);
    const search: string | undefined = (req.query.search as string) || undefined;
    const client = new FreeGameKeysMongoClient();
    const additionalFilters: any = {};

    const qIncludeExpired = req.query.includeExpired === undefined ? undefined : req.query.includeExpired === 'true';
    const includeExpired: boolean = qIncludeExpired === undefined ? true : qIncludeExpired;
    if (!includeExpired) {
      // this should either be an end_date greater than UTC now OR null (no end date)
      // the value should be in unix timestamp (seconds) as stored in DB
      const now = moment.utc().unix();
      // use $or so that entries with no end_date (or explicit null) are INCLUDED (not treated as expired)
      additionalFilters.$or = [{ end_date: { $gt: now } }, { end_date: null }];
    }

    // Get paginated game keys
    const results = await client.get((page - 1) * pageSize, pageSize, search, additionalFilters);

    res.locals.includeExpired = includeExpired;
    res.render('freegamekeys/list', {
      ...res.locals,
      title: 'Free Games',
      items: results.items,
      pager: results.getPager(),
    });
  };
};
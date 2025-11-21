import configs from '../config';
import LogsMongoClient from '../libs/mongo/Logs';
import PullTabsMongoClient from '../libs/mongo/PullTabs';
import Reflection from '../libs/Reflection';
import ProcessedPullTabTicket from '../models/ProcessedPullTabTicket';
import { Request, Response, NextFunction } from 'express';

export default class PullTabsController {
  private logger = new LogsMongoClient();
  private MODULE = this.constructor.name;

  async list(req: Request, res: Response, next: NextFunction): Promise<void> {
    const METHOD = Reflection.getCallingMethodName();
    try {
      const page = Math.max(1, parseInt(req.query.page as string) || 1);
      const pageSize = 12; // 12 because its 3 per row.
      const search: string | undefined = (req.query.search as string) || undefined;

      const includeLosingTickets: boolean | undefined = req.query.includeLosingTickets === 'true' ? true : undefined;
      const includeRedeemedTickets: boolean | undefined = req.query.includeRedeemedTickets === 'true' ? true : undefined;
      const includePendingTickets: boolean | undefined = req.query.includePendingTickets === 'true' ? true : undefined;

      const additionalFilters: any = {};
      if (includeLosingTickets !== undefined && includeLosingTickets) {
        additionalFilters.reward = { $gte: 0 };
      }
      if (includeRedeemedTickets !== undefined && includeRedeemedTickets) {
        additionalFilters.redeemed_at = { $ne: null };
        if (includePendingTickets !== undefined && includePendingTickets) {
          additionalFilters.redeemed_at = { $in: [null, { $ne: null }] };
        }
      } else if (includePendingTickets !== undefined && includePendingTickets) {
        additionalFilters.redeemed_at = null;
      }

      const client = new PullTabsMongoClient();
      const pagedResults = await client.get((page - 1) * pageSize, pageSize, search, additionalFilters);

      // convert items to processed tickets
      const processedItems = [];
      for (const item of pagedResults.items) {
        const processedTicket = new ProcessedPullTabTicket(item);
        await processedTicket.processLineResults();
        processedItems.push(processedTicket);
      }

      res.render('pulltabs/list', {
        ...res.locals,
        title: 'Pull Tab Tickets',
        items: processedItems,
        pager: pagedResults.getPager(),
      });
    } catch (error: any) {
      // this.logger.error(METHOD, error);
      console.error(error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  }
}
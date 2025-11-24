import configs from '../config';
import TacoBotApiClient from '../libs/tacobot/ApiClient';
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

      // Coerce values; if query param appears multiple times (hidden + checkbox), prefer the last value
      const coerceBoolQuery = (val: any): string | undefined => {
        if (val === undefined) return undefined;
        if (Array.isArray(val)) return String(val[val.length - 1]);
        return String(val);
      };

      const qIncludeLosingTicketsRaw = coerceBoolQuery(req.query.includeLosingTickets);
      const qIncludeRedeemedTicketsRaw = coerceBoolQuery(req.query.includeRedeemedTickets);
      const qIncludePendingTicketsRaw = coerceBoolQuery(req.query.includePendingTickets);

      const qIncludeLosingTickets: boolean | undefined = qIncludeLosingTicketsRaw === 'true' ? true : undefined;
      const qIncludeRedeemedTickets: boolean | undefined = qIncludeRedeemedTicketsRaw === 'false' ? false : qIncludeRedeemedTicketsRaw === 'true' ? true : undefined;
      const qIncludePendingTickets: boolean | undefined = qIncludePendingTicketsRaw === 'true' ? true : undefined;

      // defaults:
      // When checkbox is unchecked it won't be present in query params.
      // Default behavior: redeemed tickets are included unless the user explicitly unchecks the box.
      const includeRedeemedTickets: boolean = qIncludeRedeemedTickets === undefined ? true : qIncludeRedeemedTickets;
      const includeLosingTickets: boolean = qIncludeLosingTickets === undefined ? false : qIncludeLosingTickets;
      const includePendingTickets: boolean = qIncludePendingTickets === undefined ? false : qIncludePendingTickets;

      const additionalFilters: any = {};
      if (includeLosingTickets) {
        additionalFilters.reward = { $gte: 0 };
      } else {
        additionalFilters.reward = { $gt: 0 };
      }
      
      // Decide redeemed_at filter based on the two flags
      if (includeRedeemedTickets && includePendingTickets) {
        // include everything (no redeemed_at filter)
      } else if (includeRedeemedTickets && !includePendingTickets) {
        // Only redeemed tickets
        additionalFilters.redeemed_at = { $ne: null };
      } else if (!includeRedeemedTickets && includePendingTickets) {
        // Only pending tickets (null or not exists)
        additionalFilters.redeemed_at = null;
      } else {
        // Neither selected - default to only redeemed tickets
        additionalFilters.redeemed_at = { $ne: null };
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

      // pass in includeLosingTickets, includeRedeemedTickets, includePendingTickets to the view
      res.locals.includeLosingTickets = includeLosingTickets;
      res.locals.includeRedeemedTickets = includeRedeemedTickets;
      res.locals.includePendingTickets = includePendingTickets;

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

  async redeem(req: Request, res: Response, next: NextFunction): Promise<void> {
    const METHOD = Reflection.getCallingMethodName();
    try {
      const { guildId, username, ticketCode } = req.body;
      const client = new TacoBotApiClient({
        baseUrl: configs.tacobot.api.url,
        token: configs.tacobot.api.token,
      });
      const response = await client.redeemPullTabTicket(guildId, username, ticketCode);
      res.json(response.data);
    } catch (error: any) {
      console.error(error);
      res.status(500).json({ error: error.message || 'Internal Server Error' });
    }
  }
}
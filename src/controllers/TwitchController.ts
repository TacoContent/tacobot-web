import configs from '../config';
import LogsMongoClient from '../libs/mongo/Logs';
import TwitchChannelsMongoClient from '../libs/mongo/TwitchChannels';
import TwitchUsersMongoClient from '../libs/mongo/TwitchUsers';
import Reflection from '../libs/Reflection';
import { Request, Response, NextFunction } from 'express';

export default class TwitchController {
  private logger = new LogsMongoClient();
  private MODULE = this.constructor.name;

  async listChannels(req: Request, res: Response, next: NextFunction): Promise<void> {
    const METHOD = Reflection.getCallingMethodName();
    try {
      const page = Math.max(1, parseInt(req.query.page as string) || 1);
      const pageSize = 10;
      const search: string | undefined = (req.query.search as string) || undefined;
      const client = new TwitchChannelsMongoClient();
      const pagedResults = await client.get((page - 1) * pageSize, pageSize, search);

      res.render('twitch/channels/list', {
        ...res.locals,
        title: 'TacoBot Active Twitch Channels',
        items: pagedResults.items,
        pager: pagedResults.getPager(),
      });
    } catch (error: any) {
      // this.logger.error(METHOD, error);
      console.error(error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  }

  async listLinkedUsers(req: Request, res: Response, next: NextFunction): Promise<void> {
    const METHOD = Reflection.getCallingMethodName();
    try {
      const page = Math.max(1, parseInt(req.query.page as string) || 1);
      const pageSize = 10;
      const search: string | undefined = (req.query.search as string) || undefined;
      const client = new TwitchUsersMongoClient();
      const pagedResults = await client.get((page - 1) * pageSize, pageSize, search);

      res.render('twitch/linked/list', {
        ...res.locals,
        title: 'TACO Linked Twitch Users',
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
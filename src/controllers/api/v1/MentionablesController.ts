import LogsMongoClient from '../../../libs/mongo/Logs';
import { Request, Response, NextFunction } from 'express';
import Reflection from '../../../libs/Reflection';
import { tacoBotApiClient, isApiError, handleApiError } from '../../../libs/tacobot';
import config from '../../../config';
import { DiscordMentionable } from '../../../libs/tacobot/types';

export default class MentionablesController {
  private logger = new LogsMongoClient();
  private MODULE = this.constructor.name;

  async getBatchByIds(req: Request, res: Response, next: NextFunction): Promise<void> {
    const METHOD = Reflection.getCallingMethodName();
    try {
  const guild: string = (req.params.guild as string) || (config.tacobot.primaryGuildId as string);
      let ids: string[] = [];

      // Support ids in query (?ids=1,2,3), body array, or body { ids: [] }
      if (req.query.ids) {
        ids = String(req.query.ids).split(',').map((id) => id.trim());
      } else if (Array.isArray(req.body)) {
        ids = req.body.map((id: any) => String(id).trim());
      } else if (req.body && Array.isArray(req.body.ids)) {
        ids = req.body.ids.map((id: any) => String(id).trim());
      }

      ids = Array.from(new Set(ids.filter((id) => id && id.length > 0)));
      if (ids.length === 0) {
        res.status(400).send({ error: 'No ids provided' }).end();
        return;
      }

      const response = await tacoBotApiClient.getGuildMentionablesByIds(guild, ids);
      const data: DiscordMentionable[] = response.data;

      res.status(200).send(data).end();
    } catch (err: any) {
      if (isApiError(err)) {
        await this.logger.error(this.MODULE, `${METHOD} - API Error: ${handleApiError(err, 'Get Mentionables by IDs')}`);
        res.status(err.status || 500).json({ error: err.message });
        return;
      }
      await this.logger.error(`${this.MODULE}.${METHOD}`, err?.message || String(err), {
        stack: err.stack,
        headers: req.headers,
        body: req.body,
        query: req.query,
        params: req.params,
      });
      next(err);
    }
  }
}

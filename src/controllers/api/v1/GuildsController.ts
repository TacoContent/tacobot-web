import configs from '../../../config';
import * as fs from 'fs';
import LogsMongoClient from '../../../libs/mongo/Logs';
import { Request, Response, NextFunction } from 'express';
import path from 'path';
import Reflection from '../../../libs/Reflection';
import DiscordGuildEntry from '../../../models/DiscordGuildEntry';
import DiscordGuildsMongoClient from '../../../libs/mongo/Guilds';

export default class GuildsController {

  private logger = new LogsMongoClient();
  private MODULE = this.constructor.name;

  async batchGet(req: Request, res: Response, next: NextFunction): Promise<void> {
    const METHOD = Reflection.getCallingMethodName();
    try {
      let guildIds: string[] = [];

      if (req.query.guildIds) {
        // comma separated list in query param
        guildIds = (req.query.guildIds as string).split(',').map(id => id.trim());
      } else if (req.body.guildIds) {
        // array in body
        if (Array.isArray(req.body.guildIds)) {
          guildIds = req.body.guildIds.map((id: any) => String(id).trim());
        }
      } else if (req.body && Array.isArray(req.body)) {
        // array in body without key
        guildIds = req.body.map((id: any) => String(id).trim());
      }

      // remove empty ids and duplicates
      guildIds = Array.from(new Set(guildIds.filter(id => id.length > 0)));

      if (guildIds.length === 0) {
        res.status(400).send('No guild IDs provided').end();
        return;
      }

      const client = new DiscordGuildsMongoClient();

      const guilds: DiscordGuildEntry[] = await client.findByIds(guildIds);

      res.status(200).send(guilds).end();
    } catch (err: any) {
      await this.logger.error(`${this.MODULE}.${METHOD}`, err.message, {
        stack: err.stack,
        headers: req.headers,
        body: req.body,
        query: req.query,
        params: req.params,
      });
      next(err);
    }
  }

  async get(req: Request, res: Response, next: NextFunction): Promise<void> {
    const METHOD = Reflection.getCallingMethodName();
    try {
      const guildId: string = req.params.guildId as string ||
        req.query.guildId as string ||
        configs.tacobot.primaryGuildId as string;

      const client = new DiscordGuildsMongoClient();

      const guild: DiscordGuildEntry | null = await client.findById(guildId);
      if (!guild) {
        res.status(404).send('Guild not found').end();
        return;
      }

      res.status(200).send(guild).end();
    } catch (err: any) {
      await this.logger.error(`${this.MODULE}.${METHOD}`, err.message, {
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
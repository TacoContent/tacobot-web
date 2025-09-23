import configs from '../../../config';
import * as fs from 'fs';
import LogsMongoClient from '../../../libs/mongo/Logs';
import { Request, Response, NextFunction } from 'express';
import path from 'path';
import Reflection from '../../../libs/Reflection';
import DiscordUserEntry from '../../../models/DiscordUserEntry';

export default class UsersController {

  private logger = new LogsMongoClient();
  private MODULE = this.constructor.name;

  async batchGet(req: Request, res: Response, next: NextFunction): Promise<void> {
    const METHOD = Reflection.getCallingMethodName();
    try {
      const guildId: string = req.query.guildId as string || configs.tacobot.primaryGuildId as string;
      let userIds: string[] = [];
      
      if (req.query.userIds) {
        // comma separated list in query param
        userIds = (req.query.userIds as string).split(',').map(id => id.trim());
      } else if (req.body.userIds) {
        // array in body
        if (Array.isArray(req.body.userIds)) {
          userIds = req.body.userIds.map((id: any) => String(id).trim());
        }
      } else if (req.body && Array.isArray(req.body)) {
        // array in body without key
        userIds = req.body.map((id: any) => String(id).trim());
      }

      // remove empty ids and duplicates
      userIds = Array.from(new Set(userIds.filter(id => id.length > 0)));

      if (userIds.length === 0) {
        res.status(400).send('No user IDs provided').end();
        return;
      }

      const DiscordUsersMongoClient = (await import('../../../libs/mongo/Users')).default;
      const client = new DiscordUsersMongoClient();

      const users: DiscordUserEntry[] = await client.findByIds(guildId, userIds);

      res.status(200).send(users).end();
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
      const userId: string = req.params.id as string;
      const guildId: string = req.query.guildId as string || configs.tacobot.primaryGuildId as string;

      const DiscordUsersMongoClient = (await import('../../../libs/mongo/Users')).default;
      const client = new DiscordUsersMongoClient();

      const user: DiscordUserEntry | null = await client.findById(guildId, userId);
      if (!user) {
        res.status(404).send('User not found').end();
        return;
      }

      res.status(200).send(user).end();
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
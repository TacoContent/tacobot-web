import LogsMongoClient from "../../../libs/mongo/Logs";
import { Request, Response, NextFunction } from 'express';
import path from 'path';
import Reflection from '../../../libs/Reflection';
import DiscordEmojiEntry from '../../../models/DiscordEmojiEntry';

export default class EmojisController {
    private logger = new LogsMongoClient();
    private MODULE = this.constructor.name;
  
  async getEmojis(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      res.json([]);
    } catch (error) {
      next(error);
    }
  }

  async getEmojiById(req: Request, res: Response, next: NextFunction): Promise<void> {
    const METHOD = Reflection.getCallingMethodName();
    res.json(new DiscordEmojiEntry());
  }

  async getEmojiByName(req: Request, res: Response, next: NextFunction): Promise<void> {
    const METHOD = Reflection.getCallingMethodName();
    res.json(new DiscordEmojiEntry());
  }
}
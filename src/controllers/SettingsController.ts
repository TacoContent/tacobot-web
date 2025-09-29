import configs from '../config';
import LogsMongoClient from '../libs/mongo/Logs';
import SettingsMongoClient from '../libs/mongo/Settings';
import Reflection from '../libs/Reflection';
import { Request, Response, NextFunction } from 'express';

export default class SettingsController {
  private logger = new LogsMongoClient();
  private MODULE = this.constructor.name;

  async edit(req: Request, res: Response, next: NextFunction): Promise<void> {
    const METHOD = Reflection.getCallingMethodName();
    try {
      const client = new SettingsMongoClient();
      const settingId = req.params.name;
      const guildId = req.params.guildId;

      const item = await client.getByName(guildId, settingId);
      if (!item) {
        res.status(404).json({ error: 'Setting not found' });
        return;
      }

      res.render('settings/edit', {
        ...res.locals,
        title: `TACO Settings ${item.name.toUpperCase()}`,
        item: item,
      });
    } catch (error: any) {
      // this.logger.error(METHOD, error);
      console.error(error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  }
}
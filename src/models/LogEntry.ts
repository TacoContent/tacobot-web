import { Document } from 'mongodb';
import { LogLevels } from '../libs/consts/LogLevels';

export default class LogEntry implements Document {
  _id?: string = undefined;
  guild_id: string = '';
  timestamp: number = 0;
  level: LogLevels = LogLevels.INFO;
  method: string = '';
  message: string = '';
  stack?: string = undefined;
  meta?: any = undefined;
  channel?: string = undefined; // used for logging from twitch bot

  constructor(data: Partial<LogEntry> = {}) {
    Object.assign(this, data);
  }
}
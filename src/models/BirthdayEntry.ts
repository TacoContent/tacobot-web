import { Document } from 'mongodb';

export default class BirthdayEntry implements Document {
  _id?: string = undefined;
  guild_id: string = '';
  user_id: string = '';
  timestamp: number = 0;
  day: number = 0;
  month: number = 0;

  constructor(data: Partial<BirthdayEntry> = {}) {
    Object.assign(this, data);
  }
}
import { Document } from 'mongodb';


export default class SettingEntry implements Document {
  _id?: string = undefined;
  name: string = '';
  guild_id: string = '';
  timestamp: number = 0;
  settings: any = {};
  metadata: any = {};

  constructor(data: Partial<SettingEntry> = {}) {
    Object.assign(this, data);
  }
}

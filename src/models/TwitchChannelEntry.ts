import { Document } from 'mongodb';



export default class TwitchChannelEntry implements Document {
  _id?: string | undefined = undefined;
  guild_id: string = '';
  channel: string = '';
  timestamp: number = 0;

  constructor(data: Partial<TwitchChannelEntry> = {}) {
    Object.assign(this, data);
  }
}
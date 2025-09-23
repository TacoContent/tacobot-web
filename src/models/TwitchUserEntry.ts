import { Document } from 'mongodb';



export default class TwitchUserEntry implements Document {
  _id?: string | undefined = undefined;
  user_id: string = '';
  twitch_id?: string | undefined = undefined;
  twitch_name: string = '';

  constructor(data: Partial<TwitchUserEntry> = {}) {
    Object.assign(this, data);
  }
}
import { Document } from 'mongodb';


export default class GameKeyEntry implements Document {
  _id?: string = undefined;
  title: string = '';
  key: string = '';
  cost: number = 0;
  type: string = '';
  help_link?: string | undefined | null;
  download_link?: string | undefined | null;
  info_link: string = '';
  user_owner: string = '';
  redeemed_by?: string | undefined | null;
  redeemed_timestamp?: number | undefined | null;
  guild_id: string = '';
  source: string = '';

  constructor(data: Partial<GameKeyEntry> = {}) {
    Object.assign(this, data);
  }
}
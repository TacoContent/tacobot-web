import { Document } from 'mongodb';

export default class GameKeyOfferEntry implements Document {
  _id?: string = undefined;
  guild_id: string = '';
  channel_id: string = '';
  message_id: string = '';
  game_key_id: string = '';
  timestamp: number = 0;
  expires: number = 0;

  constructor(data: Partial<GameKeyOfferEntry> = {}) {
    Object.assign(this, data);
  }
}
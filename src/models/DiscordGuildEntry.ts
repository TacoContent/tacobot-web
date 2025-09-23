import { Document } from 'mongodb';

export default class DiscordGuildEntry implements Document {
  _id?: string = undefined;
  guild_id: string = '';
  created_at: number = 0;
  icon?: string | undefined | null;
  name: string = '';
  owner_id: string = '';
  timestamp: number = 0;
  vanity_url?: string | undefined | null;
  vanity_url_code?: string | undefined | null;

  constructor(data: Partial<DiscordGuildEntry> = {}) {
    Object.assign(this, data);
  }
}
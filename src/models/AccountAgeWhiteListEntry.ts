import { Document } from 'mongodb';

export default class AccountAgeWhiteListEntry implements Document {
  _id?: string = undefined;
  guild_id: string = '';
  user_id: string = '';
  added_by?: string | null = null;
  timestamp?: number | null = null;

  constructor(data: Partial<AccountAgeWhiteListEntry> = {}) {
    Object.assign(this, data);
  }
}
import { Document } from 'mongodb';



export default class UserTacoEntry implements Document {
  _id?: string | undefined = undefined;
  guild_id: string = '';
  user_id: string = '';
  count: number = 0;

  constructor(data: Partial<UserTacoEntry> = {}) {
    Object.assign(this, data);
  }
}
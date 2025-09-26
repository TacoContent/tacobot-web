import { Document } from 'mongodb';



export default class UserPermissionEntry implements Document {
  _id?: string | undefined = undefined;
  guild_id: string = '';
  user_id: string = '';
  permissions: string[] | undefined | null = undefined;

  constructor(data: Partial<UserPermissionEntry> = {}) {
    Object.assign(this, data);
  }
}
import { Document } from 'mongodb';


export interface MinecraftUserOpEntry {
  enabled: boolean;
  level: number;
  bypassesPlayerLimit: boolean;
}

export default class MinecraftUserEntry implements Document {
  _id?: string = undefined;
  user_id: string = '';
  guild_id: string = '';
  username: string = '';
  uuid: string = '';
  whitelisted: boolean = false;
  op: MinecraftUserOpEntry | undefined | null = undefined

  constructor(data: Partial<MinecraftUserEntry> = {}) {
    Object.assign(this, data);
  }
}
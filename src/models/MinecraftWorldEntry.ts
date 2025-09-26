import { Document } from 'mongodb';



export default class MinecraftWorldEntry implements Document {
  _id?: string | undefined = undefined;
  guild_id: string = '';
  name: string = '';
  world: string = '';
  active: boolean = false;

  constructor(data: Partial<MinecraftWorldEntry> = {}) {
    Object.assign(this, data);
  }
}
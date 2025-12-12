import { Document } from 'mongodb';
import MinecraftShopItem from './MinecraftShopItem';

export default class MinecraftShopEntry implements Document {
  _id?: string = undefined;
  user_id: string = '';
  guild_id: string = '';
  role_ids: string[] = [];
  enabled: boolean = true;
  shop_id: string = '';
  shop: Record<string, MinecraftShopItem> | undefined = undefined;

  constructor(data: Partial<MinecraftShopEntry> = {}) {
    Object.assign(this, data);
  }
}
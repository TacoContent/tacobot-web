import { Document } from 'mongodb';
import MinecraftShopItem from './MinecraftShopItem';

export default class MinecraftShopEntry implements Document {
  _id?: string = undefined;
  // unique identifier for the shop
  shop_id: string = '';
  // name of the shop
  name: string = '';
  // discord guild id that the shop is associated with (0 for global)
  guild_id: string = '';
  // discord user id of the user that the shop is for
  user_id: string = '';
  // array of discord role ids
  role_ids: string[] = [];
  enabled: boolean = true;
  // unix timestamp in milliseconds
  created_at: number | null = null;
  // discord user id of creator
  created_by: string = '';
  // unix timestamp in milliseconds
  updated_at: number | null = null;
  // discord user id of last updater
  updated_by: string = '';
  // unix timestamp in milliseconds when the shop expires
  expires_at: number | null = null;
  // a map of shop items, key is the variant id which is calculated by hashing the item id and nbt data
  shop: Record<string, MinecraftShopItem> | undefined = undefined;

  constructor(data: Partial<MinecraftShopEntry> = {}) {
    Object.assign(this, data);
  }
}
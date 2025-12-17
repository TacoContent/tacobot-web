import { Document } from 'mongodb';

export interface MinecraftUserStorageItem {
  item_id: string;
  variant_id: string;
  quantity: number;
  metadata: Record<string, any>;
}

export interface MinecraftUserStorageMetadata {
  name: string;
  damage: number;
  isDamaged: boolean;
  maxStackSize: number;
  maxDamage: number;
  rarity: string;
  lore: string[];
  nbt: string;
  tags: string[];
  enchantments: MinecraftUserStorageMetadataEnchantment[];
  // any additional fields
  [key: string]: any;
}

export interface MinecraftUserStorageMetadataEnchantment {
  id: string;
  level: number;
}

export default class MinecraftUserStorageEntry implements Document {
  _id?: string = undefined;
  guild_id: string = '';
  user_id: string = '';
  uuid: string = '';
  slots: number = 0;
  storage: Record<string, MinecraftUserStorageItem> = {};
}
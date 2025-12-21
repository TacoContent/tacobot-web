import { Document } from 'mongodb';

export interface MinecraftModIcon {
  data?: string; // base64 encoded image data
  content_type: string; // e.g., 'image/png'
  url?: string;
}

export interface MinecraftMod {
  id: string;
  version: string;
  name: string;
  icon?: MinecraftModIcon;
}

export default class MinecraftItemEntry implements Document {
  _id?: string = undefined;
  id: string = '';
  asset: string = '';
  name: string = '';
  source: string = '';
  asset_b64: string = '';
  mod?: MinecraftMod | null = null;
  model: any = null;
  mcmeta: any = null;
  content_type: string = 'image/png';
  block_type: string | null = null;
  rendered_3d: boolean = false
  width: number = 0;
  height: number = 0
  parent: string | null = null;
}
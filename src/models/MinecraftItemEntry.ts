import { Document } from 'mongodb';

export default class MinecraftItemEntry implements Document {
  _id?: string = undefined;
  id: string = '';
  asset: string = '';
  name: string = '';
  source: string = '';
  asset_b64: string = '';
  mod: any = null;
  model: any = null;
  mcmeta: any = null;
  content_type: string = 'image/png';
  block_type: string | null = null;
  rendered_3d: boolean = false
  width: number = 0;
  height: number = 0
  parent: string | null = null;
}
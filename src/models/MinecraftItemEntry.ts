import { Document } from 'mongodb';

export default class MinecraftItemEntry implements Document {
  _id?: string = undefined;
  id: string = '';
  asset: string = '';
  name: string = '';
  source: string = '';
  asset_b64: string = '';
}
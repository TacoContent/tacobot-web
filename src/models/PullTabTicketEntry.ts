import { Document } from 'mongodb';

export default class PullTabTicketEntry implements Document {
  _id?: string | undefined = undefined;
  guild_id: string = ''
  user_id: string = '';
  code: string = '';
  cost: number = 0;
  created_at: number = 0;
  effective_multiplier: number = 1;
  purchase_multiplier: number = 1;
  reward: number = 0;
  ticket: string[] = [];
  redeemed_at: number | null = null;

  constructor(data: Partial<PullTabTicketEntry> = {}) {
    Object.assign(this, data);
  }
}
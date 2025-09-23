export default class FreeGameKeyEntry {
  _id?: string = undefined;
  game_id: number = 0;
  title: string = '';
  worth: string = '';
  thumbnail?: string | undefined | null;
  image?: string | undefined | null;
  description: string = '';
  instructions: string = '';
  open_giveaway_url: string = '';
  published_date: number = 0;
  end_date?: number | undefined | null = null;
  type: string = '';
  platforms: string[] = [];
  constructor(data: Partial<FreeGameKeyEntry> = {}) {
    Object.assign(this, data);
  }
};
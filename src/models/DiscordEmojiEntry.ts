export default class DiscordEmojiEntry {
  id: string | null = null;
  name: string | null = null;
  animated: boolean = false;
  require_colons: boolean = false;
  url: string | null = null;
  managed: boolean = false;

  constructor(data: Partial<DiscordEmojiEntry> = {}) {
    Object.assign(this, data);
  }

}

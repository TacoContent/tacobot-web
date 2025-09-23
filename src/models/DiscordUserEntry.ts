export default class DiscordUserEntry {
  _id?: string = undefined;
  user_id: string = '';
  guild_id: string = ''
  avatar: string = '';
  bot: boolean = false;
  system: boolean = false;
  created: number = 0;
  timestamp: number = 0;
  status?: string | undefined | null;
  displayname: string = '';
  username: string = '';
  discriminator: string = '';

  link(): string {
    return `https://discord.com/users/${this.user_id}`;
  }

  constructor(data: Partial<DiscordUserEntry> = {}) {
    Object.assign(this, data);
  }
}
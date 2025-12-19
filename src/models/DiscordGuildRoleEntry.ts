

export default class DiscordRoleEntry {
  type?: 'role';
  role_id: string = '';
  guild_id: string = '';
  name: string = '';
  color?: number | null;
  deleted: boolean = false;
  created_at?: number | null;
  display_icon?: string | null;
  flags?: Record<string, any>;
  position?: number | null;
  permissions?: number | null;
  managed?: boolean | null;
  mentionable?: boolean | null;
  members?: string[]; // Array of user IDs
  hoist?: boolean | null;
  icon?: string | null;
  unicode_emoji?: string | null;
  mention?: string;
  secondary_color?: number | null;
  tertiary_color?: number | null;
  timestamp?: number | null;

  constructor(data: Partial<DiscordRoleEntry>) {
    Object.assign(this, data);
  }
}
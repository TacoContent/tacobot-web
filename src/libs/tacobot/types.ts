// TacoBot API Type definitions based on Swagger spec

export interface ErrorStatusCodePayload {
  error: number;
}

export interface ShiftCodeGame {
  id: string;
  name: string;
}

export interface ShiftCodePayload {
  code: string;
  games: ShiftCodeGame[];
  platforms: string[];
  expiry: number;
  reward: string;
  notes: string;
  source: string;
  created_at: number;
}

export interface TacoWebhookMinecraftTacosPayload {
  guild_id: string;
  from_user: string;
  to_user_id: string;
  amount: number;
  reason: string;
  type: string;
}

export interface TacoWebhookMinecraftTacosResponsePayload {
  success: boolean;
  payload: TacoWebhookMinecraftTacosPayload;
  total_tacos: number;
}

export interface TacoWebhookGamePayload {
  game_id: number;
  end_date: number;
  worth: string;
  open_giveaway_url: string;
  title: string;
  thumbnail: string;
  image: string;
  description: string;
  instructions: string;
  published_date: number;
  type: string;
  platforms: string[];
  formatted_published_date: string;
  formatted_end_date: string;
}

export enum TacoMinecraftWorlds {
  TACO_ATM8 = 'taco_atm8',
  TACO_ATM9 = 'taco_atm9',
  TACO_ATM10 = 'taco_atm10'
}

export interface TacoMinecraftWorldInfo {
  world: TacoMinecraftWorlds;
  name: string;
  active: boolean;
  guild_id: string;
}

export interface MinecraftUserStats {
  'minecraft:crafted': Record<string, number>;
  'minecraft:broken': Record<string, number>;
  [key: string]: Record<string, number>;
}

export interface MinecraftUserStatsPayload {
  stats: MinecraftUserStats;
  world_name: TacoMinecraftWorlds;
}

export interface MinecraftPlayerEvent {
  event: string;
}

export interface MinecraftPlayerEventPayload {
  event: string;
  guild_id: string;
  payload: Record<string, any>;
}

export interface MinecraftDiscordUserStatsInfo {
  world: TacoMinecraftWorlds;
  uuid: string;
  username: string;
  user_id: string;
  modified: number;
  stats: MinecraftUserStats;
}

export interface TacoMinecraftServerSettingsMod {
  name: string;
  version: string;
}

export interface MinecraftServerSettings {
  enabled: boolean;
  output_channel: string;
  server: string;
  forge_version: string;
  version: string;
  help: string;
  mods: TacoMinecraftServerSettingsMod[];
}

export interface TacoMinecraftServerSettings {
  guild_id: string;
  name: string;
  settings: MinecraftServerSettings;
  timestamp: number;
}

export enum MinecraftServerStatusEnum {
  ONLINE = 'online',
  OFFLINE = 'offline',
  UNKNOWN = 'unknown'
}

export interface MinecraftServerStatus {
  success: boolean;
  host: string;
  status: MinecraftServerStatusEnum;
  description: string;
  motd: Record<string, any>;
  online: boolean;
  latency: number;
  enforces_secure_chat: boolean;
  icon: string;
  players: Record<string, any>;
  version: Record<string, any>;
}

export interface MinecraftUser {
  uuid: string;
  name: string;
}

export interface MinecraftOpUser {
  uuid: string;
  username: string;
  level: number;
  bypassPlayerLimit: boolean;
}

export interface MinecraftWhiteListUser {
  uuid: string;
  username: string;
}

export interface DiscordGuild {
  id: string;
  name: string;
  icon?: string;
  banner?: string;
  description?: string;
  member_count?: number;
  features?: string[];
  owner_id?: string;
  vanity_url_code?: string;
  vanity_url?: string;
  preferred_locale?: string;
  verification_level?: string;
  boost_level?: number;
  boost_count?: number;
}

export interface DiscordChannel {
  id: string;
  guild_id: string;
  name: string;
  type: string;
  position?: number;
  topic?: string;
  nsfw?: boolean;
  bitrate?: number;
  user_limit?: number;
  category_id?: string;
}

export interface DiscordCategory {
  id: string;
  guild_id: string;
  name: string;
  position?: number;
  type?: string;
  category_id?: string;
  channels?: DiscordChannel[];
}

export interface DiscordGuildChannels {
  id: string;
  guild_id: string;
  name: string;
  channels: DiscordChannel[];
  categories: DiscordCategory[];
}

export interface DiscordEmoji {
  type?: 'emoji';
  id: string;
  guild_id: string;
  name: string;
  animated?: boolean;
  available?: boolean;
  managed?: boolean;
  require_colons?: boolean;
  created_at?: string; // ISO date-time
  url?: string;
}

export interface DiscordMessage {
  type?: 'message';
  id: string;
  channel_id: string;
  guild_id: string;
  author_id: string;
  content: string;
  created_at: number;
  jump_url?: string | null;
  edited_at?: number;
  mention_everyone?: boolean;
  mentions?: { id: string; username: string }[];
  attachments?: { id: string; url: string }[];
  embeds?: any[];
  reactions?: DiscordMessageReaction[];
  nonce?: string | null;
  pinned?: boolean;
  message_type?: number;
}

// Reusable reaction payload returned either embedded in a DiscordMessage or
// aggregated by the batch reactions endpoint.
export interface DiscordMessageReaction {
  emoji: string;
  count: number;
}

// Mapping of message_id -> reactions[] returned by the batch reactions endpoint
export type DiscordChannelMessageReactions = Record<string, DiscordMessageReaction[]>;

export interface IPagedResults<T> {
  total: number;
  skip: number;
  take: number;
  items: T[];
}

// Join Whitelist
export interface JoinWhitelistUser {
  guild_id: string;
  user_id: string;
  added_by?: string | null;
  timestamp?: number | null;
}


export interface DiscordRole {
  type?: 'role';
  id: string;
  guild_id: string;
  name: string;
  color?: number | null;
  created_at?: string | null; // ISO date-time
  display_icon?: string | null;
  flags?: Record<string, any>;
  position?: number | null;
  permissions?: number | null;
  managed?: boolean | null;
  mentionable?: boolean | null;
  hoist?: boolean | null;
  icon?: string | null;
  unicode_emoji?: string | null;
  mention?: string;
  secondary_color?: number | null;
  tertiary_color?: number | null;
}

export interface DiscordUser {
  type: 'user';
  id: string;
  guild_id: string;
  accent_color?: number | null;
  color?: number | null;
  created_at?: string | null; // ISO date-time
  banner?: string | null;
  name?: string | null;
  username?: string | null;
  display_name?: string | null;
  global_name?: string | null;
  discriminator?: string | null;
  avatar?: string | null;
  default_avatar?: string | null;
  bot?: boolean | null;
  system?: boolean | null;
  mention: string;
  display_avatar?: string | null;
}

export type DiscordMentionable = DiscordRole | DiscordUser;

export interface ApiClientConfig {
  baseUrl: string;
  token?: string;
  tokenHeader?: string;
  timeout?: number;
}

export interface ApiResponse<T> {
  data: T;
  status: number;
  headers: Record<string, string>;
}

export interface ApiError {
  message: string;
  status: number;
  data?: any;
}
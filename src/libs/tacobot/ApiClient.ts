import axios, { AxiosInstance, AxiosResponse, AxiosError } from 'axios';
import {
  ApiClientConfig,
  ApiResponse,
  ApiError,
  DiscordGuild,
  DiscordGuildChannels,
  DiscordChannel,
  DiscordCategory,
  DiscordEmoji,
  MinecraftUser,
  MinecraftOpUser,
  MinecraftWhiteListUser,
  MinecraftServerStatus,
  MinecraftUserStatsPayload,
  MinecraftPlayerEvent,
  MinecraftPlayerEventPayload,
  TacoMinecraftWorlds,
  TacoMinecraftWorldInfo,
  TacoWebhookMinecraftTacosPayload,
  TacoWebhookMinecraftTacosResponsePayload,
  TacoWebhookGamePayload,
  ShiftCodePayload
} from './types';

export class TacoBotApiClient {
  private client: AxiosInstance;
  private config: ApiClientConfig;

  constructor(config: ApiClientConfig) {
    this.config = {
      timeout: 30000,
      tokenHeader: 'X-TACOBOT-TOKEN',
      ...config
    };

    this.client = axios.create({
      baseURL: this.config.baseUrl,
      timeout: this.config.timeout,
      headers: {
        'Content-Type': 'application/json',
        ...(this.config.token && { [this.config.tokenHeader!]: this.config.token })
      }
    });

    // Add response interceptor for error handling
    this.client.interceptors.response.use(
      (response: AxiosResponse) => response,
      (error: AxiosError) => {
        const apiError: ApiError = {
          message: error.message,
          status: error.response?.status || 0,
          data: error.response?.data
        };
        return Promise.reject(apiError);
      }
    );
  }

  // Helper method to make requests
  private async makeRequest<T>(
    method: 'GET' | 'POST' | 'PUT' | 'DELETE',
    url: string,
    data?: any,
    headers?: Record<string, string>
  ): Promise<ApiResponse<T>> {
    const response = await this.client.request<T>({
      method,
      url,
      data,
      headers
    });

    return {
      data: response.data,
      status: response.status,
      headers: response.headers as Record<string, string>
    };
  }

  // Health endpoint
  async getHealth(): Promise<ApiResponse<any>> {
    return this.makeRequest<any>('GET', '/api/v1/health');
  }

  // Swagger endpoints
  async getSwagger(): Promise<ApiResponse<string>> {
    return this.makeRequest<string>('GET', '/api/v1/swagger.yaml');
  }

  // Guild endpoints
  async getGuilds(): Promise<ApiResponse<DiscordGuild[]>> {
    return this.makeRequest<DiscordGuild[]>('GET', '/api/v1/guilds');
  }

  async getGuild(guildId: string): Promise<ApiResponse<DiscordGuild>> {
    return this.makeRequest<DiscordGuild>('GET', `/api/v1/guilds/lookup/${guildId}`);
  }

  async getGuildByQuery(guildId: string): Promise<ApiResponse<DiscordGuild>> {
    return this.makeRequest<DiscordGuild>('GET', `/api/v1/guilds/lookup?guild_id=${guildId}`);
  }

  async getGuildsByIds(guildIds: string[]): Promise<ApiResponse<DiscordGuild[]>> {
    const ids = guildIds.join(',');
    return this.makeRequest<DiscordGuild[]>('GET', `/api/v1/guilds/lookup/batch/${ids}`);
  }

  async getGuildsByIdsQuery(guildIds: string[]): Promise<ApiResponse<DiscordGuild[]>> {
    const params = new URLSearchParams();
    guildIds.forEach(id => params.append('guild_ids', id));
    return this.makeRequest<DiscordGuild[]>('GET', `/api/v1/guilds/lookup/batch?${params.toString()}`);
  }

  async getGuildCategories(guildId: string): Promise<ApiResponse<DiscordGuildChannels>> {
    return this.makeRequest<DiscordGuildChannels>('GET', `/api/v1/guild/${guildId}/categories`);
  }

  async getGuildCategory(guildId: string, categoryId: string): Promise<ApiResponse<DiscordCategory>> {
    return this.makeRequest<DiscordCategory>('GET', `/api/v1/guild/${guildId}/category/${categoryId}`);
  }

  async getGuildChannels(guildId: string): Promise<ApiResponse<DiscordChannel[]>> {
    return this.makeRequest<DiscordChannel[]>('GET', `/api/v1/guild/${guildId}/channels`);
  }

  async getGuildEmojis(guildId: string): Promise<ApiResponse<DiscordEmoji[]>> {
    return this.makeRequest<DiscordEmoji[]>('GET', `/api/v1/guild/${guildId}/emojis`);
  }

  async getGuildEmojiById(guildId: string, emojiId: string): Promise<ApiResponse<DiscordEmoji>> {
    return this.makeRequest<DiscordEmoji>('GET', `/api/v1/guild/${guildId}/emoji/id/${emojiId}`);
  }

  async getGuildEmojiByName(guildId: string, emojiName: string): Promise<ApiResponse<DiscordEmoji>> {
    return this.makeRequest<DiscordEmoji>('GET', `/api/v1/guild/${guildId}/emoji/name/${emojiName}`);
  }

  async getGuildEmojisByIds(guildId: string, emojiIds: string[]): Promise<ApiResponse<DiscordEmoji[]>> {
    return this.makeRequest<DiscordEmoji[]>('POST', `/api/v1/guild/${guildId}/emojis/ids/batch`, emojiIds);
  }

  async getGuildEmojisByNames(guildId: string, emojiNames: string[]): Promise<ApiResponse<DiscordEmoji[]>> {
    return this.makeRequest<DiscordEmoji[]>('POST', `/api/v1/guild/${guildId}/emojis/names/batch`, emojiNames);
  }

  // Minecraft endpoints
  async getMinecraftWhitelist(): Promise<ApiResponse<MinecraftWhiteListUser[]>> {
    return this.makeRequest<MinecraftWhiteListUser[]>('GET', '/api/v1/minecraft/whitelist.json');
  }

  async getMinecraftOps(): Promise<ApiResponse<MinecraftOpUser[]>> {
    return this.makeRequest<MinecraftOpUser[]>('GET', '/api/v1/minecraft/ops.json');
  }

  async getMinecraftUuid(username: string): Promise<ApiResponse<MinecraftUser>> {
    return this.makeRequest<MinecraftUser>('GET', `/api/v1/minecraft/uuid/${username}`);
  }

  async getMinecraftStatus(): Promise<ApiResponse<MinecraftServerStatus>> {
    return this.makeRequest<MinecraftServerStatus>('GET', '/api/v1/minecraft/status');
  }

  async getMinecraftVersion(): Promise<ApiResponse<any>> {
    return this.makeRequest<any>('GET', '/api/v1/minecraft/version');
  }

  async setMinecraftVersion(versionData: any): Promise<ApiResponse<any>> {
    return this.makeRequest<any>('POST', '/api/v1/minecraft/version', versionData);
  }

  async getPlayerStats(username: string): Promise<ApiResponse<MinecraftUserStatsPayload>> {
    return this.makeRequest<MinecraftUserStatsPayload>('GET', `/api/v1/minecraft/player/${username}/stats`);
  }

  async setPlayerStats(username: string, statsData: any): Promise<ApiResponse<any>> {
    return this.makeRequest<any>('POST', `/api/v1/minecraft/player/${username}/stats`, statsData);
  }

  async getPlayerStatsForWorld(username: string, world: TacoMinecraftWorlds): Promise<ApiResponse<MinecraftUserStatsPayload>> {
    return this.makeRequest<MinecraftUserStatsPayload>('GET', `/api/v1/minecraft/player/${username}/stats/${world}`);
  }

  async getMinecraftWorld(): Promise<ApiResponse<TacoMinecraftWorldInfo>> {
    return this.makeRequest<TacoMinecraftWorldInfo>('GET', '/api/v1/minecraft/world');
  }

  async setMinecraftWorld(worldData: any): Promise<ApiResponse<any>> {
    return this.makeRequest<any>('POST', '/api/v1/minecraft/world', worldData);
  }

  async getMinecraftWorlds(): Promise<ApiResponse<TacoMinecraftWorldInfo[]>> {
    return this.makeRequest<TacoMinecraftWorldInfo[]>('GET', '/api/v1/minecraft/worlds');
  }

  async getPlayerEvents(): Promise<ApiResponse<MinecraftPlayerEvent[]>> {
    return this.makeRequest<MinecraftPlayerEvent[]>('GET', '/api/v1/minecraft/player/events');
  }

  async getPlayerEvent(eventId: string): Promise<ApiResponse<MinecraftPlayerEventPayload>> {
    return this.makeRequest<MinecraftPlayerEventPayload>('GET', `/api/v1/minecraft/player/event/${eventId}`);
  }

  // Permission endpoints
  async getUserPermissions(guildId: string, userId: string): Promise<ApiResponse<string[]>> {
    return this.makeRequest<string[]>('GET', `/api/v1/permissions/${guildId}/${userId}`);
  }

  async addUserPermission(guildId: string, userId: string, permission: string): Promise<ApiResponse<any>> {
    return this.makeRequest<any>('POST', `/api/v1/permissions/${guildId}/${userId}/${permission}`);
  }

  async updateUserPermission(guildId: string, userId: string, permission: string): Promise<ApiResponse<any>> {
    return this.makeRequest<any>('PUT', `/api/v1/permissions/${guildId}/${userId}/${permission}`);
  }

  async removeUserPermission(guildId: string, userId: string, permission: string): Promise<ApiResponse<any>> {
    return this.makeRequest<any>('DELETE', `/api/v1/permissions/${guildId}/${userId}/${permission}`);
  }

  // Twitch endpoints
  async inviteBotToTwitchChannel(guildId: string, channel: string): Promise<ApiResponse<any>> {
    return this.makeRequest<any>('POST', `/tacobot/guild/${guildId}/invite/${channel}`);
  }

  // Webhook endpoints
  async sendMinecraftTacosWebhook(action: string, payload: TacoWebhookMinecraftTacosPayload): Promise<ApiResponse<TacoWebhookMinecraftTacosResponsePayload>> {
    return this.makeRequest<TacoWebhookMinecraftTacosResponsePayload>('POST', `/webhook/minecraft/tacos/${action}`, payload);
  }

  async removeMinecraftTacosWebhook(action: string, payload: TacoWebhookMinecraftTacosPayload): Promise<ApiResponse<TacoWebhookMinecraftTacosResponsePayload>> {
    return this.makeRequest<TacoWebhookMinecraftTacosResponsePayload>('DELETE', `/webhook/minecraft/tacos/${action}`, payload);
  }

  async sendPlayerEventWebhook(payload: MinecraftPlayerEventPayload): Promise<ApiResponse<any>> {
    return this.makeRequest<any>('POST', '/webhook/minecraft/player/event', payload);
  }

  async sendGameWebhook(payload: TacoWebhookGamePayload): Promise<ApiResponse<any>> {
    return this.makeRequest<any>('POST', '/webhook/game', payload);
  }

  async sendShiftCodeWebhook(payload: ShiftCodePayload): Promise<ApiResponse<any>> {
    return this.makeRequest<any>('POST', '/webhook/shift', payload);
  }

  // Utility methods
  setToken(token: string): void {
    this.config.token = token;
    this.client.defaults.headers.common[this.config.tokenHeader!] = token;
  }

  removeToken(): void {
    this.config.token = undefined;
    delete this.client.defaults.headers.common[this.config.tokenHeader!];
  }

  setTimeout(timeout: number): void {
    this.config.timeout = timeout;
    this.client.defaults.timeout = timeout;
  }

  getConfig(): ApiClientConfig {
    return { ...this.config };
  }
}

export default TacoBotApiClient;

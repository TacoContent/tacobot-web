/**
 * Example usage of the TacoBot API Client
 * 
 * This file demonstrates how to use the TacoBotApiClient for various operations.
 * You can use this as a reference for implementing the client in your application.
 */

import { tacoBotApiClient, createTacoBotApiClient } from './index';
import { TacoBotApiClient } from './ApiClient';
import { handleApiError, isApiError, retryApiCall, isValidGuildId, isValidUserId } from './utils';
import { TacoMinecraftWorlds } from './types';

/**
 * Example: Basic health check
 */
export async function checkApiHealth(): Promise<boolean> {
  try {
    const response = await tacoBotApiClient.getHealth();
    console.log('API Health:', response.data);
    return true;
  } catch (error) {
    console.error('Health check failed:', handleApiError(error, 'Health Check'));
    return false;
  }
}

/**
 * Example: Get guild information
 */
export async function getGuildInfo(guildId: string): Promise<void> {
  if (!isValidGuildId(guildId)) {
    console.error('Invalid guild ID format');
    return;
  }

  try {
    const response = await tacoBotApiClient.getGuild(guildId);
    console.log('Guild Info:', {
      name: response.data.name,
      id: response.data.id,
      memberCount: response.data.member_count,
      features: response.data.features
    });
  } catch (error) {
    console.error('Failed to get guild info:', handleApiError(error, 'Guild Info'));
  }
}

/**
 * Example: Get guild channels with error handling
 */
export async function getGuildChannelsWithRetry(guildId: string): Promise<void> {
  if (!isValidGuildId(guildId)) {
    console.error('Invalid guild ID format');
    return;
  }

  try {
    const response = await retryApiCall(
      () => tacoBotApiClient.getGuildChannels(guildId),
      3, // max retries
      1000 // delay in ms
    );
    
    console.log(`Found ${response.data.length} channels in guild ${guildId}`);
    response.data.forEach(channel => {
      console.log(`- ${channel.name} (${channel.type})`);
    });
  } catch (error) {
    console.error('Failed to get guild channels:', handleApiError(error, 'Guild Channels'));
  }
}

/**
 * Example: Get multiple emojis by IDs using batch endpoint
 */
export async function getBatchEmojis(guildId: string, emojiIds: string[]): Promise<void> {
  if (!isValidGuildId(guildId)) {
    console.error('Invalid guild ID format');
    return;
  }

  if (emojiIds.length === 0) {
    console.error('No emoji IDs provided');
    return;
  }

  try {
    const response = await tacoBotApiClient.getGuildEmojisByIds(guildId, emojiIds);
    
    console.log(`Retrieved ${response.data.length} emojis from guild ${guildId}:`);
    response.data.forEach(emoji => {
      console.log(`- ${emoji.name} (${emoji.id}) - ${emoji.animated ? 'Animated' : 'Static'}`);
    });
  } catch (error) {
    console.error('Failed to get batch emojis:', handleApiError(error, 'Batch Emojis'));
  }
}

/**
 * Example: Get multiple emojis by names using batch endpoint
 */
export async function getBatchEmojisByNames(guildId: string, emojiNames: string[]): Promise<void> {
  if (!isValidGuildId(guildId)) {
    console.error('Invalid guild ID format');
    return;
  }

  if (emojiNames.length === 0) {
    console.error('No emoji names provided');
    return;
  }

  // Validate emoji names format
  const invalidNames = emojiNames.filter(name => !/^[a-zA-Z0-9_]{2,32}$/.test(name));
  if (invalidNames.length > 0) {
    console.error('Invalid emoji names found:', invalidNames);
    return;
  }

  try {
    const response = await tacoBotApiClient.getGuildEmojisByNames(guildId, emojiNames);
    
    console.log(`Retrieved ${response.data.length} emojis by names from guild ${guildId}:`);
    response.data.forEach(emoji => {
      console.log(`- ${emoji.name} (${emoji.id}) - ${emoji.animated ? 'Animated' : 'Static'}`);
    });
  } catch (error) {
    console.error('Failed to get batch emojis by names:', handleApiError(error, 'Batch Emojis By Names'));
  }
}

/**
 * Example: Get Minecraft server status
 */
export async function getMinecraftServerStatus(): Promise<void> {
  try {
    const response = await tacoBotApiClient.getMinecraftStatus();
    const status = response.data;
    
    console.log('Minecraft Server Status:', {
      online: status.online,
      host: status.host,
      status: status.status,
      playerCount: status.players,
      latency: `${status.latency}ms`,
      version: status.version
    });
  } catch (error) {
    console.error('Failed to get Minecraft status:', handleApiError(error, 'Minecraft Status'));
  }
}

/**
 * Example: Get player statistics for a specific world
 */
export async function getPlayerStats(username: string, world: TacoMinecraftWorlds): Promise<void> {
  try {
    const response = await tacoBotApiClient.getPlayerStatsForWorld(username, world);
    const stats = response.data;
    
    console.log(`Player Stats for ${username} in ${world}:`, {
      world: stats.world_name,
      craftedItems: Object.keys(stats.stats['minecraft:crafted'] || {}).length,
      brokenBlocks: Object.keys(stats.stats['minecraft:broken'] || {}).length
    });
  } catch (error) {
    console.error(`Failed to get player stats for ${username}:`, handleApiError(error, 'Player Stats'));
  }
}

/**
 * Example: Get user permissions
 */
export async function getUserPermissions(guildId: string, userId: string): Promise<string[]> {
  if (!isValidGuildId(guildId) || !isValidUserId(userId)) {
    console.error('Invalid guild ID or user ID format');
    return [];
  }

  try {
    const response = await tacoBotApiClient.getUserPermissions(guildId, userId);
    console.log(`User ${userId} permissions in guild ${guildId}:`, response.data);
    return response.data;
  } catch (error) {
    if (isApiError(error) && error.status === 404) {
      console.log(`User ${userId} has no special permissions in guild ${guildId}`);
      return [];
    }
    console.error('Failed to get user permissions:', handleApiError(error, 'User Permissions'));
    return [];
  }
}

/**
 * Example: Custom client configuration
 */
export function createCustomApiClient(): TacoBotApiClient {
  return createTacoBotApiClient();
}

/**
 * Example: Webhook operations (requires authentication)
 */
export async function sendTacosWebhook(guildId: string, fromUser: string, toUserId: string, amount: number, reason: string): Promise<void> {
  try {
    const payload = {
      guild_id: guildId,
      from_user: fromUser,
      to_user_id: toUserId,
      amount: amount,
      reason: reason,
      type: 'give'
    };

    const response = await tacoBotApiClient.sendMinecraftTacosWebhook('give', payload);
    
    console.log('Tacos webhook sent successfully:', {
      success: response.data.success,
      totalTacos: response.data.total_tacos
    });
  } catch (error) {
    console.error('Failed to send tacos webhook:', handleApiError(error, 'Tacos Webhook'));
  }
}

/**
 * Example: Batch operations
 */
export async function getMultipleGuildsInfo(guildIds: string[]): Promise<void> {
  const validGuildIds = guildIds.filter(isValidGuildId);
  
  if (validGuildIds.length === 0) {
    console.error('No valid guild IDs provided');
    return;
  }

  try {
    const response = await tacoBotApiClient.getGuildsByIds(validGuildIds);
    
    console.log(`Retrieved info for ${response.data.length} guilds:`);
    response.data.forEach(guild => {
      console.log(`- ${guild.name} (${guild.id})`);
    });
  } catch (error) {
    console.error('Failed to get multiple guilds info:', handleApiError(error, 'Batch Guild Info'));
  }
}

/**
 * Example: Error handling patterns
 */
export async function demonstrateErrorHandling(): Promise<void> {
  try {
    // This will likely fail with a 404
    await tacoBotApiClient.getGuild('invalid_guild_id');
  } catch (error) {
    if (isApiError(error)) {
      switch (error.status) {
        case 404:
          console.log('Guild not found - this is expected');
          break;
        case 401:
          console.log('Authentication required');
          break;
        case 403:
          console.log('Access forbidden');
          break;
        default:
          console.log('Other API error:', error.message);
      }
    } else {
      console.log('Non-API error:', error);
    }
  }
}

// Export all example functions for easy testing
export const examples = {
  checkApiHealth,
  getGuildInfo,
  getGuildChannelsWithRetry,
  getBatchEmojis,
  getBatchEmojisByNames,
  getMinecraftServerStatus,
  getPlayerStats,
  getUserPermissions,
  sendTacosWebhook,
  getMultipleGuildsInfo,
  demonstrateErrorHandling
};
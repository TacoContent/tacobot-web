# TacoBot API Client

A comprehensive TypeScript client for the TacoBot API, providing type-safe access to all endpoints defined in the Swagger specification.

## Features

- **Type-safe**: Full TypeScript support with interfaces matching the Swagger spec
- **Error handling**: Comprehensive error handling with retry logic
- **Utilities**: Helper functions for validation, formatting, and common operations
- **Configuration**: Easy configuration using environment variables
- **Singleton pattern**: Pre-configured client instance ready to use

## Quick Start

### Basic Usage

```typescript
import { tacoBotApiClient } from './libs/tacobot';

// Check API health
const health = await tacoBotApiClient.getHealth();
console.log('API Status:', health.data);

// Get guild information
const guild = await tacoBotApiClient.getGuild('123456789012345678');
console.log('Guild:', guild.data.name);
```

### Custom Configuration

```typescript
import { TacoBotApiClient } from './libs/tacobot';

const customClient = new TacoBotApiClient({
  baseUrl: 'https://your-tacobot-api.com',
  token: 'your-api-token',
  tokenHeader: 'X-TACOBOT-TOKEN',
  timeout: 30000
});
```

## Available Methods

### Health & Info

- `getHealth()` - Check API health status
- `getSwagger()` - Get Swagger specification


### Discord Guilds

- `getGuilds()` - List all guilds
- `getGuild(guildId)` - Get specific guild info
- `getGuildChannels(guildId)` - Get guild channels
- `getGuildChannelsByIds(guildId, channelIds)` - Get multiple channels by IDs (batch)
- `getGuildEmojis(guildId)` - Get guild emojis
- `getGuildEmojisByIds(guildId, emojiIds)` - Get multiple emojis by IDs (batch)
- `getGuildEmojisByNames(guildId, emojiNames)` - Get multiple emojis by names (batch)
- `getGuildCategories(guildId)` - Get channel categories
- `getGuildRoles(guildId)` - Get guild roles
- `getGuildRolesByIds(guildId, roleIds)` - Get multiple roles by IDs (batch)

### Join Whitelist

- `getJoinWhitelist(guildId)` - Get entire join whitelist for a guild (avoid for very large lists)
- `getJoinWhitelistPage(guildId, skip?, take?)` - Get paginated join whitelist entries
- `addJoinWhitelistUser(guildId, userId, addedBy?)` - Add (upsert) a user to the whitelist
- `updateJoinWhitelistUser(guildId, userId, addedBy?)` - Update (re-add) a whitelist entry
- `removeJoinWhitelistUser(guildId, userId)` - Remove a user from the whitelist

### Minecraft

- `getMinecraftStatus()` - Get server status
- `getMinecraftWhitelist()` - Get whitelist
- `getMinecraftOps()` - Get ops list
- `getPlayerStats(username)` - Get player statistics
- `getMinecraftWorlds()` - Get available worlds

### Permissions

- `getUserPermissions(guildId, userId)` - Get user permissions
- `addUserPermission(guildId, userId, permission)` - Add permission
- `removeUserPermission(guildId, userId, permission)` - Remove permission

### Webhooks

- `sendMinecraftTacosWebhook(action, payload)` - Send tacos webhook
- `sendGameWebhook(payload)` - Send game webhook
- `sendShiftCodeWebhook(payload)` - Send SHiFT code webhook

## Error Handling

The client includes comprehensive error handling:

```typescript
import { handleApiError, isApiError, retryApiCall } from './libs/tacobot';

try {
  const guild = await tacoBotApiClient.getGuild(guildId);
  console.log(guild.data);
} catch (error) {
  if (isApiError(error)) {
    console.error('API Error:', handleApiError(error, 'Get Guild'));
  } else {
    console.error('Unknown error:', error);
  }
}
```

### Retry Logic

```typescript
import { retryApiCall } from './libs/tacobot';

const response = await retryApiCall(
  () => tacoBotApiClient.getGuild(guildId),
  3, // max retries
  1000 // delay in ms
);
```

## Utilities

The client includes various utility functions:

```typescript
import { 
  isValidGuildId,
  isValidUserId,
  isValidMinecraftUsername,
  timestampToDate,
  getSnowflakeTimestamp
} from './libs/tacobot';

// Validate Discord IDs
if (isValidGuildId(guildId)) {
  // Valid guild ID
}

// Convert timestamps
const date = timestampToDate(unixTimestamp);
const discordDate = getSnowflakeTimestamp(discordId);
```

## Configuration

The client uses your environment configuration from `src/config/env/environment.ts`:

- `TBW_TACOBOT_API_URL` - API base URL
- `TBW_TACOBOT_API_TOKEN` - Authentication token  
- `TBW_TACOBOT_API_HEADER` - Token header name

## Types

All API response types are fully typed based on the Swagger specification:

```typescript
import { 
  DiscordGuild,
  MinecraftServerStatus,
  TacoMinecraftWorlds,
  ShiftCodePayload
} from './libs/tacobot';

const guild: DiscordGuild = await tacoBotApiClient.getGuild(guildId);
const status: MinecraftServerStatus = await tacoBotApiClient.getMinecraftStatus();
```

## Examples

See `examples.ts` for comprehensive usage examples including:

- Basic API calls
- Error handling patterns
- Batch operations
- Webhook usage
- Join whitelist management
- Custom client configuration

## API Endpoints Covered

The client covers all endpoints from the Swagger specification:

- **Health**: `/api/v1/health`
- **Guilds**: `/api/v1/guilds/*`
- **Minecraft**: `/api/v1/minecraft/*`
- **Permissions**: `/api/v1/permissions/*`
- **Webhooks**: `/webhook/*`
- **Twitch**: `/tacobot/guild/*/invite/*`

For a complete list of available methods, see the `TacoBotApiClient` class documentation.

### Join Whitelist Example

```typescript
import { tacoBotApiClient } from './libs/tacobot';

// Add a user
const added = await tacoBotApiClient.addJoinWhitelistUser('123456789012345678', '555555555555555555', '111111111111111111');
console.log('Added:', added.data);

// Paginated list
const page = await tacoBotApiClient.getJoinWhitelistPage('123456789012345678', 0, 25);
console.log('First page users:', page.data.items.map(u => u.user_id));

// Update (re-add)
await tacoBotApiClient.updateJoinWhitelistUser('123456789012345678', '555555555555555555', '222222222222222222');

// Remove user
await tacoBotApiClient.removeJoinWhitelistUser('123456789012345678', '555555555555555555');
```

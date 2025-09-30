const SettingsFieldTypes = {
  STRING: {
    type: 'string',
    name: 'String',
    description: 'A simple text string',
  },
  URL: {
    type: 'url',
    name: 'URL',
    description: 'A web URL',
  },
  NUMBER: {
    type: 'number',
    name: 'Numeric',
    description: 'A numeric value',
  },
  BOOLEAN: {
    type: 'boolean',
    name: 'Boolean',
    description: 'A true/false value',
  },
  ARRAY: {
    type: 'array',
    name: 'Array',
    description: 'A list of values',
  },
  OBJECT: {
    type: 'object',
    name: 'Object',
    description: 'A nested object with key/value pairs',
  },
  GUILD: {
    type: 'guild',
    name: 'Guild',
    description: 'A Discord guild/server',
  },
  CHANNEL: {
    type: 'channel',
    name: 'Channel',
    description: 'A Discord channel',
  },
  ROLE: {
    type: 'role',
    name: 'Role',
    description: 'A Discord role',
  },
  EMOJI: {
    type: 'emoji',
    name: 'Emoji',
    description: 'A Discord emoji',
  },
  DISCORD_USER: {
    type: 'discord_user',
    name: 'Discord User',
    description: 'A Discord user',
  }
};

$(() => {
  const discordUserLoader = new DiscordUserLoader();
  const duElements = $('[data-discord-user]');
  discordUserLoader.renderBatch(duElements);

  const discordGuildLoader = new DiscordGuildLoader();
  const dgElements = $('[data-discord-guild]');
  discordGuildLoader.renderBatch(dgElements);

  const discordEmojiIdLoader = new DiscordEmojiIdLoader();
  const deIdElements = $('[data-discord-emoji-id]');
  discordEmojiIdLoader.renderBatch(deIdElements);

  const discordEmojiNameLoader = new DiscordEmojiNameLoader();
  const deNameElements = $('[data-discord-emoji-name]');
  discordEmojiNameLoader.renderBatch(deNameElements);

  const discordChannelLoader = new DiscordChannelLoader();
  const dcElements = $('[data-discord-channel]');
  discordChannelLoader.renderBatch(dcElements);

  const discordRoleLoader = new DiscordRoleLoader();
  const drElements = $('[data-discord-role]');
  discordRoleLoader.renderBatch(drElements);

  const discordMentionableLoader = new DiscordMentionableLoader();
  const dmElements = $('[data-discord-mentionable]');
  discordMentionableLoader.renderBatch(dmElements);

  // const twitchUserLoader = new TwitchUserLoader();
  // const tuElements = $('[data-twitch-user]');
  // twitchUserLoader.renderBatch(tuElements);
});

class TemplateLoader {
  constructor() {
    this.cache = new Map();
  }

  async fetch(id) {
    throw new Error('fetch method not implemented');
  }

  async fetchBatch(ids) {
    throw new Error('fetchBatch method not implemented');
  }

  async render(element, id) {
    throw new Error('render method not implemented');
  }

  async renderBatch(elements) {
    throw new Error('renderBatch method not implemented');
  }
}

class DiscordUserLoader extends TemplateLoader {
  constructor() {
    super();
    console.log('Initialized DiscordUserLoader');
  }

  async fetch(id) {
    const userId = id.toString().trim();
    if (this.cache.has(userId)) {
      return this.cache.get(userId);
    }

    const response = await $.ajax({
      url: `/api/v1/users/${userId}`,
      method: 'GET',
      contentType: 'application/json',
    });

    this.cache.set(userId, response);
    return response;
  }

  async fetchBatch(ids) {
    const uncachedIds = ids.filter(id => !this.cache.has(id));
    if (uncachedIds.length > 0) {
      const response = await $.ajax({
        url: `/api/v1/users/batch/`,
        method: 'POST',
        contentType: 'application/json',
        data: JSON.stringify(uncachedIds),
      });

      response.forEach(user => {
        if (user && user.user_id && user.guild_id) {
          const key = `${user.guild_id}/${user.user_id}`;
          this.cache.set(key, user);
          // Also cache by user_id only for global lookups
          this.cache.set(user.user_id.toString().trim(), user);
        }
      });
    }

    return ids.map(id => this.cache.get(id.toString().trim()));
  }

  async render(element, id) {
    let user = await this.fetch(id);
    const userId = $(element).data('discord-user')?.toString().trim();
    let guildId = $(element).data('discord-user-guild')?.toString().trim();
    // if (!guildId) {
    //   guildId = window.TBW_CONFIG.tacobot.primaryGuildId;
    // }

    $(element).empty();
    if (!user) {
      user = new DiscordUnknownUserEntry({
        user_id: userId,
        guild_id: guildId,
      });
    }
    Templates.render($(element), 'discord-user', user);
    ImageErrorHandler.register($('img[data-img-error]', element));
  }

  async renderBatch(elements) {
    const userIds = [];
    elements.each((index, element) => {
      const userId = $(element).data('discord-user')?.toString().trim();
      let guildId = $(element).data('discord-user-guild')?.toString().trim();
      if (userId) {
        // userIds.push(userId.toString().trim());
        if (!guildId) {
          userIds.push(`${userId}`);
        } else {
          userIds.push(`${guildId}/${userId}`);
        }
      }
    });

    if (userIds.length === 0) {
      return;
    }

    const users = await this.fetchBatch(userIds);
    elements.each((index, element) => {
      const userId = $(element).data('discord-user')?.toString().trim();
      let guildId = $(element).data('discord-user-guild')?.toString().trim();
      let user = null;
      if (!guildId) {
        user = users.find(u => u?.user_id?.toString().trim() === userId.toString());
      } else {
        user = users.find(u => u?.user_id?.toString().trim() === userId.toString() && u?.guild_id?.toString().trim() === guildId?.toString());
      }
      $(element).empty().removeClass('loading');
      if (!user) {
        user = new DiscordUnknownUserEntry({
          user_id: userId,
          guild_id: guildId,
        });
      }
      Templates.render($(element), 'discord-user', user);
      ImageErrorHandler.register($('img[data-img-error]', element));
    });
  }
}

class DiscordUnknownUserEntry {
  constructor(data = {}) {
    this._id = undefined;
    this.user_id = '';
    this.guild_id = '';
    this.avatar = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=';
    this.bot = false;
    this.system = false;
    this.created = 0;
    this.timestamp = 0;
    this.status = undefined;
    this.displayname = 'Unknown User';
    this.username = 'unknown';
    this.discriminator = '0000';
    Object.assign(this, data);
  }

  link() {
    return `https://discord.com/users/${this.user_id}`;
  }
}

class DiscordGuildLoader extends TemplateLoader {
  constructor() {
    super();
    console.log('Initialized DiscordGuildLoader');
  }

  async fetch(id) {
    const guildId = id.toString().trim();
    if (this.cache.has(guildId)) {
      return this.cache.get(guildId);
    }

    const response = await $.ajax({
      url: `/api/v1/guild/lookup/${guildId}`,
      method: 'GET',
      contentType: 'application/json',
    });

    this.cache.set(guildId, response);
    return response;
  }

  async fetchBatch(ids) {
    const uncachedIds = ids.filter(id => !this.cache.has(id));
    if (uncachedIds.length > 0) {
      const response = await $.ajax({
        url: `/api/v1/guilds/lookup/batch/`,
        method: 'POST',
        contentType: 'application/json',
        data: JSON.stringify(uncachedIds),
      });

      response.forEach(guild => {
        if (guild && guild.guild_id) {
          this.cache.set(guild.guild_id.toString().trim(), guild);
        }
      });
    }

    return ids.map(id => this.cache.get(id.toString().trim()));
  }

  async render(element, id) {
    const guild = await this.fetch(id);
    if (guild) {
      $(element).empty();
      Templates.render($(element), 'discord-guild', guild);
      ImageErrorHandler.register($('img[data-img-error]', element));
    }
  }

  async renderBatch(elements) {
    const guildIds = [];
    elements.each((index, element) => {
      const guildId = $(element).data('discord-guild');
      if (guildId || guildId.toString().trim() === "0") {
        guildIds.push(guildId.toString().trim());
      }
    });

    if (guildIds.length === 0) {
      return;
    }

    const guilds = await this.fetchBatch(guildIds);
    elements.each((index, element) => {
      const guildId = $(element).data('discord-guild').toString().trim();
      const guild = guilds.find(u => u && u.guild_id && u.guild_id.toString().trim() === guildId.toString());
      if (guild) {
        $(element).empty();
        Templates.render($(element), 'discord-guild', guild);
        ImageErrorHandler.register($('img[data-img-error]', element));
      }
    });
  }
}

class TwitchUserLoader extends TemplateLoader {
  constructor() {
    super();
    console.log('Initialized TwitchUserLoader');
  }
  // http://decapi.me/twitch/avatar/<username>
  async fetch(id) { }
  async fetchBatch(ids) { }
  async render(element, id) { }
  async renderBatch(elements) { }
}

class DiscordEmojiIdLoader extends TemplateLoader {
  constructor() {
    super();
    console.log('Initialized DiscordEmojiIdLoader');
  }
  async fetch(guild, id) {
    if (!id || !guild) {
      return null;
    }
    const emojiId = id.toString().trim();
    const guildId = guild.toString().trim();
    const cacheKey = `${guildId}/${emojiId}`;
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey);
    }

    const response = await $.ajax({
      url: `/api/v1/emoji/${guildId}/${emojiId}`,
      method: 'GET',
      contentType: 'application/json',
    });

    this.cache.set(cacheKey, response);
    return response;
  }

  async fetchBatch(guild, ids) {
    if (!ids || ids.length === 0 || !guild) {
      return [];
    }
    const guildId = guild.toString().trim();
    const uncachedIds = ids.filter(id => {
      console.log("filter => id", id);
      const cacheKey = `${guildId}/${id.toString().trim()}`;
      return !this.cache.has(cacheKey);
    });
    if (uncachedIds.length > 0) {
      const response = await $.ajax({
        url: `/api/v1/emojis/${guildId}/batch/ids`,
        method: 'POST',
        contentType: 'application/json',
        data: JSON.stringify({ ids: uncachedIds }),
      });

      response.forEach(emoji => {
        console.log("response.forEach => emoji", emoji);
        if (emoji && emoji.id && emoji.guild_id) {
          const keyById = `${emoji.guild_id.toString().trim()}/${emoji.id.toString().trim()}`;
          const keyByName = `${emoji.guild_id.toString().trim()}/${emoji.name.toString().trim()}`;
          this.cache.set(keyById, emoji);
          if (emoji.name) {
            this.cache.set(keyByName, emoji);
          }
        }
      });
    }

    return ids.map(id => {
      console.log("ids.map => id", id);
      const cacheKey = `${guildId}/${id.toString().trim()}`;
      console.log("ids.map => cacheKey", cacheKey);
      return this.cache.get(cacheKey) || null;
    });
  }

  async render(element, id) {
    const emojiId = id?.toString().trim();
    const gId = $(element).data('discord-emoji-guild')?.toString().trim();

    if (!emojiId || !gId) {
      console.warn('Missing emoji ID or guild ID for DiscordEmojiIdLoader', { emojiId, gId });
      $(element).text(`<:unknown:${emojiId || 'invalid'}>`);
      return;
    }

    try {
      const emoji = await this.fetch(gId, emojiId);
      $(element).empty().removeClass('loading');

      if (emoji) {
        Templates.render($(element), 'discord-emoji', emoji);
        ImageErrorHandler.register($('img[data-img-error]', element));
      } else {
        $(element).text(`<:unknown:${emojiId}>`);
      }
    } catch (error) {
      console.error('Error rendering emoji by ID:', error);
      $(element).empty().removeClass('loading').text(`<:error:${emojiId}>`);
    }
  }

  async renderBatch(elements) {
    const emojis = [];
    const batchMap = new Map();

    elements.each((index, element) => {
      const emojiId = $(element).data('discord-emoji-id')?.toString().trim();
      const gId = $(element).data('discord-emoji-guild')?.toString().trim();

      if (!gId) {
        console.warn('No guild ID specified for DiscordEmojiIdLoader', element);
        return;
      }

      // add the emojiId to the batchMap for this guild if it doesn't exist
      if (emojiId) {
        if (!batchMap.has(gId)) {
          batchMap.set(gId, new Set());
        }
        batchMap.get(gId).add(emojiId);
      }
    });

    if (batchMap.size === 0) {
      return;
    }

    // For each guild, fetch the emojis by IDs
    for (const [guildId, idSet] of batchMap.entries()) {
      const idArray = Array.from(idSet);
      console.log(`Fetching ${idArray.length} emojis for guild ${guildId}:`, idArray);
      const fetchedEmojis = await this.fetchBatch(guildId, idArray);
      console.log('Fetched emojis:', fetchedEmojis);
      if (fetchedEmojis && fetchedEmojis.length > 0) {
        emojis.push(...fetchedEmojis);
      } else {
        console.warn(`No emojis returned for guild ${guildId}`);
      }
    }

    console.log('Fetched emojis:', emojis);

    if (emojis.length === 0) {
      return;
    }

    // Now render each element
    elements.each((index, element) => {
      const emojiId = $(element).data('discord-emoji-id')?.toString().trim();
      const gId = $(element).data('discord-emoji-guild')?.toString().trim();
      console.log("emoji", emojiId, gId);
      const emoji = emojis.find((e) => {
        return e && e.id && e.id.toString().trim() === emojiId.toString()
          && e.guild_id && e.guild_id.toString().trim() === gId.toString();
      });
      $(element).empty().removeClass('loading');
      if (emoji) {
        Templates.render($(element), 'discord-emoji', emoji);
        ImageErrorHandler.register($('img[data-img-error]', element));
      } else {
        $(element).text(`<:unknown:${emojiId}>`);
      }
    });
  }
}

class DiscordEmojiNameLoader extends TemplateLoader {
  constructor() {
    super();
    console.log('Initialized DiscordEmojiNameLoader');
  }
  async fetch(guild, name) {
    if (!name || !guild) {
      return null;
    }
    const emojiName = name.toString().trim();
    const guildId = guild.toString().trim();
    const cacheKey = `${guildId}/${emojiName}`;
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey);
    }

    const response = await $.ajax({
      url: `/api/v1/emoji/${guildId}/lookup/${emojiName}`,
      method: 'GET',
      contentType: 'application/json',
    });

    this.cache.set(cacheKey, response);
    return response;
  }
  async fetchBatch(guild, names) {
    if (!names || names.length === 0 || !guild) {
      return [];
    }
    const guildId = guild.toString().trim();
    const uncachedNames = names.filter(name => {
      const cacheKey = `${guildId}/${name.toString().trim()}`;
      return !this.cache.has(cacheKey);
    });
    if (uncachedNames.length > 0) {
      const response = await $.ajax({
        url: `/api/v1/emojis/${guildId}/batch/names`,
        method: 'POST',
        contentType: 'application/json',
        data: JSON.stringify(uncachedNames),
      });

      response.forEach(emoji => {
        if (emoji && emoji.id && emoji.guild_id && emoji.name) {
          // const keyById = `${emoji.guild_id.toString().trim()}/${emoji.id.toString().trim()}`;
          const keyByName = `${emoji.guild_id.toString().trim()}/${emoji.name.toString().trim()}`;
          // this.cache.set(keyById, emoji);
          this.cache.set(keyByName, emoji);
        }
      });
    }

    return names.map(name => {
      const cacheKey = `${guildId}/${name.toString().trim()}`;
      return this.cache.get(cacheKey) || null;
    });
  }
  async render(element, name) {
    const emojiName = name?.toString().trim();
    const gId = $(element).data('discord-emoji-guild')?.toString().trim();

    if (!emojiName || !gId) {
      console.warn('Missing emoji name or guild ID for DiscordEmojiNameLoader', { emojiName, gId });
      $(element).text(`:${emojiName || 'invalid'}:`);
      return;
    }

    try {
      const emoji = await this.fetch(gId, emojiName);
      $(element).empty().removeClass('loading');

      if (emoji) {
        Templates.render($(element), 'discord-emoji', emoji);
        ImageErrorHandler.register($('img[data-img-error]', element));
      } else {
        $(element).text(`:${emojiName}:`);
      }
    } catch (error) {
      console.error('Error rendering emoji by name:', error);
      $(element).empty().removeClass('loading').text(`:${emojiName}:`);
    }
  }

  async renderBatch(elements) {
    const emojis = [];
    const batchMap = new Map();

    elements.each((index, element) => {
      const emojiName = $(element).data('discord-emoji-name')?.toString().trim();
      const gId = $(element).data('discord-emoji-guild')?.toString().trim();

      if (!gId) {
        console.warn('No guild ID specified for DiscordEmojiNameLoader', element);
        return;
      }

      // add the emojiName to the batchMap for this guild if it doesn't exist
      if (emojiName) {
        if (!batchMap.has(gId)) {
          batchMap.set(gId, new Set());
        }
        batchMap.get(gId).add(emojiName);
      }
    });

    if (batchMap.size === 0) {
      return;
    }

    // For each guild, fetch the emojis by names
    for (const [guildId, nameSet] of batchMap.entries()) {
      const nameArray = Array.from(nameSet);
      const fetchedEmojis = await this.fetchBatch(guildId, nameArray);
      if (fetchedEmojis && fetchedEmojis.length > 0) {
        emojis.push(...fetchedEmojis);
      } else {
        console.warn(`No emojis returned for guild ${guildId}`);
      }
    }

    if (emojis.length === 0) {
      return;
    }

    // Now render each element
    elements.each((index, element) => {
      const emojiName = $(element).data('discord-emoji-name')?.toString().trim();
      const gId = $(element).data('discord-emoji-guild')?.toString().trim();
      const emoji = emojis.find((e) => {
        return e && e.name && e.name.toString().trim() === emojiName.toString()
          && e.guild_id && e.guild_id.toString().trim() === gId.toString();
      });
      $(element).empty().removeClass('loading');
      if (emoji) {
        Templates.render($(element), 'discord-emoji', emoji);
        ImageErrorHandler.register($('img[data-img-error]', element));
      } else {
        $(element).text(`:${emojiName}:`);
      }
    });
  }
}

class DiscordChannelLoader extends TemplateLoader {
  constructor() {
    super();
    console.log('Initialized DiscordChannelLoader');
  }

  // helper function to convert the channel type to a font-awesome icon class
  channelTypeToIcon(type) {
    switch (type) {
      case "text": return 'fas fa-hashtag'; // text channel
      case "voice": return 'fas fa-headphones'; // voice channel
      case "category": return 'fas fa-book'; // category
      case "news": return 'fas fa-bell-slash'; // announcement channel
      case "stage": return 'fas fa-video'; // stage channel
      default: return 'fas fa-question'; // unknown
    }
  }

  async fetch(guild, id) {
    if (!id || !guild) {
      return null;
    }
    const channelId = id.toString().trim();
    const guildId = guild.toString().trim();
    const cacheKey = `${guildId}/${channelId}`;
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey);
    }

    // Use the batch endpoint, even for a single id
    const response = await $.ajax({
      url: `/api/v1/channels/${guildId}/batch/ids`,
      method: 'POST',
      contentType: 'application/json',
      data: JSON.stringify([channelId]),
    });

    if (Array.isArray(response) && response.length > 0) {
      // add the faType property for icon rendering
      response[0].faType = this.channelTypeToIcon(response[0].type);
      // cache by guild/channel
      this.cache.set(cacheKey, response[0]);
      return response[0];
    }
    return null;
  }

  async fetchBatch(guild, ids) {
    if (!ids || ids.length === 0 || !guild) {
      return [];
    }
    const guildId = guild.toString().trim();
    const uncachedIds = ids.filter(id => {
      const cacheKey = `${guildId}/${id.toString().trim()}`;
      return !this.cache.has(cacheKey);
    });
    if (uncachedIds.length > 0) {
      const response = await $.ajax({
        url: `/api/v1/channels/${guildId}/batch/ids`,
        method: 'POST',
        contentType: 'application/json',
        data: JSON.stringify(uncachedIds),
      });
      if (Array.isArray(response)) {
        response.forEach(channel => {
          if (channel && channel.id && channel.guild_id) {
            // add the faType property for icon rendering
            channel.faType = this.channelTypeToIcon(channel.type);
            // cache by guild/channel
            const cacheKey = `${channel.guild_id.toString().trim()}/${channel.id.toString().trim()}`;
            this.cache.set(cacheKey, channel);
          }
        });
      }
    }
    return ids.map(id => {
      const cacheKey = `${guildId}/${id.toString().trim()}`;
      return this.cache.get(cacheKey) || null;
    });
  }

  async render(element, id) {
    const channelId = id?.toString().trim();
    const gId = $(element).data('discord-channel-guild')?.toString().trim();
    if (!channelId || !gId) {
      console.warn('Missing channel ID or guild ID for DiscordChannelLoader', { channelId, gId });
      $(element).text(`#unknown-channel`);
      return;
    }
    try {
      const channel = await this.fetch(gId, channelId);
      $(element).empty().removeClass('loading');
      if (channel) {
        Templates.render($(element), 'discord-channel-field', channel);
      } else {
        $(element).text(`#unknown-channel`);
      }
    } catch (error) {
      console.error('Error rendering channel by ID:', error);
      $(element).empty().removeClass('loading').text(`#error-channel`);
    }
  }

  async renderBatch(elements) {
    const channels = [];
    const batchMap = new Map();

    elements.each((index, element) => {
      const channelId = $(element).data('discord-channel')?.toString().trim();
      const gId = $(element).data('discord-channel-guild')?.toString().trim();
      if (!gId) {
        console.warn('No guild ID specified for DiscordChannelLoader', element);
        return;
      }
      if (channelId) {
        if (!batchMap.has(gId)) {
          batchMap.set(gId, new Set());
        }
        batchMap.get(gId).add(channelId);
      }
    });

    if (batchMap.size === 0) {
      console.warn('No valid guild/channel ID pairs found for DiscordChannelLoader');
      return;
    }

    for (const [guildId, idSet] of batchMap.entries()) {
      const idArray = Array.from(idSet);
      const fetchedChannels = await this.fetchBatch(guildId, idArray);
      if (fetchedChannels && fetchedChannels.length > 0) {
        channels.push(...fetchedChannels);
      }
    }

    if (channels.length === 0) {
      console.warn('No channels found for DiscordChannelLoader');
      return;
    }

    console.log('Fetched channels:', channels);
    elements.each((index, element) => {
      const channelId = $(element).data('discord-channel')?.toString().trim();
      const gId = $(element).data('discord-channel-guild')?.toString().trim();
      const channel = channels.find(c => c && c.id && c.id.toString().trim() === channelId && c.guild_id && c.guild_id.toString().trim() === gId);
      $(element).empty().removeClass('loading');
      if (channel) {
        Templates.render($(element), 'discord-channel-field', channel);
      } else {
        $(element).text(`#unknown-channel`);
      }
    });
  }
}

class DiscordRoleLoader extends TemplateLoader {
  constructor() {
    super();
    console.log('Initialized DiscordRoleLoader');
  }

  roleColorToCssValue(color) {
    if (typeof color === 'number' && color > 0) {
      return `#${color.toString(16).padStart(6, '0')}`;
    }

    return 'light-dark(var(--bs-light-text-emphasis), var(--bs-dark-text-emphasis))';
  }

  async fetch(guild, id) {
    if (!id || !guild) {
      return null;
    }
    const roleId = id.toString().trim();
    const guildId = guild.toString().trim();
    const cacheKey = `${guildId}/${roleId}`;
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey);
    }

    const response = await $.ajax({
      url: `/api/v1/roles/${guildId}/batch/ids`,
      method: 'POST',
      contentType: 'application/json',
      data: JSON.stringify([roleId]),
    });

    if (Array.isArray(response) && response.length > 0) {
      // add the cssColor property for color rendering
      response[0].cssColor = this.roleColorToCssValue(response[0].color);
      this.cache.set(cacheKey, response[0]);
      return response[0];
    }
    return null;
  }

  async fetchBatch(guild, ids) {
    if (!ids || ids.length === 0 || !guild) {
      return [];
    }
    const guildId = guild.toString().trim();
    const uncachedIds = ids.filter(id => {
      const cacheKey = `${guildId}/${id.toString().trim()}`;
      return !this.cache.has(cacheKey);
    });
    if (uncachedIds.length > 0) {
      const response = await $.ajax({
        url: `/api/v1/roles/${guildId}/batch/ids`,
        method: 'POST',
        contentType: 'application/json',
        data: JSON.stringify(uncachedIds),
      });
      if (Array.isArray(response)) {
        response.forEach(role => {
          if (role && role.id && role.guild_id) {
            // add the cssColor property for color rendering
            role.cssColor = this.roleColorToCssValue(role.color);
            // cache by guild/role
            const cacheKey = `${role.guild_id.toString().trim()}/${role.id.toString().trim()}`;
            this.cache.set(cacheKey, role);
          }
        });
      }
    }
    return ids.map(id => {
      const cacheKey = `${guildId}/${id.toString().trim()}`;
      return this.cache.get(cacheKey) || null;
    });
  }

  renderFailure(element, id, gId, reason) {
    $(element).empty().removeClass('loading');
    const tpl = 'discord-user-field';
    Templates.render($(element), tpl, { id, guild_id: gId, name: reason, displayname: reason, type: 'user' });
    ImageErrorHandler.register($('img[data-img-error]', element));
    $('.role-icon-label', element).remove();
  }


  async render(element, id) {
    const roleId = id?.toString().trim();
    const gId = $(element).data('discord-role-guild')?.toString().trim();
    if (!roleId || !gId) {
      console.warn('Missing role ID or guild ID for DiscordRoleLoader', { roleId, gId });
      $(element).text(`@unknown-role`);
      return;
    }
    try {
      const role = await this.fetch(gId, roleId);
      $(element).empty().removeClass('loading');
      if (role) {
        Templates.render($(element), 'discord-role-field', role);
        if (!role.icon) {
          // remove the image container
          $('.role-icon-label', element).remove();
        } else {
          $('img.placeholder', element).removeClass('placeholder');
          ImageErrorHandler.register($('img[data-img-error]', element));
        }
      } else {
        this.renderFailure(element, roleId, gId, '@unknown-role');
      }
    } catch (error) {
      console.error('Error rendering role by ID:', error);
      this.renderFailure(element, roleId, gId, '@error-role');
    }
  }

  async renderBatch(elements) {
    const roles = [];
    const batchMap = new Map();

    elements.each((index, element) => {
      const roleId = $(element).data('discord-role')?.toString().trim();
      const gId = $(element).data('discord-role-guild')?.toString().trim();
      if (!gId) {
        console.warn('No guild ID specified for DiscordRoleLoader', element);
        return;
      }
      if (roleId) {
        if (!batchMap.has(gId)) {
          batchMap.set(gId, new Set());
        }
        batchMap.get(gId).add(roleId);
      }
    });

    if (batchMap.size === 0) {
      console.warn('No valid guild/role ID pairs found for DiscordRoleLoader');
      return;
    }

    for (const [guildId, idSet] of batchMap.entries()) {
      const idArray = Array.from(idSet);
      const fetchedRoles = await this.fetchBatch(guildId, idArray);
      if (fetchedRoles && fetchedRoles.length > 0) {
        roles.push(...fetchedRoles);
      }
    }

    if (roles.length === 0) {
      console.warn('No roles found for DiscordRoleLoader');
      return;
    }
    console.log('Fetched roles:', roles);
    elements.each((index, element) => {
      const roleId = $(element).data('discord-role')?.toString().trim();
      const gId = $(element).data('discord-role-guild')?.toString().trim();
      const role = roles.find(r => r && r.id && r.id.toString().trim() === roleId && r.guild_id && r.guild_id.toString().trim() === gId);
      $(element).empty().removeClass('loading');
      if (role) {
        Templates.render($(element), 'discord-role-field', role);
        if (!role.icon) {
          // remove the image container
          $('.role-icon-label', element).remove();
        } else {
          $('img.placeholder', element).removeClass('placeholder');
          ImageErrorHandler.register($('img[data-img-error]', element));
        }
      } else {
        this.renderFailure(element, roleId, gId, '@unknown-role');
      }
    });
  }
}

class DiscordMentionableLoader extends TemplateLoader {
  constructor() {
    super();
    console.log('Initialized DiscordMentionableLoader');
  }

  roleColorToCssValue(color) {
    if (typeof color === 'number' && color > 0) {
      return `#${color.toString(16).padStart(6, '0')}`;
    }
    return 'light-dark(var(--bs-light-text-emphasis), var(--bs-dark-text-emphasis))';
  }

  async fetch(guild, id) {
    if (!id || !guild) {
      return null;
    }
    const mentionableId = id.toString().trim();
    const guildId = guild.toString().trim();
    const cacheKey = `${guildId}/${mentionableId}`;
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey);
    }

    const response = await $.ajax({
      url: `/api/v1/mentionables/${guildId}/batch/ids`,
      method: 'POST',
      contentType: 'application/json',
      data: JSON.stringify([mentionableId]),
    });

    if (Array.isArray(response) && response.length > 0) {
      const m = response[0];
      if (m && m.type === 'role') {
        m.cssColor = this.roleColorToCssValue(m.color);
      }
      this.cache.set(cacheKey, m);
      return m;
    }
    return null;
  }

  async fetchBatch(guild, ids) {
    if (!ids || ids.length === 0 || !guild) {
      return [];
    }
    const guildId = guild.toString().trim();
    const uncachedIds = ids.filter(id => {
      const cacheKey = `${guildId}/${id.toString().trim()}`;
      return !this.cache.has(cacheKey);
    });
    if (uncachedIds.length > 0) {
      const response = await $.ajax({
        url: `/api/v1/mentionables/${guildId}/batch/ids`,
        method: 'POST',
        contentType: 'application/json',
        data: JSON.stringify(uncachedIds),
      });
      if (Array.isArray(response)) {
        response.forEach(m => {
          if (m && m.id && m.guild_id) {
            if (m.type === 'role') {
              m.cssColor = this.roleColorToCssValue(m.color);
            }
            const cacheKey = `${m.guild_id.toString().trim()}/${m.id.toString().trim()}`;
            this.cache.set(cacheKey, m);
          }
        });
      }
    }
    return ids.map(id => {
      const cacheKey = `${guildId}/${id.toString().trim()}`;
      return this.cache.get(cacheKey) || null;
    });
  }

  renderFailure(element, id, gId, reason) {
    $(element).empty().removeClass('loading');
    const tpl = 'discord-user-field';
    Templates.render($(element), tpl, { id, guild_id: gId, name: reason, displayname: reason, type: 'user' });
    ImageErrorHandler.register($('img[data-img-error]', element));
    $('.role-icon-label', element).remove();
  }

  async render(element, id) {
    const mentionableId = id?.toString().trim();
    const gId = $(element).data('discord-mentionable-guild')?.toString().trim();
    if (!mentionableId || !gId) {
      console.warn('Missing mentionable ID or guild ID for DiscordMentionableLoader', { mentionableId, gId });
      $(element).text(`@unknown`);
      return;
    }
    try {
      const m = await this.fetch(gId, mentionableId);
      $(element).empty().removeClass('loading');
      if (m) {
        const tpl = m.type === 'role' ? 'discord-role-field' : 'discord-user-field';
        Templates.render($(element), tpl, m);
        if (!m.icon && !m.avatar) {
          // remove the image container
          $('.role-icon-label', element).remove();
        } else {
          $('img.placeholder', element).removeClass('placeholder');
          ImageErrorHandler.register($('img[data-img-error]', element));
        }
      } else {
        this.renderFailure(element, mentionableId, gId, "Unknown");
      }
    } catch (error) {
      console.error('Error rendering mentionable by ID:', error);
      this.renderFailure(element, mentionableId, gId, "Error");
    }
  }

  async renderBatch(elements) {
    const results = [];
    const batchMap = new Map();

    elements.each((index, element) => {
      const id = $(element).data('discord-mentionable')?.toString().trim();
      const gId = $(element).data('discord-mentionable-guild')?.toString().trim();
      if (!gId) {
        console.warn('No guild ID specified for DiscordMentionableLoader', element);
        return;
      }
      if (id) {
        if (!batchMap.has(gId)) {
          batchMap.set(gId, new Set());
        }
        batchMap.get(gId).add(id);
      }
    });

    if (batchMap.size === 0) {
      console.warn('No valid guild/mentionable ID pairs found for DiscordMentionableLoader');
      return;
    }

    for (const [guildId, idSet] of batchMap.entries()) {
      const idArray = Array.from(idSet);
      const fetched = await this.fetchBatch(guildId, idArray);
      if (fetched && fetched.length > 0) {
        results.push(...fetched);
      }
    }

    if (results.length === 0) {
      console.warn('No mentionables found for DiscordMentionableLoader');
      return;
    }

    elements.each((index, element) => {
      const id = $(element).data('discord-mentionable')?.toString().trim();
      const gId = $(element).data('discord-mentionable-guild')?.toString().trim();
      const m = results.find(x => x && x.id && x.id.toString().trim() === id && x.guild_id && x.guild_id.toString().trim() === gId);
      $(element).empty().removeClass('loading');
      if (m) {
        const tpl = m.type === 'role' ? 'discord-role-field' : 'discord-user-field';
        Templates.render($(element), tpl, m);
        if (!m.icon && !m.avatar) {
          // remove the image container
          $('.role-icon-label', element).remove();
        } else {
          $('img.placeholder', element).removeClass('placeholder');
          ImageErrorHandler.register($('img[data-img-error]', element));
        }
      } else {
        this.renderFailure(element, id, gId, "Unknown");
      }
    });
  }
}
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
    console.log(users);
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
      console.log("filter => name", name);
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
        console.log("response.forEach => emoji", emoji);
        if (emoji && emoji.id && emoji.guild_id && emoji.name) {
          // const keyById = `${emoji.guild_id.toString().trim()}/${emoji.id.toString().trim()}`;
          const keyByName = `${emoji.guild_id.toString().trim()}/${emoji.name.toString().trim()}`;
          // this.cache.set(keyById, emoji);
          this.cache.set(keyByName, emoji);
        }
      });
    }

    return names.map(name => {
      console.log("names.map => name", name);
      const cacheKey = `${guildId}/${name.toString().trim()}`;
      console.log("names.map => cacheKey", cacheKey);
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
      console.log(`Fetching ${nameArray.length} emojis for guild ${guildId}:`, nameArray);
      const fetchedEmojis = await this.fetchBatch(guildId, nameArray);
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
      const emojiName = $(element).data('discord-emoji-name')?.toString().trim();
      const gId = $(element).data('discord-emoji-guild')?.toString().trim();
      console.log("emoji", emojiName, gId);
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
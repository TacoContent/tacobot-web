$(() => {
  const discordUserLoader = new DiscordUserLoader();
  const duElements = $('[data-discord-user]');
  discordUserLoader.renderBatch(duElements);

  const discordGuildLoader = new DiscordGuildLoader();
  const dgElements = $('[data-discord-guild]');
  discordGuildLoader.renderBatch(dgElements);
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
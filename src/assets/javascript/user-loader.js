
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
        if (user && user.user_id) {
          this.cache.set(user.user_id.toString().trim(), user);
        }
      });
    }

    return ids.map(id => this.cache.get(id.toString().trim()));
  }

  async render(element, id) {
    const user = await this.fetch(id);
    if (user) {
      $(element).empty();
      Templates.render($(element), 'discord-user', user);
      ImageErrorHandler.register($('img[data-img-error]', element));
    }
  }

  async renderBatch(elements) {
    const userIds = [];
    elements.each((index, element) => {
      const userId = $(element).data('discord-user');
      if (userId) {
        userIds.push(userId.toString().trim());
      }
    });

    if (userIds.length === 0) {
      return;
    }

    const users = await this.fetchBatch(userIds);
    elements.each((index, element) => {
      const userId = $(element).data('discord-user').toString().trim();
      const user = users.find(u => u && u.user_id && u.user_id.toString().trim() === userId.toString());
      if (user) {
        $(element).empty();
        Templates.render($(element), 'discord-user', user);
        ImageErrorHandler.register($('img[data-img-error]', element));
      }
    });
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
      if (guildId) {
        guildIds.push(guildId);
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
  async fetch(id) {}
  async fetchBatch(ids) {}
  async render(element, id) {}
  async renderBatch(elements) {}
}
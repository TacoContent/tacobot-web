
$(() => {
  const discordUserLoader = new DiscordUserLoader();
  const duElements = $('[data-discord-user]');
  discordUserLoader.renderUsers(duElements);
});

class UserLoader {
  constructor() {
    this.userCache = new Map();
  }

  async fetchUser(userId) {
    throw new Error('fetchUser method not implemented');
  }

  async fetchUsers(userIds) {
    throw new Error('fetchUsers method not implemented');
  }

  async renderUser(element, userId) {
    throw new Error('renderUser method not implemented');
  }

  async renderUsers(elements) {
    throw new Error('renderUsers method not implemented');
  }
}

class DiscordUserLoader extends UserLoader {
  constructor() {
    super();
    console.log('Initialized DiscordUserLoader');
  }

  async fetchUser(userId) {
    userId = userId.toString().trim();
    if (this.userCache.has(userId)) {
      return this.userCache.get(userId);
    }

    const response = await $.ajax({
      url: `/api/v1/users/${userId}`,
      method: 'GET',
      contentType: 'application/json',
    });

    this.userCache.set(userId, response);
    return response;
  }

  async fetchUsers(userIds) {
    const uncachedIds = userIds.filter(id => !this.userCache.has(id));
    if (uncachedIds.length > 0) {
      const response = await $.ajax({
        url: `/api/v1/users/batch/`,
        method: 'POST',
        contentType: 'application/json',
        data: JSON.stringify(uncachedIds),
      });

      response.forEach(user => {
        this.userCache.set(user.user_id.toString().trim(), user);
      });
    }

    return userIds.map(id => this.userCache.get(id.toString().trim()));
  }

  async renderUser(element, userId) {
    const user = await this.fetchUser(userId);
    if (user) {
      $(element).empty();
      Templates.render($(element), 'discord-user', user);
      ImageErrorHandler.register($('img[data-img-error]', element));
    }
  }

  async renderUsers(elements) {
    const userIds = [];
    elements.each((index, element) => {
      const userId = $(element).data('discord-user');
      if (userId) {
        userIds.push(userId);
      }
    });

    if (userIds.length === 0) {
      return;
    }

    const users = await this.fetchUsers(userIds);
    elements.each((index, element) => {
      const userId = $(element).data('discord-user').toString().trim();
      const user = users.find(u => u.user_id.toString().trim() === userId.toString());
      if (user) {
        $(element).empty();
        Templates.render($(element), 'discord-user', user);
        ImageErrorHandler.register($('img[data-img-error]', element));
      }
    });
  }
}

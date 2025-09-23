$(() =>{
  const userIds = [];
  const user_elements = $('[data-discord-user]');

  user_elements.each((index, element) => {
    userIds.push($(element).data('discord-user'));
  });

  if (userIds.length === 0) {
    return;
  }

  $.ajax({
    url: `/api/v1/users/batch/`,
    method: 'POST',
    contentType: 'application/json',
    data: JSON.stringify(userIds),
    success: function (data) {
      if (data && Array.isArray(data)) {
      } else {
        return;
      }
      const users = data;
      user_elements.each((index, element) => {
        const userId = $(element).data('discord-user').toString().trim();
        const user = users.find(u => u.user_id.toString().trim() === userId.toString());
        if (user) {
          $(element).empty();
          Templates.render($(element), 'discord-user', user);
        }
      });
    },
    error: function (err) {
      console.error('Error fetching users:', err);
    }
  });
});
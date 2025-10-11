(function () {
  const transparentPng = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR4nGNgYAAAAAMAASsJTYQAAAAASUVORK5CYII=';

  const usernameInput = document.getElementById('add-wl-username');
  const uuidInput = document.getElementById('add-wl-uuid');
  const previewImg = document.getElementById('add-wl-preview');

  function setBlankPreview() {
    if (previewImg) {
      previewImg.src = transparentPng;
    }
  }

  setBlankPreview();

  async function lookupMinecraftUser(username) {
    const name = (username || '').trim();
    if (!name || name.length < 3) {
      if (uuidInput) uuidInput.value = '';
      setBlankPreview();
      return;
    }
    try {
  const resp = await fetch('/api/v1/minecraft/users/' + encodeURIComponent(name));
      if (!resp.ok) {
        if (uuidInput) uuidInput.value = '';
        setBlankPreview();
        return;
      }
      const data = await resp.json();
      const uuid = data && (data.id || data.uuid);
      if (uuidInput) uuidInput.value = uuid || '';
      if (previewImg && uuid) {
        previewImg.src = 'https://crafatar.com/renders/body/' + uuid + '?overlay';
      } else {
        setBlankPreview();
      }
    } catch (e) {
      if (uuidInput) uuidInput.value = '';
      setBlankPreview();
    }
  }

  let debounce;
  if (usernameInput) {
    usernameInput.addEventListener('input', function () {
      clearTimeout(debounce);
      debounce = setTimeout(function () {
        lookupMinecraftUser(usernameInput.value);
      }, 350);
    });
  }

  if (previewImg) {
    previewImg.addEventListener('error', setBlankPreview);
  }

  const addModal = document.getElementById('add-whitelist-modal');
  if (addModal) {
    addModal.addEventListener('hidden.bs.modal', function () {
      const discordInput = document.getElementById('add-wl-discord');
      const guildInput = document.getElementById('add-wl-guild');
      if (discordInput) discordInput.value = '';
      if (guildInput) guildInput.value = '';
      if (usernameInput) usernameInput.value = '';
      if (uuidInput) uuidInput.value = '';
      setBlankPreview();
    });
  }
})();

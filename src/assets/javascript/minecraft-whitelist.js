(function () {
  const transparentPng = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR4nGNgYAAAAAMAASsJTYQAAAAASUVORK5CYII=';

  const usernameInput = document.getElementById('add-wl-username');
  const uuidInput = document.getElementById('add-wl-uuid');
  const previewImg = document.getElementById('add-wl-preview');

  function setBlankPreview() {
    console.log('Setting blank preview image');
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
      bodyApi = "https://crafthead.net/armor/body/"
      const data = await resp.json();
      const uuid = data && (data.id || data.uuid);
      if (uuidInput) uuidInput.value = uuid || '';
      if (previewImg && uuid) {
        console.log('Setting preview for UUID:', uuid);
        // previewImg.src = 'https://crafatar.com/renders/body/' + uuid + '?overlay';
        $(previewImg).attr('src', `${bodyApi}${uuid}?overlay`);
      } else {
        console.log('No UUID available, setting blank preview');
        setBlankPreview();
      }
    } catch (e) {
      console.error('Error looking up Minecraft user:', e);
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

  // -----------------------------
  // AJAX enable/disable whitelist
  // -----------------------------

  function ensureToastContainer() {
    let container = document.getElementById('global-toast-container');
    if (!container) {
      container = document.createElement('div');
      container.id = 'global-toast-container';
      container.className = 'position-fixed top-0 end-0 p-3';
      container.style.zIndex = '1080';
      document.body.appendChild(container);
    }
    return container;
  }

  function showToast(message, type = 'success') {
    // type: 'success' | 'error'
    const container = ensureToastContainer();

    const toast = document.createElement('div');
    toast.className = 'toast align-items-center text-bg-';
    toast.setAttribute('role', 'alert');
    toast.setAttribute('aria-live', 'assertive');
    toast.setAttribute('aria-atomic', 'true');
    toast.setAttribute('data-bs-delay', '3000');

    // Use bootstrap 5 utility classes for background
    const bgClass = type === 'success' ? 'success' : 'danger';
    toast.className = `toast align-items-center text-bg-${bgClass} border-0`;

    const toastBody = document.createElement('div');
    toastBody.className = 'd-flex';

    const body = document.createElement('div');
    body.className = 'toast-body';
    body.textContent = message;

    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'btn-close btn-close-white me-2 m-auto';
    button.setAttribute('data-bs-dismiss', 'toast');
    button.setAttribute('aria-label', 'Close');

    toastBody.appendChild(body);
    toastBody.appendChild(button);
    toast.appendChild(toastBody);

    container.appendChild(toast);

    // eslint-disable-next-line no-undef
    if (window.bootstrap && bootstrap.Toast) {
      const bsToast = new bootstrap.Toast(toast);
      bsToast.show();
      toast.addEventListener('hidden.bs.toast', () => toast.remove());
    } else {
      // fallback: remove after timeout
      setTimeout(() => toast.remove(), 3500);
    }
  }

  document.addEventListener('submit', async function (e) {
    const form = e.target;
    if (!form || !form.getAttribute) return;
    const action = form.getAttribute('action') || '';
    if (!(action === '/minecraft/whitelist/enable' || action === '/minecraft/whitelist/disable')) return; // only handle enable/disable whitelist forms

    e.preventDefault();

    const submitBtn = form.querySelector('button[type="submit"]');
    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.setAttribute('aria-busy', 'true');
    }

    try {
      const formData = new FormData(form);

      // Convert to application/x-www-form-urlencoded so express.urlencoded middleware parses req.body
      const urlEncoded = new URLSearchParams();
      for (const [k, v] of formData.entries()) {
        // URLSearchParams expects string values
        urlEncoded.append(k, String(v));
      }

      const resp = await fetch(action, {
        method: 'POST',
        body: urlEncoded,
        credentials: 'same-origin',
        headers: {
          'Accept': 'application/json',
          'X-Requested-With': 'XMLHttpRequest',
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      });

      if (!resp.ok) {
        let text = `Request failed: ${resp.status}`;
        try {
          const body = await resp.json();
          if (body && body.error) text = body.error;
        } catch (err) {
          // ignore
        }
        showToast(text, 'error');
        return;
      }

      // Try to parse JSON response
      const data = await resp.json().catch(() => null);
      const whitelisted = !!(data && (data.whitelist === true || data.whitelist === false ? data.whitelist : data.whitelisted === true));

      // Update UI based on returned state if available
      const row = form.closest('tr');
      if (row) {
        // update row class
        row.classList.remove('bg-success-subtle', 'bg-danger-subtle');
        if (whitelisted) row.classList.add('bg-success-subtle'); else row.classList.add('bg-danger-subtle');

        // update 4th column (status) - index 3
        const cells = row.querySelectorAll('td');
        if (cells && cells.length >= 4) {
          cells[3].textContent = whitelisted ? '✅' : '❌';
        }

        // update the form's action & button style/content
        if (submitBtn) {
          if (whitelisted) {
            form.setAttribute('action', '/minecraft/whitelist/disable');
            submitBtn.classList.remove('text-success');
            submitBtn.classList.add('text-danger');
            submitBtn.title = 'Remove Whitelisted User';
            submitBtn.innerHTML = '<i class="fas fa-trash"></i>';
          } else {
            form.setAttribute('action', '/minecraft/whitelist/enable');
            submitBtn.classList.remove('text-danger');
            submitBtn.classList.add('text-success');
            submitBtn.title = 'Add Whitelisted User';
            submitBtn.innerHTML = '<i class="fas fa-plus"></i>';
          }
        }
      }

      showToast(data && data.message ? data.message : (whitelisted ? 'User whitelisted' : 'User removed from whitelist'), 'success');
    } catch (err) {
      console.error('Error submitting whitelist action', err);
      showToast('Error performing action', 'error');
    } finally {
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.removeAttribute('aria-busy');
      }
    }
  });
})();

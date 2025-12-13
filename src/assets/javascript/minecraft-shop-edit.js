(function () {
  const form = document.getElementById('minecraft-shop-item-form');
  const nbtField = document.getElementById('nbt');
  const validateBtn = document.getElementById('validate-nbt');
  const prettifyBtn = document.getElementById('prettify-nbt');

  function showError(msg) {
    if (window.toastr) {
      toastr.error(msg);
    } else {
      alert(msg);
    }
  }

  function showSuccess(msg) {
    if (window.toastr) {
      toastr.success(msg);
    }
  }

  function parseNbt() {
    const text = (nbtField && nbtField.value) || '';
    if (!text || !text.trim()) return null;
    try {
      const parsed = JSON.parse(text);
      return parsed;
    } catch (e) {
      return { error: e };
    }
  }

  if (validateBtn) {
    validateBtn.addEventListener('click', function (ev) {
      ev.preventDefault();
      const r = parseNbt();
      if (r === null) {
        showSuccess('No NBT provided (treated as empty)');
        return;
      }
      if (r && r.error) {
        showError('NBT JSON is invalid: ' + r.error.message);
      } else {
        showSuccess('NBT JSON is valid');
      }
    });
  }

  if (prettifyBtn) {
    prettifyBtn.addEventListener('click', function (ev) {
      ev.preventDefault();
      const r = parseNbt();
      if (r === null) return showError('No NBT to prettify');
      if (r && r.error) return showError('NBT JSON is invalid: ' + r.error.message);
      nbtField.value = JSON.stringify(r, null, 2);
      showSuccess('NBT prettified');
    });
  }

  if (form) {
    form.addEventListener('submit', function (ev) {
      // validate NBT before submit
      const r = parseNbt();
      if (r && r.error) {
        ev.preventDefault();
        showError('NBT must be valid JSON before submitting: ' + r.error.message);
        return false;
      }
      // ensure numeric fields are present and valid - browser will usually enforce type
      return true;
    });
  }
})();

class JsonEditor {
  static initialize() {
    // Initialize and ensure only preview is visible by default
    document.querySelectorAll('[data-setting-type="json"]').forEach(container => {
      const edit = container.querySelector('[data-view="edit"]');
      const preview = container.querySelector('[data-view="preview"]');

      // Hide edit by default if both are present
      if (edit) {
        edit.classList.add('d-none');
      }
      if (preview) {
        preview.classList.remove('d-none');
      }

      // Wire up click handler for the .btn-edit inside this container
      const editBtn = container.querySelector('.btn-edit');
      if (!editBtn) return;

      // Set accessible state
      editBtn.setAttribute('aria-pressed', 'false');
      // Ensure initial icon shows 'pencil' when not editing
      JsonEditor._setIcon(editBtn, 'pencil');

      editBtn.addEventListener('click', (e) => {
        e.preventDefault();
        // Toggle mode: if currently in edit mode, turn off
        const isEditing = container.classList.contains('json-editing');

        if (isEditing) {
          // Switch to preview
          container.classList.remove('json-editing');
          if (edit) edit.classList.add('d-none');
          if (preview) preview.classList.remove('d-none');
          editBtn.setAttribute('aria-pressed', 'false');
          JsonEditor._setIcon(editBtn, 'pencil');
        } else {
          // Switch to edit
          container.classList.add('json-editing');
          if (edit) edit.classList.remove('d-none');
          if (preview) preview.classList.add('d-none');
          editBtn.setAttribute('aria-pressed', 'true');
          JsonEditor._setIcon(editBtn, 'code');
        }
      });
    });
  }

  static _setIcon(button, iconName) {
    // iconName: 'code' or 'pencil'
    const icon = button.querySelector('i');
    if (!icon) return;
    if (iconName === 'code') {
      icon.classList.remove('fa-pencil');
      icon.classList.add('fa-code');
    } else {
      icon.classList.remove('fa-code');
      icon.classList.add('fa-pencil');
    }
  }
}

// Expose to global so on-ready can call it
window.JsonEditor = JsonEditor;

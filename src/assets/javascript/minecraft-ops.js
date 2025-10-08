// minecraft-ops.js
// Dynamic operator removal: modal population (A), submission handling with fetch & DELETE (B),
// optimistic UI update (C), and accessibility focus management (D).
(function() {
  let lastTriggerButton = null;

  function qs(id) { return document.getElementById(id); }

  function setText(id, value) {
    const el = qs(id);
    if (el) el.textContent = value ?? '';
  }

  function showAlert(message) {
    const alert = qs('remove-op-alert');
    if (!alert) return;
    alert.textContent = message;
    alert.classList.remove('d-none');
  }

  function clearAlert() {
    const alert = qs('remove-op-alert');
    if (!alert) return;
    alert.textContent = '';
    alert.classList.add('d-none');
  }

  function findRow(guildId, userId) {
    return document.querySelector(`tr[data-op-row][data-guild-id="${CSS.escape(guildId)}"][data-user-id="${CSS.escape(userId)}"]`);
  }

  function decorateRemovingButton(btn) {
    if (!btn) return;
    btn.disabled = true;
    btn.dataset.originalContent = btn.innerHTML;
    btn.innerHTML = '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>';
  }

  function restoreRemovingButton(btn) {
    if (!btn) return;
    btn.disabled = false;
    if (btn.dataset.originalContent) {
      btn.innerHTML = btn.dataset.originalContent;
      delete btn.dataset.originalContent;
    }
  }

  function onModalShow(e) {
    const trigger = e.relatedTarget;
    lastTriggerButton = trigger;
    clearAlert();
    if (!trigger) return;

    const guildId = trigger.getAttribute('data-guild-id') || '';
    const userId = trigger.getAttribute('data-user-id') || '';
    const uuid = trigger.getAttribute('data-uuid') || '';
    const username = trigger.getAttribute('data-username') || '';

    // Modal partial form wrapper: locate form in modal footer (modal-content form)
    const modalEl = qs('remove-op-modal');
    const form = modalEl ? modalEl.querySelector('form') : null;
    if (!form) return;

    // Update form action (will be submitted via JS anyway)
    form.setAttribute('action', `/minecraft/ops/remove/${guildId}/${userId}`);

    // Hidden fields
    const g = qs('remove-op-guildId'); if (g) g.value = guildId;
    const u = qs('remove-op-userId'); if (u) u.value = userId;
    const m = qs('remove-op-uuid'); if (m) m.value = uuid;

    // Display spans
    setText('remove-op-guild-display', guildId || 'Unknown');
    setText('remove-op-user-display', userId || 'Unknown');
    setText('remove-op-mc-display', username ? `${username} (${uuid || 'no uuid'})` : (uuid || 'Unknown'));

    // Focus the primary button after shown for accessibility
    modalEl.addEventListener('shown.bs.modal', () => {
      const submitBtn = modalEl.querySelector('.modal-footer button.btn-danger');
      if (submitBtn) submitBtn.focus();
    }, { once: true });
  }

  async function submitRemoval(form) {
    const guildId = qs('remove-op-guildId')?.value || '';
    const userId = qs('remove-op-userId')?.value || '';
    if (!guildId || !userId) {
      showAlert('Missing guild or user id.');
      return false;
    }

    const submitBtn = form.querySelector('button[type="submit"], .modal-footer button.btn-danger');
    decorateRemovingButton(submitBtn);
    try {
      const response = await fetch(`/minecraft/ops/remove/${encodeURIComponent(guildId)}/${encodeURIComponent(userId)}`, {
        method: 'DELETE',
        headers: {
          'Accept': 'application/json',
          'X-Requested-With': 'XMLHttpRequest'
        }
      });

      if (!response.ok) {
        const text = await response.text();
        throw new Error(text || `Server responded ${response.status}`);
      }

      // Optimistic remove row
      const row = findRow(guildId, userId);
      if (row) {
        row.classList.add('opacity-50');
        row.addEventListener('transitionend', () => row.remove(), { once: true });
        // fallback if no transition
        setTimeout(() => { if (row && row.parentElement) row.remove(); }, 300);
        row.style.transition = 'opacity .25s ease';
        row.style.opacity = '0';
      }

      // Close modal programmatically
      const modalEl = qs('remove-op-modal');
      if (modalEl) {
        const bsModal = bootstrap.Modal.getInstance(modalEl) || new bootstrap.Modal(modalEl);
        bsModal.hide();
      }

      // Restore focus to triggering element (or table)
      if (lastTriggerButton) {
        setTimeout(() => { try { lastTriggerButton.focus(); } catch(_) {} }, 150);
      }

      return true;
    } catch (err) {
      console.error('Failed to remove operator', err);
      showAlert(err.message || 'Failed to remove operator');
      return false;
    } finally {
      restoreRemovingButton(form.querySelector('button[type="submit"], .modal-footer button.btn-danger'));
    }
  }

  function interceptSubmit() {
    const modalEl = qs('remove-op-modal');
    if (!modalEl) return;
    const form = modalEl.querySelector('form');
    const footerForm = modalEl.querySelector('.modal-footer form');
    // We rely on footer form rendered by modal partial
    const activeForm = footerForm || form;
    if (!activeForm || activeForm.dataset.boundSubmit) return;
    activeForm.dataset.boundSubmit = 'true';
    activeForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      await submitRemoval(activeForm);
    });
  }

  function hookModal() {
    const modalEl = qs('remove-op-modal');
    if (!modalEl) return;
    modalEl.addEventListener('show.bs.modal', onModalShow);
    modalEl.addEventListener('shown.bs.modal', interceptSubmit);
  }

  // Init
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', hookModal);
  } else {
    hookModal();
  }
})();

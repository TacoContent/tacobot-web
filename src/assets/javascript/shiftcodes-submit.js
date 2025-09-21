// Check/Uncheck all games checkboxes and toggle 'active' class on list items
window.addEventListener('DOMContentLoaded', function () {
  const checkAll = document.getElementById('check-all-games');
  const gameCheckboxes = document.querySelectorAll('input[name="games"]');
  const form = document.querySelector('form');
  const submitBtn = form ? form.querySelector('button[type="submit"]') : null;

  // Helper to update active class
  function updateActiveClass(cb) {
    const li = cb.closest('li.list-group-item');
    if (li) {
      if (cb.checked) {
        li.classList.add('active');
      } else {
        li.classList.remove('active');
      }
    }
  }

  // Helper to check if at least one game is selected
  function validateGamesSelected() {
    const checked = Array.from(gameCheckboxes).some(cb => cb.checked);
    if (submitBtn) {
      submitBtn.disabled = !checked;
    }
    return checked;
  }

  // Initial state
  gameCheckboxes.forEach(cb => {
    updateActiveClass(cb);
    cb.addEventListener('change', function () {
      updateActiveClass(cb);
      validateGamesSelected();
    });
  });
  validateGamesSelected();

  if (checkAll) {
    checkAll.addEventListener('change', function () {
      gameCheckboxes.forEach(cb => {
        cb.checked = checkAll.checked;
        updateActiveClass(cb);
      });
      validateGamesSelected();
    });
  }

  if (form) {
    form.addEventListener('submit', function (e) {
      let valid = true;
      let messages = [];
      if (!validateGamesSelected()) {
        valid = false;
        messages.push('Please select at least one game.');
      }
      // Reward validation
      const rewardInput = form.querySelector('input[name="reward"]');
      if (!rewardInput || !rewardInput.value.trim()) {
        valid = false;
        messages.push('Reward is required.');
      }
      // SHiFT Code validation
      const codeInput = form.querySelector('input[name="code"]');
      const codePattern = /^(?:[A-Z0-9-]{5}){4}[A-Z0-9]{5}$/;
      if (!codeInput || !codeInput.value.trim()) {
        valid = false;
        messages.push('SHiFT Code is required.');
      } else if (!codePattern.test(codeInput.value.trim())) {
        valid = false;
        messages.push('SHiFT Code format is invalid.');
      }
      if (!valid) {
        e.preventDefault();
        alert(messages.join('\n'));
      }
    });
  }
});

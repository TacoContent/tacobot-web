/*
  Dropdown control script
  Enhances the Handlebars partial created in views/partials/controls/Dropdown.hbs

  Features:
    - Freeform filtering (client-side) over provided <li class="dropdown-item" data-value>
    - Multiple or single selection modes
    - Token chips with remove (x) buttons
    - Backing <select> kept in sync (for regular form serialization)
    - Keyboard navigation: ArrowDown/ArrowUp to move, Enter to select, Backspace to remove last token
    - Click outside to close
    - Disabled item support (add .disabled)
    - Clear-all button (appears after first selection)
    - Custom events: dropdown:filter, dropdown:selectionchange, dropdown:open, dropdown:close
    - Public API: root.dropdownControl.{setLoading,addItems,clearItems,getValues,selectValue,deselectValue}
    - ARIA attributes maintained for accessibility
  - Debounced async fetching with cancellation via dropdownControl.configureAsync(...)
*/
(function () {
  function initDropdown(root) {
    if (root.__dropdownInitialized) return;
    root.__dropdownInitialized = true;

    const input = root.querySelector('[data-role="input"]');
    const menu = root.querySelector('[data-role="menu"]');
    const tokensContainer = root.querySelector('[data-role="tokens"]');
    const backingSelect = root.querySelector('[data-role="backing-select"]');
    const multiple = root.getAttribute('data-multiple') === 'true';
    const searchable = root.getAttribute('data-searchable') !== 'false';
    const closeOnSelect = root.getAttribute('data-close-on-select') === 'true';
    const maxSelected = parseInt(root.getAttribute('data-max-selected') || '-1', 10);
    const sortMode = (root.getAttribute('data-sort') || 'none').toLowerCase();
    const sortOrder = (root.getAttribute('data-sort-order') || 'asc').toLowerCase();
    const minFilterChars = parseInt(root.getAttribute('data-min-filter-chars') || '2', 10);
    const toggleBtn = root.querySelector('[data-role="toggle"]');
    const controlShell = root.querySelector('[data-role="control-shell"]');
    const clearBtn = root.querySelector('[data-role="clear"]');
    const loadingIndicator = root.querySelector('[data-role="loading"]');
    const nonSearchNoInput = !searchable && !input;

    function updateAddonEdgeClasses() {
      root.classList.remove('dropdown-preceded-addon', 'dropdown-followed-addon');
      const parent = root.parentElement;
      if (!parent || !parent.classList.contains('input-group')) return;
      const prev = root.previousElementSibling;
      if (prev && (prev.classList.contains('btn') || prev.classList.contains('btn-group') || prev.classList.contains('input-group-text') || prev.tagName === 'BUTTON')) {
        root.classList.add('dropdown-preceded-addon');
      }
      const next = root.nextElementSibling;
      if (next && (next.classList.contains('btn') || next.classList.contains('btn-group') || next.classList.contains('input-group-text') || next.tagName === 'BUTTON')) {
        root.classList.add('dropdown-followed-addon');
      }
    }
    const actionsContainer = root.querySelector('[data-role="actions"]');

    // If the dropdown-control lives inside a Bootstrap .input-group, move the action buttons (clear + toggle)
    // out so they become direct children of the input-group. This allows native input-group styling/merging.
    (function moveActionsOutsideIfInputGroup() {
      const parent = root.parentElement;
      if (!parent || !parent.classList.contains('input-group')) return;
      const buttonsToMove = [];
      if (clearBtn) buttonsToMove.push(clearBtn);
      if (toggleBtn) buttonsToMove.push(toggleBtn);
      if (!buttonsToMove.length) return;
      // Append buttons in order after the dropdown-control wrapper
      let insertAfter = root; // keep inserting after last appended
      buttonsToMove.forEach(btn => {
        parent.insertBefore(btn, insertAfter.nextSibling);
        insertAfter = btn;
      });
      if (actionsContainer) actionsContainer.remove();
      root.classList.add('dropdown-actions-external');
      // After moving buttons, recalc addon edge classes
      updateAddonEdgeClasses();
    })();

    // Initial edge class assignment (in case there were pre-existing addons before moving)
    updateAddonEdgeClasses();

    let items = Array.from(menu.querySelectorAll('.dropdown-item[data-value]'));
    const itemMap = new Map(items.map(li => [li.getAttribute('data-value'), li]));
    // Add a reusable no-results element (initially hidden) – always keep at top
    let noResultsEl = menu.querySelector('[data-role="no-results"]');
    const customNoResults = root.getAttribute('data-no-results-text');
    if (!noResultsEl) {
      noResultsEl = document.createElement('li');
      noResultsEl.className = 'dropdown-no-results text-muted px-3 py-2 d-none fst-italic fw-semibold';
      noResultsEl.dataset.role = 'no-results';
      noResultsEl.textContent = customNoResults || 'No matches';
    } else {
      // Ensure classes and text are updated if element already existed
      noResultsEl.classList.add('fst-italic', 'fw-semibold');
      if (customNoResults) noResultsEl.textContent = customNoResults;
    }
    // Ensure it is the first element in the menu (above any items)
    if (menu.firstChild !== noResultsEl) {
      menu.insertBefore(noResultsEl, menu.firstChild);
    }

    let asyncConfig = null;
    let debounceTimer = null;
    let activeFetchController = null;
    let lastQueriedValue = '';
    let loadingRowEl = null;
    let errorRowEl = null;
    let isAsyncLoading = false;
    let pendingAsync = false;
    let pendingRowEl = null;

    const preValuesAttr = root.getAttribute('data-values');
    let preValues = [];
    if (preValuesAttr) {
      try { preValues = JSON.parse(preValuesAttr); } catch (_) { }
    } else if (backingSelect) {
      preValues = Array.from(backingSelect.selectedOptions).map(o => o.value);
    }
    // Flag to suppress side-effects (like auto-opening menu) while applying initial pre-selections
    let initializingPreselect = true;

    function removePlaceholder() {
      const ph = tokensContainer.querySelector('[data-role="placeholder"]');
      if (ph) ph.remove();
    }

    function restorePlaceholderIfEmpty() {
      if (!nonSearchNoInput) return;
      if (tokensContainer.querySelector('[data-value]')) return;
      // Avoid creating a duplicate placeholder if one is already present
      if (tokensContainer.querySelector('[data-role="placeholder"]')) return;
      const text = root.getAttribute('data-placeholder');
      if (!text) return;
      const span = document.createElement('span');
      span.className = 'dropdown-placeholder text-muted';
      span.dataset.role = 'placeholder';
      span.textContent = text;
      tokensContainer.appendChild(span);
    }

    function createToken(value, displayHtml) {
      const token = document.createElement('span');
      token.className = 'badge text-bg-primary d-inline-flex align-items-center gap-1' + (!multiple ? ' flex-grow-1 justify-content-start' : '');
      token.dataset.value = value;
      const removeBtnHtml = '<button type="button" class="btn-close btn-close-white btn-sm ms-1 flex-shrink-0" aria-label="' + (multiple ? 'Remove' : 'Clear selection') + '" data-role="remove"></button>';
      // Wrap original item HTML so we can flex-grow it and push the remove button to the end
      token.innerHTML = '<span class="token-label d-inline-flex align-items-center gap-1 flex-grow-1">' + displayHtml + '</span>' + removeBtnHtml;
      removePlaceholder();
      tokensContainer.appendChild(token);
    }

    function syncBackingSelect() {
      if (!backingSelect) return;
      const selectedValues = Array.from(tokensContainer.querySelectorAll('[data-value]')).map(t => t.dataset.value);
      backingSelect.innerHTML = '';
      selectedValues.forEach(v => {
        const opt = document.createElement('option');
        opt.value = v;
        opt.selected = true;
        backingSelect.appendChild(opt);
      });
      updateClearButton();
      updateHasTokensClass();
      root.dispatchEvent(new CustomEvent('dropdown:selectionchange', { detail: { values: selectedValues } }));
    }

    function selectValue(value) {
      if (!itemMap.has(value)) return;
      const li = itemMap.get(value);
      if (li.classList.contains('disabled')) return;
      if (multiple && maxSelected > -1) {
        const currentCount = tokensContainer.querySelectorAll('[data-value]').length;
        if (currentCount >= maxSelected) {
          // Dispatch event to allow UI feedback/notifications
          root.dispatchEvent(new CustomEvent('dropdown:maxlimit', { detail: { max: maxSelected, attempted: value } }));
          // Brief visual feedback hook (class consumer can style)
          root.classList.add('dropdown-max-reached');
          setTimeout(() => root.classList.remove('dropdown-max-reached'), 600);
          return;
        }
      }
      if (!multiple) {
        tokensContainer.innerHTML = '';
        menu.querySelectorAll('.dropdown-item.active').forEach(a => a.classList.remove('active'));
      } else if (tokensContainer.querySelector('[data-value="' + CSS.escape(value) + '"]')) {
        return;
      }
      createToken(value, li.innerHTML.trim());
      li.classList.add('active');
      syncBackingSelect();
      if (input) {
        input.value = '';
        filterItems('');
      }
      if (!multiple || (multiple && closeOnSelect)) {
        hideMenu();
      } else if (!initializingPreselect) {
        // Keep menu open so user can select additional items (only after init)
        if (input) {
          showMenu();
          input.focus();
        } else if (nonSearchNoInput) {
          showMenu();
        }
      }
    }

    function deselectValue(value) {
      const token = tokensContainer.querySelector('[data-value="' + CSS.escape(value) + '"]');
      if (token) token.remove();
      const li = itemMap.get(value);
      if (li) li.classList.remove('active');
      syncBackingSelect();
      restorePlaceholderIfEmpty();
    }

    function updateHasTokensClass() {
      const hasTokens = !!tokensContainer.querySelector('[data-value]');
      root.classList.toggle('dropdown-has-tokens', hasTokens);
      if (searchable) {
        root.classList.toggle('dropdown-searchable-empty', !hasTokens);
      }
    }

    function filterItems(query) {
      const q = query.toLowerCase();
      let anyVisible = false;
      const belowThreshold = q.length > 0 && q.length < minFilterChars;
      items.forEach(li => {
        // No query OR below threshold: show everything, no highlighting
        if (q.length === 0 || belowThreshold) {
          li.classList.remove('d-none');
          if (li.__originalHtml) li.innerHTML = li.__originalHtml;
          anyVisible = true;
          return;
        }
        const label = (li.textContent || '').toLowerCase();
        const match = label.includes(q);
        if (match) {
          li.classList.remove('d-none');
          anyVisible = true;
          // Highlight only at/after threshold (we're past threshold here by logic)
          if (!li.__originalHtml) li.__originalHtml = li.innerHTML;
          // Restore pristine HTML first (in case of prior highlight pass)
          if (li.__originalHtml) li.innerHTML = li.__originalHtml;
          // Perform safe text-node highlighting (avoid altering attribute content like data:image URIs)
          const needle = q;
          if (needle) {
            const walker = document.createTreeWalker(li, NodeFilter.SHOW_TEXT, {
              acceptNode(node) {
                if (!node.nodeValue || !node.nodeValue.toLowerCase().includes(needle)) return NodeFilter.FILTER_REJECT;
                // Skip text nodes that are inside <script> or <style> (not expected but defensive)
                const parentName = node.parentNode && node.parentNode.nodeName.toLowerCase();
                if (parentName === 'script' || parentName === 'style') return NodeFilter.FILTER_REJECT;
                return NodeFilter.FILTER_ACCEPT;
              }
            });
            const toProcess = [];
            while (walker.nextNode()) toProcess.push(walker.currentNode);
            toProcess.forEach(textNode => {
              const frag = document.createDocumentFragment();
              let remaining = textNode.nodeValue;
              let idx;
              const lowerRemaining = () => remaining.toLowerCase();
              while ((idx = lowerRemaining().indexOf(needle)) !== -1) {
                if (idx > 0) frag.appendChild(document.createTextNode(remaining.slice(0, idx)));
                const mark = document.createElement('mark');
                mark.textContent = remaining.slice(idx, idx + needle.length);
                frag.appendChild(mark);
                remaining = remaining.slice(idx + needle.length);
              }
              if (remaining) frag.appendChild(document.createTextNode(remaining));
              textNode.parentNode.replaceChild(frag, textNode);
            });
          }
        } else {
          li.classList.add('d-none');
          if (li.__originalHtml) li.innerHTML = li.__originalHtml; // ensure no stale mark
        }
      });
      const showNoResults = !isAsyncLoading && !pendingAsync && q.length >= minFilterChars && !anyVisible;
      noResultsEl.classList.toggle('d-none', !showNoResults);
      root.dispatchEvent(new CustomEvent('dropdown:filter', { detail: { query, thresholdMet: !belowThreshold && q.length >= minFilterChars } }));
    }

    function extractLabel(li) {
      return (li.textContent || '').trim().toLowerCase();
    }

    function sortItemsIfNeeded() {
      if (sortMode !== 'label') return;
      items.sort((a, b) => {
        const la = extractLabel(a);
        const lb = extractLabel(b);
        const cmp = la.localeCompare(lb, undefined, { sensitivity: 'base' });
        return sortOrder === 'desc' ? -cmp : cmp;
      });
      items.forEach(li => menu.appendChild(li));
    }

    function showMenu(force = false) {
      if (!force) {
        const hasItems = items.length > 0;
        const pendingVisible = pendingAsync && asyncConfig && asyncConfig.showPendingRow;
        const loadingVisible = isAsyncLoading && asyncConfig && (asyncConfig.showLoadingRow || asyncConfig.showLoading);
        const noResultsVisible = !noResultsEl.classList.contains('d-none');
        if (!hasItems && !pendingVisible && !loadingVisible && !noResultsVisible) return; // nothing meaningful to show yet
      }
      if (!menu.classList.contains('show')) {
        menu.classList.add('show');
        root.classList.add('dropdown-open');
        root.setAttribute('aria-expanded', 'true');
        if (toggleBtn) toggleBtn.setAttribute('aria-expanded', 'true');
        root.dispatchEvent(new CustomEvent('dropdown:open'));
      }
      positionMenu();
    }

    function hideMenu() {
      menu.classList.remove('show');
      root.classList.remove('dropdown-open');
      root.setAttribute('aria-expanded', 'false');
      if (toggleBtn) toggleBtn.setAttribute('aria-expanded', 'false');
      root.dispatchEvent(new CustomEvent('dropdown:close'));
    }

    function positionMenu() {
      // Ensure menu width matches the visible control shell width without exceeding wrapper
      const wrapperRect = root.getBoundingClientRect();
      const shell = controlShell || root;
      const shellRect = shell.getBoundingClientRect();
      const width = Math.min(shellRect.width, wrapperRect.width);
      menu.style.width = width + 'px';
      // Use absolute positioning relative to wrapper (wrapper made position-relative in template)
      menu.style.position = 'absolute';
      menu.style.top = shell.offsetTop + shell.offsetHeight + 'px';
      menu.style.left = shell.offsetLeft + 'px';
      // Prevent runaway horizontal overflow
      menu.style.maxWidth = '100%';
    }

    // Placeholder capture
    if (nonSearchNoInput) {
      const placeholderEl = tokensContainer.querySelector('[data-role="placeholder"]');
      if (placeholderEl) {
        root.setAttribute('data-placeholder', placeholderEl.textContent || '');
      }
    }

    sortItemsIfNeeded();
    preValues.forEach(v => selectValue(v));
    initializingPreselect = false;
    // Ensure menu is closed after applying pre-selections
    hideMenu();
    // Apply initial token state classing
    updateHasTokensClass();
    restorePlaceholderIfEmpty();

    // Input related listeners
    if (input) {
      input.addEventListener('focus', () => {
        showMenu();
        if (!searchable) filterItems('');
      });
      // If input already has focus, clicking it again should still open (or keep) the menu.
      input.addEventListener('click', () => {
        if (!menu.classList.contains('show')) {
          showMenu();
          if (!searchable) filterItems('');
        }
      });
      if (searchable) {
        input.addEventListener('input', () => {
          handleAsyncInput(input.value);
          filterItems(input.value);
          showMenu(true); // force to allow pending/loading rows
        });
      } else {
        ['keydown', 'keypress', 'input'].forEach(ev => {
          input.addEventListener(ev, (e) => {
            if (e.key && e.key.length === 1) e.preventDefault();
          });
        });
        input.setAttribute('aria-autocomplete', 'none');
      }
    }

    function handleKeydown(e) {
      const visibleItems = items.filter(li => li.style.display !== 'none');
      const activeIndex = visibleItems.findIndex(li => li.classList.contains('keyboard-active'));
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        showMenu();
        setKeyboardActive(visibleItems, (activeIndex + 1) % (visibleItems.length || 1));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        showMenu();
        let prev = activeIndex - 1;
        if (prev < 0) prev = visibleItems.length - 1;
        setKeyboardActive(visibleItems, prev);
      } else if (e.key === 'Enter') {
        if (activeIndex >= 0) {
          e.preventDefault();
          const val = visibleItems[activeIndex].getAttribute('data-value');
          selectValue(val);
        } else if (!menu.classList.contains('show')) {
          e.preventDefault();
          showMenu();
        }
      } else if (e.key === 'Escape') {
        hideMenu();
        if (input) input.blur();
      } else if (e.key === 'Backspace') {
        const emptyQuery = !input || !searchable || input.value === '';
        if (emptyQuery && tokensContainer.lastElementChild) {
          const lastVal = tokensContainer.lastElementChild.getAttribute('data-value');
          deselectValue(lastVal);
        }
      }
    }
    if (input) input.addEventListener('keydown', handleKeydown);
    if (nonSearchNoInput && controlShell) controlShell.addEventListener('keydown', handleKeydown);

    function setKeyboardActive(list, index) {
      list.forEach(li => li.classList.remove('keyboard-active'));
      if (!list.length) return;
      if (index < 0 || index >= list.length) return;
      list[index].classList.add('keyboard-active');
      if (input) input.setAttribute('aria-activedescendant', list[index].id || '');
      list[index].scrollIntoView({ block: 'nearest' });
    }

    menu.addEventListener('mousedown', (e) => {
      const li = e.target.closest('.dropdown-item[data-value]');
      if (!li) return;
      e.preventDefault();
      const value = li.getAttribute('data-value');
      if (li.classList.contains('active')) {
        deselectValue(value);
      } else {
        selectValue(value);
      }
    });

    tokensContainer.addEventListener('click', (e) => {
      const btn = e.target.closest('[data-role="remove"]');
      if (!btn) return;
      const token = btn.closest('[data-value]');
      if (!token) return;
      deselectValue(token.getAttribute('data-value'));
    });

    document.addEventListener('click', (e) => {
      if (!root.contains(e.target)) hideMenu();
    });
    window.addEventListener('resize', positionMenu);

    if (toggleBtn) {
      toggleBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        if (menu.classList.contains('show')) hideMenu(); else {
          showMenu();
          if (!searchable) filterItems('');
        }
      });
    }
    if (nonSearchNoInput && controlShell) {
      controlShell.addEventListener('click', (e) => {
        if (e.target.closest('[data-role="remove"]') || e.target.closest('[data-role="toggle"]')) return;
        if (!menu.classList.contains('show')) {
          showMenu();
          filterItems('');
        }
      });
    }
    // For searchable dropdowns: clicking anywhere in the control shell (outside of buttons) should open the menu.
    if (controlShell) {
      controlShell.addEventListener('click', (e) => {
        // Ignore clicks explicitly on toggle, clear-all, or token remove buttons (they have their own behaviors)
        if (e.target.closest('[data-role="toggle"]') || e.target.closest('[data-role="clear"]') || e.target.closest('[data-role="remove"]')) return;
        // If already open do nothing beyond focusing input
        if (!menu.classList.contains('show')) {
          showMenu();
          if (!searchable) filterItems('');
        }
        if (input) input.focus();
      });
    }

    function updateClearButton() {
      if (!clearBtn) return;
      // Only for multi-select
      if (!multiple) { clearBtn.classList.add('d-none'); return; }
      const hasSelection = !!tokensContainer.querySelector('[data-value]');
      clearBtn.classList.toggle('d-none', !hasSelection);
    }
    if (clearBtn && multiple) {
      clearBtn.addEventListener('click', () => {
        tokensContainer.querySelectorAll('[data-value]').forEach(t => {
          const val = t.getAttribute('data-value');
          const li = itemMap.get(val);
          if (li) li.classList.remove('active');
          t.remove();
        });
        syncBackingSelect();
        restorePlaceholderIfEmpty();
      });
    }

    root.dropdownControl = {
      setLoading(isLoading) {
        if (!loadingIndicator) return;
        loadingIndicator.classList.toggle('d-none', !isLoading);
      },
      setCloseOnSelect(flag) {
        root.setAttribute('data-close-on-select', flag ? 'true' : 'false');
      },
      setMaxSelected(n) {
        const val = parseInt(n, 10);
        root.setAttribute('data-max-selected', isNaN(val) ? '-1' : String(val));
      },
      getMaxSelected() {
        const v = parseInt(root.getAttribute('data-max-selected') || '-1', 10);
        return isNaN(v) ? -1 : v;
      },
      resort() { sortItemsIfNeeded(); },
      addItems(html) {
        const temp = document.createElement('div');
        temp.innerHTML = '<ul>' + html + '</ul>';
        const newLis = Array.from(temp.querySelectorAll('li.dropdown-item[data-value]'));
        newLis.forEach(li => {
          menu.appendChild(li);
          items.push(li);
          itemMap.set(li.getAttribute('data-value'), li);
        });
        sortItemsIfNeeded();
        filterItems(input ? input.value : '');
      },
      clearItems() {
        items.forEach(li => li.remove());
        items = [];
        itemMap.clear();
      },
      getValues() {
        return Array.from(tokensContainer.querySelectorAll('[data-value]')).map(t => t.getAttribute('data-value'));
      },
      selectValue,
      deselectValue,
      configureAsync(options) {
        const attrDebounce = parseInt(root.getAttribute('data-async-debounce') || '', 10);
        asyncConfig = Object.assign({
          debounceMs: isNaN(attrDebounce) ? 300 : attrDebounce,
          minChars: 2,
          clearOnQuery: true,
          showLoading: true,
          showLoadingRow: false,
          showPendingRow: true,
          errorRow: true,
          errorRetryText: 'Retry',
          pendingText: 'Searching...',
          initialFetchOnMount: false,
          initialQuery: '',
          preserveStatic: true,
          errorFadeMs: 0 // 0 = stay until next attempt
        }, options || {});
        if (asyncConfig.initialFetchOnMount) {
          lastQueriedValue = asyncConfig.initialQuery;
          runAsyncFetch(asyncConfig.initialQuery, true);
        }
      },
      refreshAsync() {
        if (!asyncConfig) return;
        runAsyncFetch(lastQueriedValue || asyncConfig.initialQuery || '', true);
      }
    };

    function handleAsyncInput(query) {
      if (!asyncConfig || !searchable) return;
      lastQueriedValue = query;
      if (query.length < asyncConfig.minChars) {
        abortActiveFetch();
        if (asyncConfig.clearOnQuery) removeDynamicItems();
        if (asyncConfig.showLoading) root.dropdownControl.setLoading(false);
        pendingAsync = false;
        hidePendingRow();
        return;
      }
      // Mark pending while debounce timer counts down
      pendingAsync = true;
      if (asyncConfig.showLoading) root.dropdownControl.setLoading(true);
      if (asyncConfig.showPendingRow) showPendingRow();
      if (debounceTimer) clearTimeout(debounceTimer);
      debounceTimer = setTimeout(() => runAsyncFetch(query), asyncConfig.debounceMs);
    }

    function runAsyncFetch(query, force = false) {
      abortActiveFetch();
      clearErrorRow();
      let controller = null;
      if (typeof AbortController !== 'undefined') controller = new AbortController();
      activeFetchController = controller;
      isAsyncLoading = true;
      pendingAsync = false; // transition from pending to active
      showMenu(true); // ensure menu visible for loading state
      hidePendingRow();
      if (asyncConfig.showLoading) root.dropdownControl.setLoading(true);
      if (asyncConfig.showLoadingRow) showLoadingRow();
      root.dispatchEvent(new CustomEvent('dropdown:asyncstart', { detail: { query } }));
      Promise.resolve().then(() => asyncConfig.fetcher(query, controller ? controller.signal : undefined))
        .then(result => {
          if (controller && controller.signal.aborted) return;
          if (query !== lastQueriedValue && !force) return;
          if (asyncConfig.clearOnQuery) removeDynamicItems(asyncConfig.preserveStatic);
          addDynamicResult(result);
        })
        .catch(err => {
          if (err && err.name === 'AbortError') return;
          console.error('Dropdown async fetch error', err);
          if (asyncConfig && asyncConfig.errorRow) showErrorRow(err);
          root.dispatchEvent(new CustomEvent('dropdown:asyncerror', { detail: { query, error: err } }));
        })
        .finally(() => {
          if (controller && controller.signal.aborted) return;
          if (asyncConfig.showLoading) root.dropdownControl.setLoading(false);
          if (asyncConfig.showLoadingRow) hideLoadingRow();
          isAsyncLoading = false;
          // Re-run filter to decide if "No matches" should display now that loading is complete
          if (input) filterItems(input.value); else filterItems('');
          root.dispatchEvent(new CustomEvent('dropdown:asyncend', { detail: { query } }));
        });
    }

    function abortActiveFetch() {
      if (activeFetchController && !activeFetchController.signal.aborted) activeFetchController.abort();
      activeFetchController = null;
      pendingAsync = false;
      isAsyncLoading = false;
      hidePendingRow();
    }

    function removeDynamicItems(preserveStatic = true) {
      const dynamic = menu.querySelectorAll('[data-dynamic="true"]');
      dynamic.forEach(li => {
        const val = li.getAttribute('data-value');
        if (val) itemMap.delete(val);
        li.remove();
      });
      if (!preserveStatic) {
        items.forEach(li => { if (!li.getAttribute('data-dynamic')) li.remove(); });
        items = [];
        itemMap.clear();
      } else {
        items = items.filter(li => li.getAttribute('data-dynamic') !== 'true');
      }
    }

    function addDynamicResult(result) {
      if (result == null) return;
      let html = '';
      if (typeof result === 'string') html = result; else if (Array.isArray(result)) {
        if (result.every(r => typeof r === 'string')) {
          html = result.map(v => `<li class="dropdown-item" data-dynamic="true" data-value="${escapeHtml(v)}">${escapeHtml(v)}</li>`).join('');
        } else {
          html = result.map(obj => {
            if (typeof obj === 'string') return `<li class="dropdown-item" data-dynamic="true" data-value="${escapeHtml(obj)}">${escapeHtml(obj)}</li>`;
            const value = obj.value != null ? String(obj.value) : '';
            const content = obj.html != null ? obj.html : escapeHtml(value);
            return `<li class="dropdown-item" data-dynamic="true" data-value="${escapeHtml(value)}">${content}</li>`;
          }).join('');
        }
      }
      if (!html) return;
      const temp = document.createElement('div');
      temp.innerHTML = `<ul>${html}</ul>`;
      const newLis = Array.from(temp.querySelectorAll('li.dropdown-item[data-value]'));
      newLis.forEach(li => {
        li.setAttribute('data-dynamic', 'true');
        menu.appendChild(li);
        items.push(li);
        itemMap.set(li.getAttribute('data-value'), li);
      });
      sortItemsIfNeeded();
      filterItems(input ? input.value : '');
    }

    function ensureLoadingRow() {
      if (loadingRowEl) return;
      loadingRowEl = document.createElement('li');
      loadingRowEl.dataset.role = 'loading-row';
      loadingRowEl.className = 'dropdown-loading px-3 py-2 text-muted d-none';
      loadingRowEl.innerHTML = '<div class="placeholder-glow d-flex flex-column gap-1" style="width:160px">\n  <span class="placeholder col-9"></span>\n  <span class="placeholder col-6"></span>\n</div>';
      // Insert after no-results element (kept at top)
      if (noResultsEl.nextSibling) menu.insertBefore(loadingRowEl, noResultsEl.nextSibling); else menu.appendChild(loadingRowEl);
    }

    function ensurePendingRow() {
      if (pendingRowEl) return;
      pendingRowEl = document.createElement('li');
      pendingRowEl.dataset.role = 'pending-row';
      pendingRowEl.className = 'dropdown-pending px-3 py-2 text-muted small d-none';
      pendingRowEl.textContent = (asyncConfig && asyncConfig.pendingText) || 'Searching...';
      if (noResultsEl.nextSibling) menu.insertBefore(pendingRowEl, noResultsEl.nextSibling); else menu.appendChild(pendingRowEl);
    }

    function showPendingRow() {
      ensurePendingRow();
      if (asyncConfig && asyncConfig.pendingText && pendingRowEl.textContent !== asyncConfig.pendingText) {
        pendingRowEl.textContent = asyncConfig.pendingText;
      }
      pendingRowEl.classList.remove('d-none');
      noResultsEl.classList.add('d-none');
    }

    function hidePendingRow() {
      if (!pendingRowEl) return;
      pendingRowEl.classList.add('d-none');
    }

    function showLoadingRow() {
      ensureLoadingRow();
      loadingRowEl.classList.remove('d-none');
      noResultsEl.classList.add('d-none');
    }

    function hideLoadingRow() {
      if (!loadingRowEl) return;
      loadingRowEl.classList.add('d-none');
    }

    function clearErrorRow() {
      if (!errorRowEl) return;
      errorRowEl.remove();
      errorRowEl = null;
    }

    function showErrorRow(err) {
      clearErrorRow();
      errorRowEl = document.createElement('li');
      errorRowEl.dataset.role = 'error-row';
      errorRowEl.className = 'dropdown-error text-danger px-3 py-2 d-flex align-items-center gap-2';
      const msg = (err && (err.message || err.statusText)) || 'Load failed';
      errorRowEl.innerHTML = `<span class="small">${escapeHtml(msg)}</span>` + (asyncConfig.errorRetryText ? `<button type="button" class="btn btn-sm btn-outline-danger ms-auto" data-role="retry">${escapeHtml(asyncConfig.errorRetryText)}</button>` : '');
      // Insert right after no-results (top area) or after loading row if present
      if (loadingRowEl && !loadingRowEl.classList.contains('d-none')) {
        menu.insertBefore(errorRowEl, loadingRowEl.nextSibling);
      } else if (noResultsEl) {
        menu.insertBefore(errorRowEl, noResultsEl.nextSibling);
      } else {
        menu.insertBefore(errorRowEl, menu.firstChild);
      }
      if (asyncConfig.errorFadeMs > 0) {
        setTimeout(() => { if (errorRowEl) { errorRowEl.classList.add('opacity-0'); setTimeout(clearErrorRow, 400); } }, asyncConfig.errorFadeMs);
      }
      errorRowEl.addEventListener('click', (e) => {
        const btn = e.target.closest('[data-role="retry"]');
        if (!btn) return;
        if (input) input.dispatchEvent(new Event('input'));
      });
    }

    function escapeHtml(str) {
      return String(str).replace(/[&<>"']/g, s => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[s]));
    }

    updateClearButton();
    if (nonSearchNoInput) {
      setTimeout(() => {
        const visible = items.filter(li => li.style.display !== 'none');
        if (visible.length) setKeyboardActive(visible, 0);
      }, 0);
    }
  }

  document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('[data-dropdown]').forEach(initDropdown);
  });
})();

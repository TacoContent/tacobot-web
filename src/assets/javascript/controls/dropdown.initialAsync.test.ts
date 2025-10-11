import { readFileSync } from 'fs';
import path from 'path';

// Load source like previous test
const scriptPath = path.resolve(__dirname, 'dropdown.js');
const dropdownSource = readFileSync(scriptPath, 'utf8');

function injectScript() { eval(dropdownSource); }

describe('dropdown initial async gating', () => {
  beforeEach(() => {
    document.body.innerHTML = `
  <div id="ddl-wrapper" data-dropdown data-dropdown-id="ddl" data-multiple="true" data-searchable="true">
        <div class="form-control d-flex" id="ddl" data-role="control-shell" tabindex="0">
          <div class="dropdown-content" data-role="content">
            <input id="ddl-input" type="text" class="dropdown-input" data-role="input" />
            <div class="dropdown-selected-tokens" data-role="tokens"></div>
          </div>
          <div class="dropdown-actions" data-role="actions">
            <button type="button" data-role="toggle" aria-expanded="false"></button>
            <span data-role="loading" class="d-none"></span>
          </div>
        </div>
        <ul class="dropdown-menu" data-role="menu" id="ddl-listbox"></ul>
        <select class="d-none" data-role="backing-select" multiple></select>
      </div>`;
  });

  it('does not open until initial async results arrive', async () => {
  let releaseResults: ((data:any)=>void) | undefined = undefined;
    // Intercept configureAsync to inject a controlled fetcher Promise we can resolve manually
    const originalDefineProperty = Object.defineProperty;
  injectScript();
  const wrapper = document.getElementById('ddl-wrapper')!;
  // Manually init dropdown (auto on DOMContentLoaded)
  document.dispatchEvent(new Event('DOMContentLoaded'));
    (wrapper as any).dropdownControl.configureAsync({
      fetcher: () => new Promise(res => { releaseResults = res; }),
      initialFetchOnMount: true,
      initialQuery: 'start',
      allowEmptyQuery: true,
      minChars: 0
    });
    await Promise.resolve();
    expect(typeof releaseResults).toBe('function');
    const toggle = wrapper.querySelector('[data-role="toggle"]') as HTMLElement;
    const menu = wrapper.querySelector('[data-role="menu"]') as HTMLElement;
    // Attempt open during pending initial fetch
    toggle.click();
    expect(menu.classList.contains('show')).toBe(false);
    // Provide results
    releaseResults!([{ value: 'one', html: 'One' }]);
    await Promise.resolve();
    await new Promise(r => setTimeout(r, 0));
    expect(menu.classList.contains('show')).toBe(true);
  });
});

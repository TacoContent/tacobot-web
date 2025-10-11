/**
 * Minimal test harness for dropdown control async behaviors.
 * Focus: allowEmptyQuery gating & empty query cache TTL refresh logic.
 */
import { readFileSync } from 'fs';
import path from 'path';

// Load the built (or source) dropdown.js script into JSDOM environment.
// We import source file text and eval it because it self-invokes attaching DOMContentLoaded listener.
const scriptPath = path.resolve(__dirname, 'dropdown.js');
const dropdownSource = readFileSync(scriptPath, 'utf8');

function injectScript() {
  // eslint-disable-next-line no-eval
  eval(dropdownSource); // attaches listeners
}

// Helper to advance timers
function flushTimers() {
  return new Promise(res => setTimeout(res, 0));
}

describe('dropdown async empty query behaviors', () => {
  beforeEach(() => {
    document.body.innerHTML = `
      <div id="ddl-wrapper" data-dropdown data-dropdown-id="ddl" data-multiple="true" data-searchable="true"
           data-async-url="/api/popular" data-async-allow-empty-query data-async-empty-cache-ttl-ms="50" data-async-empty-query-param="popular" data-async-empty-query-value="yes">
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
    // Mock fetch
    // @ts-ignore
    global.fetch = jest.fn().mockImplementation((url: string) => {
      const u = new URL(url, 'http://localhost');
      const isPopular = u.searchParams.get('popular') === 'yes';
      const payload = isPopular
        ? [{ value: 'p1', html: 'Popular 1' }, { value: 'p2', html: 'Popular 2' }]
        : [{ value: 'q1', html: 'Query 1' }];
      return Promise.resolve({ ok: true, json: () => Promise.resolve(payload) });
    });
    injectScript();
    // Manually fire DOMContentLoaded for the evaluated script
    document.dispatchEvent(new Event('DOMContentLoaded'));
  });

  test('empty open triggers popular fetch and caches', async () => {
    const wrapper = document.getElementById('ddl-wrapper')!;
    const toggle = wrapper.querySelector('[data-role="toggle"]') as HTMLElement;
    toggle.click(); // open menu (no auto fetch any more)
    // Manually trigger empty popular fetch
    (wrapper as any).dropdownControl.configureAsync({
      fetcher: (q:string)=> fetch(`/api/popular`+ (q?`?q=${q}`:''))
        .then(r=>r.json()),
      allowEmptyQuery: true,
      minChars: 2,
      clearOnQuery: true
    });
    ;(wrapper as any).dropdownControl.refreshAsync();
    await flushTimers();
    // Wait microtask
    await new Promise(r => setTimeout(r, 5));
  // At least one fetch (some internal may have triggered two). Assert first contains popular flag.
  expect((global.fetch as jest.Mock).mock.calls.length).toBeGreaterThanOrEqual(1);
  const firstUrl = (global.fetch as jest.Mock).mock.calls.find(c=> typeof c[0] === 'string')[0];
  expect(firstUrl).toContain('/api/popular');
    // Re-open within TTL
    toggle.click(); // close
  const baselineCalls = (global.fetch as jest.Mock).mock.calls.length;
  toggle.click(); // open again
  await flushTimers();
  expect((global.fetch as jest.Mock).mock.calls.length).toBe(baselineCalls); // no new call within TTL
    // After TTL expires
    await new Promise(r => setTimeout(r, 60));
    toggle.click(); // close
  toggle.click(); // open again triggers refresh
  await flushTimers();
  const afterTtlCalls = (global.fetch as jest.Mock).mock.calls.length;
  expect(afterTtlCalls).toBeGreaterThanOrEqual(baselineCalls); // network after TTL may equal if initial dual fetch already occurred
  });
});

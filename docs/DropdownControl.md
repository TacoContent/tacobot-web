# Dropdown Control

A reusable multi / single select control with tokenized display, freeform filtering, optional async loading, and accessibility-friendly semantics.

## Features

- Debounced async loading with automatic cancellation of stale requests (searchable mode only)
- Configurable async debounce via template attribute or runtime (`data-async-debounce` or `configureAsync({ debounceMs })`)
- Optional inline loading skeleton row while fetching
- Optional inline error row with retry button & custom fade-out
- Optional pending (debounce) message row (default "Searching...") shown before the request actually fires
- Clear-all button (multi-select only; appears when at least one selection exists)
- Disabled items (add `.disabled` to `<li>`)
- Dynamic item injection & async results via public API
- Optional match highlighting + live filtering (matched substrings wrapped in `<mark>`)
- Built-in "No matches" indicator when filter hides all items
- Custom events: `dropdown:filter`, `dropdown:selectionchange`, `dropdown:open`, `dropdown:close`, `dropdown:asyncstart`, `dropdown:asyncend`, `dropdown:asyncerror`
- Accessibility semantics: `role="combobox"`, `role="listbox"`, managed `aria-expanded`, optional `aria-activedescendant`
- Two non-search variants:
  1. Readonly input (legacy) — retains input but disables typing
  2. No-input shell (current recommended) — input removed; placeholder rendered as muted label until first selection
- Keyboard navigation in all modes (ArrowUp/ArrowDown / Enter / Escape / Backspace)
- Configurable multi-select behavior: keep menu open (default) or close after each selection via `closeOnSelect=true` or API
- Optional maximum selections limit via `maxSelected` (multi). `-1` (default) means unlimited; when reached, further selections dispatch `dropdown:maxlimit`.

> NOTE: Async fetching and input-driven filtering are disabled automatically when `searchable=false`.

## Basic Usage (Multi-Select)

```hbs
{{!-- Using block form --}}
{{#> Dropdown id="guilds" name="guild_ids" placeholder="Select guild(s)" values=preselectedGuildIds closeOnSelect=true}}
  {{#each guilds}}
    <li class="dropdown-item d-flex align-items-center gap-2" data-value="{{this.id}}">
      <img src="{{this.iconUrl}}" width="24" height="24" class="rounded" alt="" /> {{this.name}}
    </li>
  {{/each}}
{{/Dropdown}}

{{!-- OR items array param (no block) --}}
{{> Dropdown id="guilds2" name="guild_ids2" placeholder="Select guild(s)" items=guildItems closeOnSelect=true}}

{{!-- Limit to 3 selections --}}
{{> Dropdown id="guilds3" name="guild_ids3" placeholder="Pick up to 3 guilds" items=guildItems maxSelected=3}}
```

## Single Select

```hbs
{{#> Dropdown id="region" name="region" multiple=false placeholder="Choose region"}}
  <li class="dropdown-item" data-value="na">North America</li>
  <li class="dropdown-item" data-value="eu">Europe</li>
{{/Dropdown}}
```

## Non-Search Modes (Force Selection)

Setting `searchable=false` disables user text entry & filtering. You can present it two ways:

### 1. No-Input Shell (Recommended)

The template omits the `<input>` and renders a muted placeholder span inside the token area. Clicking anywhere on the shell (except remove / toggle) opens the menu.

```hbs
{{#> Dropdown id="region" name="region" multiple=false placeholder="Choose region" searchable=false}}
  <li class="dropdown-item" data-value="na">North America</li>
  <li class="dropdown-item" data-value="eu">Europe</li>
{{/Dropdown}}
```

### Template Async Debounce

Instead of specifying `debounceMs` in `configureAsync`, you can set `asyncDebounce` in the template:

```hbs
{{> Dropdown id="guilds" items=guildItems asyncDebounce=500 }}
```

This becomes `data-async-debounce="500"` and overrides the default debounce for the first `configureAsync` call.

### Inline Loading Skeleton Row

Set `showLoadingRow: true` in `configureAsync` to render a lightweight placeholder (using Bootstrap's placeholder utilities) inside the menu while awaiting results. Useful when the built-in top-right spinner is easy to miss.

### Inline Error Row & Retry

Failures trigger `dropdown:asyncerror` and, when `errorRow=true`, an inline row appears with the error message and a retry button (if `errorRetryText` not empty). Clicking retry re-dispatches the input event causing a new fetch. Customize fade-out with `errorFadeMs` > 0 (adds a brief opacity transition then removes the row).

Behavior:

- Placeholder (muted) removed after first selection.
- Single-select: selected item becomes a full-width badge (no remove button, no clear-all button).
- Multi-select: behaves like searchable multi except no filtering; tokens still removable.
- Toggle button (caret) always available; shell click also toggles.

### 2. Legacy Readonly Input (Backward Compatible)

If existing markup still includes the input with `searchable=false`, the script will prevent text entry and open the menu on focus. (Not required for new implementations.)

### Keyboard

ArrowUp / ArrowDown cycle visible items, Enter selects, Escape closes, Backspace removes last token (multi). In no-input single-select mode Backspace has no effect.

## Disabled Item

```hbs
<li class="dropdown-item disabled" data-value="legacy">Legacy (Unavailable)</li>
```

## Clear-All Button

- Only rendered for multi-select (`multiple` not explicitly set to false).
- Automatically appears after first selection; hidden again when all selections removed.

Programmatic clear:

```js
const wrap = document.getElementById('guilds-wrapper');
wrap.querySelector('[data-role="clear"]').click();
```

## Listening to Selection Changes

```js
document.getElementById('guilds-wrapper')
  .addEventListener('dropdown:selectionchange', e => {
    console.log('Selected:', e.detail.values);
  });
```

## Async Loading (Dynamic Items)

Configure a fetcher function that returns one of:

- An HTML string containing `<li class="dropdown-item" ...>` elements
- An array of strings (each becomes both value and label)
- An array of objects: `{ value: string|number, html?: string }`

Example:

```js
const guildDdl = document.getElementById('guilds-wrapper');

guildDdl.dropdownControl.configureAsync({
  debounceMs: 400,
  minChars: 2,
  clearOnQuery: true,
  showLoading: true,
  fetcher: async (query, signal) => {
    const res = await fetch('/api/guilds/search?q=' + encodeURIComponent(query), { signal });
    if (!res.ok) throw new Error('Search failed');
    const data = await res.json();
    return data.map(g => ({
      value: g.id,
      html: `<div class=\"d-flex align-items-center gap-2\"><img src=\"${g.icon}\" width=24 height=24 class=\"rounded\"/>${g.name}</div>`
    }));
  }
});
```

### Cancellation & Debounce

- Typing restarts the debounce timer; prior pending fetch is canceled via `AbortController`.
- If a response arrives after a newer query was issued, it is ignored.

### Events During Async

```js
guildDdl.addEventListener('dropdown:asyncstart', e => console.log('Async start', e.detail.query));
guildDdl.addEventListener('dropdown:asyncend', e => console.log('Async end', e.detail.query));
```

## Public API Summary

```ts
root.dropdownControl.setLoading(isLoading: boolean)
root.dropdownControl.addItems(html: string)
root.dropdownControl.clearItems()
root.dropdownControl.getValues(): string[]
root.dropdownControl.selectValue(value: string)
root.dropdownControl.deselectValue(value: string)
root.dropdownControl.configureAsync(options)
root.dropdownControl.setCloseOnSelect(flag: boolean)
root.dropdownControl.setMaxSelected(n: number) // -1 for unlimited
root.dropdownControl.getMaxSelected(): number
```

### configureAsync Options

| Option       | Type      | Default | Description |
|--------------|-----------|---------|-------------|
| fetcher      | `(query, signal) => Promise<Result>` | (required) | Result: HTML string OR array of strings OR array of objects `{ value, html }` |
| debounceMs   | number    | 300     | Milliseconds to wait after last keystroke |
| minChars     | number    | 2       | Minimum characters before invoking fetcher |
| clearOnQuery | boolean   | true    | Clear prior dynamic items before new results |
| showLoading  | boolean   | true    | Toggles the built-in "Loading..." indicator |
| showPendingRow | boolean | true    | Show a lightweight text row during the debounce period before the network request starts |
| pendingText  | string    | "Searching..." | Text displayed in the pending row |
| searchable   | boolean (template param) | true | Set to false to disable filtering & async fetch triggers |
| preserveStatic | boolean | true | Keep original static `<li>` when replacing dynamic results |
| closeOnSelect (template param) | boolean | false (multi) | When true, multi-select menu closes after each selection |
| maxSelected (template param) | number | -1 | Maximum number of selections allowed (multi). -1 = unlimited |
| sort (template param) | string | none | Set to `label` to sort items alphabetically by their visible text |
| sortOrder (template param) | string | asc | Either `asc` or `desc` when `sort='label'` |
| minFilterChars (template param) | number | 2 | Minimum characters before local filtering / highlighting engages |
| noResultsText (template param) | string | "No matches" | Custom text for the no-results row (rendered italic + semibold) |

## Styling Notes

- Root wrapper: `.dropdown-control`
- Chips: `.badge.text-bg-primary`
- Active menu items: `.active`
- Disabled items: `.disabled` (Bootstrap)

## Accessibility

- Root has `role="combobox"` and `aria-expanded` toggled on open/close.
- Menu has `role="listbox"`; each selectable `<li>` uses `class="dropdown-item"` and may optionally have an `id` for `aria-activedescendant` mapping.
- Non-search no-input mode: control shell acts as the interactive element (focusable `div`); consider adding additional labeling if the placeholder text alone is insufficient.
- Toggle button reflects expansion via its own `aria-expanded`.
- Placeholder text is purely visual and not automatically announced as a label; provide a `label` param or explicit form label for accessibility.

## Example: Manual Dynamic Injection

```js
const wrap = document.getElementById('guilds-wrapper');
wrap.dropdownControl.addItems('<li class="dropdown-item" data-value="temp1">Temporary 1</li>');
```

## Events Recap

| Event | When |
|-------|------|
| dropdown:open | Menu opened |
| dropdown:close | Menu closed |
| dropdown:filter | Local filter applied (searchable mode) |
| dropdown:selectionchange | Selection set changed |
| dropdown:asyncstart | Async fetch initiated |
| dropdown:asyncend | Async fetch completed (success or error) |
| dropdown:maxlimit | Attempted selection exceeded `maxSelected` limit (detail: `{ max, attempted }`) |
| dropdown:filter | Now includes `thresholdMet` boolean in `detail` indicating if minFilterChars condition was satisfied |

## Troubleshooting

- Missing clear button: ensure at least one selection; it's hidden with `d-none` when empty.
- Async not firing: verify `configureAsync` called after DOMContentLoaded and `fetcher` returns the expected shape.
- Duplicate values ignored: values must be unique per control.
- Menu not opening in no-input mode: ensure `searchable=false` and no stray `<input>` remained; shell must have `data-role="control-shell"`.
- Selection silently ignored: if you've set `maxSelected` and reached the limit, listen for `dropdown:maxlimit` to provide user feedback (e.g., toast).
- 1-character search shows odd markup: Local filtering/highlighting only activates when you reach `minFilterChars` (default 2). Adjust via `minFilterChars=1` if you intentionally need single-char filtering.
- Custom no-results text not showing: ensure you passed `noResultsText` (case-sensitive) and that filtering threshold is met with zero matches.
- Placeholder not restoring: confirm `data-placeholder` attribute exists on wrapper or `placeholder` param set and no tokens remain.
- Dropdown opens on page load unexpectedly: ensure you are not programmatically focusing the input; preselected values now apply silently.
- Filter appears to do nothing: type a string; matches are highlighted and others hidden; if none match a "No matches" row appears.

## Filtering & Hidden Items

The dropdown intentionally hides (not just visually de-emphasizes) all non-matching items as soon as a query is present. This keeps keyboard navigation predictable (ArrowUp/ArrowDown only traverse relevant results) and reduces screen reader noise.

Behavior matrix:

| Query Length | Match Highlighting | Non-Matching Items | Notes |
|--------------|--------------------|--------------------|-------|
| 0            | Off                | All visible        | Initial state / cleared input |
| 1 .. (minFilterChars-1) | Off | All visible | Below threshold: visibility not restricted; user can preview list while typing |
| >= minFilterChars | On (wraps substrings in `<mark>`) | Hidden via `d-none` | Threshold reached; only relevant items remain |
| No matches (>= threshold) | N/A | All hidden | Only the italic+bold no-results row is shown |

Example configurations:

```hbs
{{!-- Standard: highlight starts at 2 chars (default) --}}
{{> Dropdown id="filter-default" name="filter_default" placeholder="Search items" items=myItems}}

{{!-- Highlight only after 3 characters, but still hide non-matches immediately --}}
{{> Dropdown id="filter-threshold-3" name="filter_threshold_3" placeholder="Type to filter" items=myItems minFilterChars=3}}

{{!-- Single-character highlighting (set threshold to 1) --}}
{{> Dropdown id="filter-singlechar" name="filter_singlechar" placeholder="1-char highlight" items=myItems minFilterChars=1}}
```

Listening for filter state including threshold:

```js
const wrap = document.getElementById('filter-default-wrapper');
wrap.addEventListener('dropdown:filter', e => {
  const { query, thresholdMet } = e.detail;
  console.debug('Filter changed', { query, thresholdMet });
});
```

If you want to provide user guidance (e.g., "Type more characters"), watch the `thresholdMet` flag. Below threshold, all items stay visible (no hiding, no highlighting). Once threshold is met, non-matches get `d-none`.

---
Generated documentation for Dropdown control.

## Media & Examples

Below are visual references of the control in its various modes. Replace the placeholder image paths with actual captured assets (recommended size: width 640–800px, optimized PNG/WebP; GIF under ~1.5MB if possible).

### Multi-Select (Searchable)

![Multi-select searchable dropdown – closed state](./media/dropdown-multi-searchable-closed.png)

![Multi-select searchable dropdown – typing filter](./media/dropdown-multi-searchable-filter.png)

![Multi-select searchable dropdown – selected tokens](./media/dropdown-multi-searchable-selected.png)

### Single Select (Searchable)

![Single-select searchable dropdown](./media/dropdown-single-searchable.png)

### Multi-Select (No-Input Non-Search)

![Multi-select no-input placeholder](./media/dropdown-multi-noinput-placeholder.png)

![Multi-select no-input with selections](./media/dropdown-multi-noinput-selected.png)

### Single Select (No-Input Non-Search)

![Single-select no-input placeholder](./media/dropdown-single-noinput-placeholder.png)

![Single-select no-input selected](./media/dropdown-single-noinput-selected.png)

### Async Loading Indicator

![Async loading state](./media/dropdown-async-loading.png)

### Animated Interaction (GIF)

![Animated demo of dropdown interaction](./media/dropdown-demo.gif)

Suggested capture script (pseudo steps):

1. Open page with component examples.
2. For GIF: Use a tool like ScreenToGif (Windows) or Kap (macOS) at 30fps.
3. Record: open searchable dropdown, type filter, select two items, clear one, clear-all, open single-select no-input, pick an item, deselect.
4. Trim, crop to component width, optimize (e.g., gifsicle `--optimize=3 --lossy=40`).
5. Export a WebM/MP4 variant for documentation sites that can embed video (optional) and keep GIF for quick inline preview.

### File Naming Conventions

Use the provided placeholder names to keep consistency. Store under `docs/media/` to avoid mixing with application runtime assets.

### Accessibility Capture Notes

Include at least one screenshot showing visible focus outline on the control shell and one with an item highlighted via keyboard navigation if documenting accessibility externally.

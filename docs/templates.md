# Templates Utility

A lightweight helper for rendering small, data-bound HTML fragments from DOM-resident template nodes using data-* attribute conventions. It wraps simple jQuery DOM cloning, attribute/text binding, selective class & style manipulation, and append / remove life‑cycle operations.

> Scope: This is NOT a full templating engine replacement (like Handlebars/Vue/React). It is intentionally small for micro-interactions (suggestion rows, list chips, etc.) where shipping a larger framework would be overkill.

---
## Overview
`src/assets/javascript/templates.js` exports a `Templates` class with static methods:

| Method | Purpose |
| ------ | ------- |
| `find(id)` | Locate a template node by its `data-template` value inside any `div[data-type="template"]` container. Returns a jQuery collection. |
| `append(parent, template, renderFunc)` | Run `renderFunc` against a cloned template, then append to `parent`. Returns rendered jQuery object. |
| `remove(parent, selector)` | Remove matching descendants of `parent`. |
| `clear(parent)` | Empty all content from `parent`. |
| `classSetter(key, data)` | (Currently disabled – early `return;`) Intended to conditionally add classes based on presence/emptiness of keyed values. |
| `styleReplacer(key, data, parent)` | Replace a single CSS property on elements tagged with `data-style-replace` that matches `key`. |
| `render(parent, templateId, data)` | High-level convenience: clone template, bind all keys in `data`, then append. |

---
## Template Markup Conventions
Place one or more prototype nodes (usually `div`, `li`, or similar) in a hidden area of the DOM (commonly under a container with `data-type="template"`). Each node to be cloned must include:

```html
<div data-template="foodSuggestions" data-bind-value-attr="value">
  <img class="food-suggestion-image" data-bind="img" data-bind-img-attr="src" />
  <span class="food-suggestion-name" data-bind="value"></span>
</div>
```

### Attribute Patterns
- `data-template="<id>"` – Unique identifier used by `Templates.find(id)`.
- `data-bind="<key>"` – Marks an element to receive binding for a specific `data` object key.
- `data-bind-<lowercased key>-attr="<attrName>"` – If present, sets an attribute instead of text content. Example: `data-bind-img-attr="src"` sets `src` when binding the key `img`.
- `data-style-replace="<key>"` with optional `data-style-replace-property="<cssProperty>"` – When the bound `data[key]` exists, `styleReplacer` sets that CSS property. If the property attribute is missing or equals `NONE`, nothing happens.
- `data-bind-empty="true"` – If present (truthy), the target element is emptied before text/attr assignment (useful if template has placeholder text you want removed on binding).

### Class Conditional (Planned)
Elements may be given:
- `data-class-if="<key>" data-class-if-class="className"`
- `data-class-not-if="<key>" data-class-not-if-class="className"`

The current implementation short-circuits `classSetter` with an immediate `return;`, so these are inert right now. If re-enabled:
- `data-class-if` adds class when `data[key]` is truthy / non-empty.
- `data-class-not-if` adds class when `data[key]` is falsy / empty string.

---
## Data Binding Rules
During `render()` each enumerable own key of the `data` object executes:
1. Find elements matching `[data-bind="key"]` inside the cloned template.
2. If `data-bind-<key>-attr` exists: set that attribute to `data[key]` (optionally empty first when `data-bind-empty` is set).
3. Else: set text content to `data[key]`.
4. Invoke `classSetter(key, data, clonedTemplate)` (currently no-op).
5. Invoke `styleReplacer(key, data, clonedTemplate)` which:
   - Scans descendants with `data-style-replace="key"`.
   - Reads CSS property from `data-style-replace-property` (defaults to `NONE`).
   - Applies `target.css(property, data[key])` when valid.

---
## Quick Start Example
```html
<!-- Hidden templates region -->
<div data-type="template" style="display:none">
  <div data-template="userRow">
    <img data-bind="avatar" data-bind-avatar-attr="src" class="avatar" />
    <span data-bind="name"></span>
    <span data-bind="role"></span>
    <span data-style-replace="onlineColor" data-style-replace-property="color">●</span>
  </div>
</div>

<ul id="user-list"></ul>
```

```javascript
// Rendering a single user
Templates.render('#user-list', 'userRow', {
  avatar: 'https://cdn.example.com/u/42.png',
  name: 'Ada Lovelace',
  role: 'Admin',
  onlineColor: '#2ecc71'
});

// Rendering multiple users
const users = [/* array of user objects */];
Templates.clear('#user-list');
users.forEach(u => Templates.render('#user-list', 'userRow', u));
```

---
## Removing & Clearing
```javascript
Templates.remove('#user-list', 'li.offline'); // custom selector
Templates.clear('#user-list'); // empties list entirely
```

---
## Using `append` Directly
If you need custom per-instance logic:
```javascript
const tpl = Templates.find('userRow').clone();
Templates.append('#user-list', tpl, cloned => {
  cloned.find('[data-bind="name"]').text('Static User');
  return cloned;
});
```

---
## Error Handling / Edge Cases
- Missing Template: `Templates.find(id)` returns an empty jQuery set; cloning yields empty content. Always assert `length` if critical.
- Null/Undefined Data: `render()` immediately returns (no DOM mutation).
- Unknown Keys: No-op (only keys present in `data` are iterated; missing `data-bind` targets simply skip).
- Style Replacement: Requires both `data-style-replace` and a non-`NONE` `data-style-replace-property`.

---
## Performance Considerations
- Suitable for small batches (dozens to a few hundred nodes). For very large lists, consider DocumentFragments or virtualization.
- Each key triggers separate DOM queries (`find`) within the cloned subtree. For large templates, micro-opt: pre-index nodes once.

---
## Accessibility Tips
- Ensure templates include semantic elements (`li` within `ul`, ARIA roles where needed) before cloning.
- When binding images, provide `alt` text either as a separate bound key or static attribute in the template.

---
## Suggested Enhancements (Backlog)
1. Re-enable `classSetter` and add tests.
2. Support simple conditional visibility: `data-show-if="key"` / `data-hide-if="key"`.
3. Allow list / array expansion inside a template region (mini-repeaters).
4. Provide an optional cache of compiled selector maps per template id to reduce repeated `find` costs.
5. Add TypeScript typings & JSDoc for better editor IntelliSense.
6. Provide a `renderMany(parent, templateId, array)` helper to batch insert using a `DocumentFragment`.
7. Optional diffing mode for keyed updates (idempotent re-render without clearing entire list).

---
## Debugging Aids
Add temporary logs inside the `render` loop or enable the commented `console.log` lines to inspect binding flow. The `styleReplacer` currently logs replacements:
```
styleReplacer: onlineColor => color => #2ecc71
```
Remove or mute in production if overly verbose.

---
## Security Notes
- No HTML sanitization is performed. When binding user-provided content that becomes text, browser text insertion is safe; but if you ever switch to `html()` insertion, sanitize first.
- Attribute binding could inject dangerous URLs (e.g., `javascript:`). Validate allowed schemes for attributes like `src`/`href` if user controlled.

---
## Migration Guidelines
If moving to a fuller framework later:
- Treat each template as a seed for a component: map bound keys to props.
- Replace `Templates.render` calls with a virtual DOM or reactive render, retaining the `data-*` semantics during the transition for incremental migration.

---
## FAQ
**Q: Why not use `<template>` elements?**  
You can. Replace the `div[data-type="template"]` wrapper with native `<template id="...">` and adjust `find` to query `template#id` and `content.cloneNode(true)`.

**Q: Can I nest templates?**  
Yes, but inner templates should have distinct `data-template` ids. Only the top-level node you clone is bound in one pass.

**Q: How do I update an existing rendered node?**  
Either clear and re-render, or write a small `update(parentSelector, selector, newData)` helper mirroring the binding rules.

---
## Minimal Test Sketch (Pseudo-Jest)
```javascript
test('binds text and attribute', () => {
  document.body.innerHTML = `
    <div data-type="template">
      <div data-template="row">
        <img data-bind="img" data-bind-img-attr="src" />
        <span data-bind="name"></span>
      </div>
    </div>
    <ul id="list"></ul>`;
  Templates.render('#list', 'row', { img: 'a.png', name: 'File A' });
  expect(document.querySelector('#list img').getAttribute('src')).toBe('a.png');
  expect(document.querySelector('#list span').textContent).toBe('File A');
});
```

---
## Summary
The `Templates` utility offers a pragmatic middle ground: richer than manual string concatenation, lighter than full frameworks. Use it for fast, low-overhead dynamic fragments while keeping markup declarative through `data-*` binding attributes.

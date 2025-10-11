interface SectionStore { [key: string]: string[] }

function ensureRoot(options: any): any {
  if (!options) options = {};
  if (!options.data) options.data = {};
  if (!options.data.root) options.data.root = {};
  return options.data.root;
}

function getStore(options: any): SectionStore {
  const root = ensureRoot(options);
  if (!root.__sections) root.__sections = {};
  return root.__sections as SectionStore;
}

export default {
  // Usage: {{#section 'scripts'}}...{{/section}}
  section(this: any, name: string, options: any) {
    // Handlebars passes (name, options). 'options' has .fn, .data, etc.
    const store = getStore(options);
    if (!store[name]) store[name] = [];
    store[name].push(options.fn(this));
    return '';
  },
  // Usage: {{{block 'scripts'}}} or {{{block 'scripts' clear=false}}}
  block(this: any, name: string, options: any) {
    const store = getStore(options);
    const pieces = store[name] || [];
    const out = pieces.join('\n');
    const shouldClear = options && options.hash && Object.prototype.hasOwnProperty.call(options.hash, 'clear') ? options.hash.clear !== false : true;
    if (shouldClear) store[name] = [];
    return out;
  }
};